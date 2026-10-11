import React, { useEffect, useState, useMemo } from 'react';
import API from '../services/api';
import Navbar from './Navbar';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Flame,
  ArrowUpRight,
  User,
  Calendar,
  Layers,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  X,
  FileText,
  Tag,
  Check,
  LayoutGrid,
  List
} from 'lucide-react';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Tab: 'my_requests' | 'assigned_to_me'
  const [activeTab, setActiveTab] = useState('my_requests');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Create Request Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
  });

  // Ticket Details Modal state
  const [selectedTicket, setSelectedTicket] = useState(null);

  const toast = useToast();
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : {};

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resMy, resAssigned] = await Promise.all([
        API.get('/requests'),
        API.get('/requests/assigned').catch(() => ({ data: [] })),
      ]);
      setRequests(resMy.data || []);
      setAssignedRequests(resAssigned.data || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      toast.error('Failed to sync ticket data from backend', 'Sync Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning('Please enter a request title', 'Required Field');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/requests', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
      });

      toast.success(`Request #${res.data.id || ''} created successfully!`, 'Request Dispatched');
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
      });
      setIsModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to submit request:', err);
      const msg = err.response?.data?.message || 'Could not submit request';
      toast.error(msg, 'Creation Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await API.put(`/requests/${requestId}/status?status=${newStatus}`);
      toast.success(`Ticket #${requestId} status set to ${newStatus}`, 'Status Updated');
      fetchDashboardData();
    } catch (err) {
      console.error('Status update failed:', err);
      const msg = err.response?.data?.message || 'Failed to update ticket status';
      toast.error(msg, 'Update Error');
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = requests.length;
    const open = requests.filter((r) => r.status === 'OPEN').length;
    const inProgress = requests.filter((r) => r.status === 'IN_PROGRESS').length;
    const resolved = requests.filter((r) => r.status === 'RESOLVED').length;
    const assignedCount = assignedRequests.length;
    return { total, open, inProgress, resolved, assignedCount };
  }, [requests, assignedRequests]);

  // Filtered lists
  const currentList = activeTab === 'my_requests' ? requests : assignedRequests;

  const filteredTickets = useMemo(() => {
    return currentList.filter((item) => {
      const matchesSearch =
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(item.id).includes(searchQuery);

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [currentList, searchQuery, statusFilter, priorityFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flexGrow: 1, padding: '32px 0 64px 0' }}>
        <div className="container">
          {/* Header Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h1
                  style={{
                    fontSize: '1.9rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  Welcome back, {user.fullName || 'Engineer'}
                </h1>
                <span className="badge badge-role-EMPLOYEE">Employee Workspace</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Track personal service requests, dispatch new operational tickets, and resolve assigned tasks.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleRefresh}
                className="btn btn-outline"
                style={{ padding: '10px 14px' }}
                title="Refresh Tickets"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
                style={{ padding: '10px 20px' }}
              >
                <Plus size={18} />
                <span>Create Request</span>
              </button>
            </div>
          </div>

          {/* KPI Statistics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            {/* Total Submitted */}
            <div
              className="glass-card"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8',
                }}
              >
                <Layers size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  My Submissions
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
                  {stats.total}
                </div>
              </div>
            </div>

            {/* Open / Triage */}
            <div
              className="glass-card"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Open Tickets
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1.2 }}>
                  {stats.open}
                </div>
              </div>
            </div>

            {/* In Progress */}
            <div
              className="glass-card"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(251, 191, 36, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                }}
              >
                <Clock3 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  In Progress
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1.2 }}>
                  {stats.inProgress}
                </div>
              </div>
            </div>

            {/* Resolved */}
            <div
              className="glass-card"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(52, 211, 153, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Resolved
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', lineHeight: 1.2 }}>
                  {stats.resolved}
                </div>
              </div>
            </div>

            {/* Assigned to Me */}
            <div
              className="glass-card"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                border: '1px solid rgba(168, 85, 247, 0.25)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc',
                }}
              >
                <User size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Assigned To Me
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c084fc', lineHeight: 1.2 }}>
                  {stats.assignedCount}
                </div>
              </div>
            </div>
          </div>

          {/* Main Card: Tabbed Views & Filter Bar */}
          <div className="glass-card" style={{ padding: '24px', overflow: 'hidden' }}>
            {/* Top Navigation Row: Tabs & Search Filters */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '20px',
                marginBottom: '20px',
              }}
            >
              {/* Tabs */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('my_requests')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: activeTab === 'my_requests' ? '#ffffff' : 'var(--text-secondary)',
                    background:
                      activeTab === 'my_requests'
                        ? 'rgba(99, 102, 241, 0.2)'
                        : 'rgba(255, 255, 255, 0.03)',
                    border:
                      activeTab === 'my_requests'
                        ? '1px solid rgba(99, 102, 241, 0.4)'
                        : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 150ms',
                  }}
                >
                  <FileText size={16} />
                  <span>My Requests ({requests.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('assigned_to_me')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: activeTab === 'assigned_to_me' ? '#ffffff' : 'var(--text-secondary)',
                    background:
                      activeTab === 'assigned_to_me'
                        ? 'rgba(168, 85, 247, 0.2)'
                        : 'rgba(255, 255, 255, 0.03)',
                    border:
                      activeTab === 'assigned_to_me'
                        ? '1px solid rgba(168, 85, 247, 0.4)'
                        : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 150ms',
                  }}
                >
                  <User size={16} />
                  <span>Assigned To Me ({assignedRequests.length})</span>
                </button>
              </div>

              {/* View Mode Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    background: viewMode === 'table' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: viewMode === 'table' ? '#818cf8' : 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  title="Table View"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    background: viewMode === 'cards' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: viewMode === 'cards' ? '#818cf8' : 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  title="Grid Cards View"
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
                marginBottom: '24px',
              }}
            >
              {/* Search Bar */}
              <div className="input-wrapper" style={{ flexGrow: 1, minWidth: '240px' }}>
                <span className="input-icon-left">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search by ID, title, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input has-left-icon"
                  style={{ padding: '10px 14px 10px 38px', fontSize: '0.88rem' }}
                />
              </div>

              {/* Status Filter */}
              <div style={{ minWidth: '150px' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input form-select"
                  style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div style={{ minWidth: '150px' }}>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="form-input form-select"
                  style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                >
                  <option value="ALL">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            {/* Content: Loading, Empty, or Tickets */}
            {loading ? (
              <div
                style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px auto', color: '#818cf8' }} />
                <div>Retrieving workflow tickets...</div>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div
                style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px dashed var(--border-subtle)',
                }}
              >
                <FolderOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px auto' }} />
                <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '8px' }}>
                  No tickets found
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                  {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                    ? 'No requests match your current filters. Try resetting search criteria.'
                    : activeTab === 'my_requests'
                    ? 'You have not submitted any requests yet. Dispatch a new ticket to get started.'
                    : 'No requests are currently assigned to you. When an administrator routes a ticket to you, it will appear here.'}
                </p>
                {activeTab === 'my_requests' && (
                  <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
                    <Plus size={16} />
                    <span>Create New Request</span>
                  </button>
                )}
              </div>
            ) : viewMode === 'table' ? (
              /* TABLE VIEW */
              <div className="table-responsive">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>ID</th>
                      <th>Ticket Title</th>
                      <th style={{ width: '130px' }}>Priority</th>
                      <th style={{ width: '150px' }}>Status</th>
                      {activeTab === 'my_requests' ? (
                        <th style={{ width: '190px' }}>Assigned Specialist</th>
                      ) : (
                        <th style={{ width: '190px' }}>Reported By</th>
                      )}
                      <th style={{ width: '160px' }}>Created</th>
                      {activeTab === 'assigned_to_me' && (
                        <th style={{ width: '170px' }}>Update Status</th>
                      )}
                      <th style={{ width: '70px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.85rem',
                              color: 'var(--primary-light)',
                              fontWeight: 600,
                            }}
                          >
                            #{req.id}
                          </span>
                        </td>
                        <td>
                          <div
                            onClick={() => setSelectedTicket(req)}
                            style={{
                              fontWeight: 600,
                              color: '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>{req.title}</span>
                          </div>
                          {req.description && (
                            <div
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '380px',
                                marginTop: '3px',
                              }}
                            >
                              {req.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-priority-${req.priority}`}>
                            {req.priority === 'URGENT' && <Flame size={12} />}
                            {req.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-status-${req.status}`}>
                            <span className="badge-dot" />
                            {req.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          {activeTab === 'my_requests' ? (
                            req.assignedTo ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                                    color: '#fff',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {req.assignedTo.fullName?.[0] || 'A'}
                                </div>
                                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                                  {req.assignedTo.fullName || req.assignedTo.email}
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                Unassigned
                              </span>
                            )
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                  color: '#fff',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {req.user?.fullName?.[0] || 'U'}
                              </div>
                              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                                {req.user?.fullName || 'Requester'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {formatDate(req.createdAt)}
                          </span>
                        </td>

                        {/* Interactive Status Changer for Assigned tickets */}
                        {activeTab === 'assigned_to_me' && (
                          <td>
                            <select
                              value={req.status}
                              onChange={(e) => handleStatusChange(req.id, e.target.value)}
                              className="form-input form-select"
                              style={{
                                padding: '6px 28px 6px 10px',
                                fontSize: '0.8rem',
                                borderRadius: '6px',
                                background: 'var(--bg-surface-elevated)',
                              }}
                            >
                              <option value="OPEN">OPEN</option>
                              <option value="IN_PROGRESS">IN PROGRESS</option>
                              <option value="RESOLVED">RESOLVED</option>
                            </select>
                          </td>
                        )}

                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedTicket(req)}
                            className="btn-icon"
                            style={{
                              color: 'var(--text-muted)',
                              transition: 'color 150ms',
                            }}
                            title="Inspect ticket"
                          >
                            <ArrowUpRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* CARD VIEW */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '16px',
                }}
              >
                {filteredTickets.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedTicket(req)}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '12px',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.82rem',
                            color: 'var(--primary-light)',
                            fontWeight: 700,
                          }}
                        >
                          #{req.id}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span className={`badge badge-priority-${req.priority}`}>
                            {req.priority}
                          </span>
                          <span className={`badge badge-status-${req.status}`}>
                            {req.status?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <h4
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          marginBottom: '8px',
                          lineHeight: 1.3,
                        }}
                      >
                        {req.title}
                      </h4>
                      <p
                        style={{
                          fontSize: '0.84rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                          marginBottom: '16px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {req.description || 'No detailed description provided.'}
                      </p>
                    </div>

                    <div
                      style={{
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span>{formatDate(req.createdAt)}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {activeTab === 'my_requests'
                          ? req.assignedTo
                            ? `Assigned: ${req.assignedTo.fullName}`
                            : 'Unassigned'
                          : `By: ${req.user?.fullName || 'Requester'}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CREATE NEW REQUEST MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                  }}
                >
                  <Plus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Dispatch New Request
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Provide operational specifications for IT triage
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-icon"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest}>
              <div className="modal-body">
                {/* Title */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Incident / Request Title *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production Cluster Database latency threshold exceeded"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                {/* Priority Selection Cards */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Priority Level</span>
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '8px',
                    }}
                  >
                    {[
                      { val: 'LOW', label: 'Low', desc: 'Standard', color: '#10b981' },
                      { val: 'MEDIUM', label: 'Medium', desc: 'Routine', color: '#3b82f6' },
                      { val: 'HIGH', label: 'High', desc: 'Impactful', color: '#f97316' },
                      { val: 'URGENT', label: 'Urgent', desc: 'Critical SLA', color: '#ef4444' },
                    ].map((p) => {
                      const selected = formData.priority === p.val;
                      return (
                        <div
                          key={p.val}
                          onClick={() => setFormData({ ...formData, priority: p.val })}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '8px',
                            border: `1px solid ${selected ? p.color : 'var(--border-subtle)'}`,
                            background: selected ? `${p.color}15` : 'var(--bg-input)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 150ms',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              color: selected ? p.color : 'var(--text-main)',
                            }}
                          >
                            {p.label}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {p.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    <span>Detailed Operational Description</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Markdown supported
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Specify symptoms, log excerpts, steps to reproduce, impact radius..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TICKET DETAILS INSPECTOR MODAL */}
      {selectedTicket && (
        <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
          <div
            className="modal-container"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    color: 'var(--primary-light)',
                    fontWeight: 700,
                  }}
                >
                  Ticket #{selectedTicket.id}
                </span>
                <span className={`badge badge-priority-${selectedTicket.priority}`}>
                  {selectedTicket.priority}
                </span>
                <span className={`badge badge-status-${selectedTicket.status}`}>
                  {selectedTicket.status?.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="btn-icon"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <h3
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '16px',
                  lineHeight: 1.3,
                }}
              >
                {selectedTicket.title}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Created By
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
                    {selectedTicket.user?.fullName || 'Requester'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {selectedTicket.user?.email || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Assigned Specialist
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
                    {selectedTicket.assignedTo?.fullName || 'Unassigned'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {selectedTicket.assignedTo?.email || 'Awaiting dispatch'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Created Timestamp
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
                    {formatDate(selectedTicket.createdAt)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Resolution Status
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
                    {selectedTicket.status}
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Description & Context
                </h4>
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.9rem',
                    color: '#e2e8f0',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    minHeight: '80px',
                  }}
                >
                  {selectedTicket.description || 'No additional details provided.'}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSelectedTicket(null)}
                className="btn btn-secondary btn-sm"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}