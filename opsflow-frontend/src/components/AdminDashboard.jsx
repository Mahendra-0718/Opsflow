import React, { useEffect, useState, useMemo } from 'react';
import API from '../services/api';
import Navbar from './Navbar';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  Users,
  Layers,
  Clock,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  UserX,
  UserPlus,
  Send,
  Save,
  Check,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Activity,
  X,
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Tab: 'triage' | 'users' | 'analytics'
  const [activeTab, setActiveTab] = useState('triage');

  // Request assignment selections & updates
  const [selectedUsers, setSelectedUsers] = useState({});
  const [assigningId, setAssigningId] = useState(null);

  // User management dirty states
  const [userChanges, setUserChanges] = useState({});
  const [savingUserId, setSavingUserId] = useState(null);

  // Filters for Requests
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('ALL');
  const [requestPriorityFilter, setRequestPriorityFilter] = useState('ALL');
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  // Filters for Users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');

  // Request inspection modal
  const [inspectedRequest, setInspectedRequest] = useState(null);

  const toast = useToast();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canManageUsers = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [reqRes, usersRes, statsRes] = await Promise.all([
        API.get('/admin/requests').catch(() => ({ data: [] })),
        API.get('/admin/users').catch(() => ({ data: [] })),
        API.get('/admin/stats').catch(() => ({ data: null })),
      ]);

      setRequests(reqRes.data || []);
      setUsers(usersRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Failed to sync command center data', 'Sync Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllAdminData();
  };

  // Status update for a request
  const handleUpdateStatus = async (id, status) => {
    try {
      await API.put(`/admin/requests/${id}/status?status=${status}`);
      toast.success(`Request #${id} status changed to ${status}`, 'Status Updated');
      loadAllAdminData();
    } catch (err) {
      console.error('Failed to update status:', err);
      const msg = err.response?.data?.message || 'Failed to update request status';
      toast.error(msg, 'Update Error');
    }
  };

  // Assign request to an active employee
  const handleAssignUser = async (requestId) => {
    const email = selectedUsers[requestId];
    if (!email) {
      toast.warning('Please select an active employee from the dropdown', 'Selection Missing');
      return;
    }

    setAssigningId(requestId);
    try {
      await API.put(`/admin/requests/${requestId}/assign?email=${encodeURIComponent(email)}`);
      toast.success(`Request #${requestId} assigned to ${email}`, 'Assignment Complete');
      loadAllAdminData();
    } catch (err) {
      console.error('Failed to assign request:', err);
      const msg = err.response?.data?.message || 'Failed to assign request';
      toast.error(msg, 'Assignment Error');
    } finally {
      setAssigningId(null);
    }
  };

  // User management updates
  const handleRoleChange = (userId, role) => {
    setUserChanges((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], role },
    }));
  };

  const handleActiveChange = (userId, active) => {
    setUserChanges((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], active },
    }));
  };

  const handleSaveUser = async (u) => {
    const changes = userChanges[u.id] || {};
    const role = changes.role ?? u.role;
    const active = changes.active ?? u.active;

    setSavingUserId(u.id);
    try {
      await API.put(`/admin/users/${u.id}`, { role, active });
      toast.success(`User "${u.fullName}" updated successfully!`, 'User Saved');

      // Clear dirty state for this user
      setUserChanges((prev) => {
        const copy = { ...prev };
        delete copy[u.id];
        return copy;
      });

      loadAllAdminData();
    } catch (err) {
      console.error('Failed to update user:', err);
      const msg = err.response?.data?.message || 'Failed to update user';
      toast.error(msg, 'Save Error');
    } finally {
      setSavingUserId(null);
    }
  };

  // Active employees eligible for ticket assignment
  const activeEmployees = useMemo(() => {
    return users.filter((u) => u.role === 'EMPLOYEE' && u.active);
  }, [users]);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = requestSearch.toLowerCase();
      const matchesSearch =
        String(r.id).includes(q) ||
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.user?.fullName && r.user.fullName.toLowerCase().includes(q)) ||
        (r.assignedTo?.fullName && r.assignedTo.fullName.toLowerCase().includes(q));

      const matchesStatus = requestStatusFilter === 'ALL' || r.status === requestStatusFilter;
      const matchesPriority = requestPriorityFilter === 'ALL' || r.priority === requestPriorityFilter;
      const matchesUnassigned = !unassignedOnly || !r.assignedTo;

      return matchesSearch && matchesStatus && matchesPriority && matchesUnassigned;
    });
  }, [requests, requestSearch, requestStatusFilter, requestPriorityFilter, unassignedOnly]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.toLowerCase();
      const matchesSearch =
        String(u.id).includes(q) ||
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));

      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      const matchesStatus =
        userStatusFilter === 'ALL' ||
        (userStatusFilter === 'ACTIVE' && u.active) ||
        (userStatusFilter === 'INACTIVE' && !u.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

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

  const resolutionRate =
    stats && stats.totalRequests > 0
      ? Math.round((stats.resolvedRequests / stats.totalRequests) * 100)
      : 0;

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
                  Operations Command Center
                </h1>
                <span className={`badge badge-role-${currentUser.role}`}>
                  {currentUser.role} PRIVILEGED
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Real-time incident dispatch, SLA telemetry, and cross-organization identity management.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleRefresh}
                className="btn btn-outline"
                style={{ padding: '10px 16px' }}
                title="Refresh telemetry"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                <span>Refresh Live Telemetry</span>
              </button>
            </div>
          </div>

          {/* KPI STATISTICS CARDS */}
          {stats && (
            <div style={{ marginBottom: '32px' }}>
              {/* Requests KPIs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                {/* Total Requests */}
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Incidents
                      </div>
                      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                        {stats.totalRequests}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8',
                      }}
                    >
                      <Layers size={22} />
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Resolution Velocity: <strong style={{ color: '#34d399' }}>{resolutionRate}%</strong>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '2px',
                      marginTop: '6px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${resolutionRate}%`,
                        background: 'linear-gradient(90deg, #6366f1, #34d399)',
                      }}
                    />
                  </div>
                </div>

                {/* Open Requests */}
                <div
                  className="glass-card"
                  style={{
                    padding: '20px',
                    borderColor: 'rgba(56, 189, 248, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
                        Needs Triage (Open)
                      </div>
                      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                        {stats.openRequests}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                      }}
                    >
                      <Clock size={22} />
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Awaiting employee dispatch
                  </div>
                </div>

                {/* In Progress */}
                <div
                  className="glass-card"
                  style={{
                    padding: '20px',
                    borderColor: 'rgba(251, 191, 36, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600, textTransform: 'uppercase' }}>
                        Active Remediation
                      </div>
                      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
                        {stats.inProgressRequests}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'rgba(251, 191, 36, 0.15)',
                        color: '#fbbf24',
                      }}
                    >
                      <Clock3 size={22} />
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Under engineer diagnosis
                  </div>
                </div>

                {/* Resolved */}
                <div
                  className="glass-card"
                  style={{
                    padding: '20px',
                    borderColor: 'rgba(52, 211, 153, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600, textTransform: 'uppercase' }}>
                        Resolved & Closed
                      </div>
                      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                        {stats.resolvedRequests}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'rgba(52, 211, 153, 0.15)',
                        color: '#34d399',
                      }}
                    >
                      <CheckCircle2 size={22} />
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Successful resolutions
                  </div>
                </div>
              </div>

              {/* User Directory KPIs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                }}
              >
                {/* Total Users */}
                <div
                  className="card-elevated"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Registered Users
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
                      {stats.totalUsers}
                    </div>
                  </div>
                  <Users size={20} color="#94a3b8" />
                </div>

                {/* Active Users */}
                <div
                  className="card-elevated"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Active Accounts
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399' }}>
                      {stats.activeUsers}
                    </div>
                  </div>
                  <UserCheck size={20} color="#34d399" />
                </div>

                {/* Inactive Users */}
                <div
                  className="card-elevated"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Inactive / Suspended
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f87171' }}>
                      {stats.inactiveUsers}
                    </div>
                  </div>
                  <UserX size={20} color="#f87171" />
                </div>

                {/* Available Dispatch Employees */}
                <div
                  className="card-elevated"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Active Dispatch Pool
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#c084fc' }}>
                      {stats.employees} Employees
                    </div>
                  </div>
                  <Briefcase size={20} color="#c084fc" />
                </div>
              </div>
            </div>
          )}

          {/* MAIN MANAGEMENT CONSOLE */}
          <div className="glass-card" style={{ padding: '24px', overflow: 'hidden' }}>
            {/* Tab Navigation Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '20px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('triage')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: activeTab === 'triage' ? '#ffffff' : 'var(--text-secondary)',
                    background:
                      activeTab === 'triage'
                        ? 'rgba(99, 102, 241, 0.2)'
                        : 'rgba(255, 255, 255, 0.03)',
                    border:
                      activeTab === 'triage'
                        ? '1px solid rgba(99, 102, 241, 0.4)'
                        : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 150ms',
                  }}
                >
                  <Layers size={16} />
                  <span>Request Triage & Dispatch ({requests.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: activeTab === 'users' ? '#ffffff' : 'var(--text-secondary)',
                    background:
                      activeTab === 'users'
                        ? 'rgba(168, 85, 247, 0.2)'
                        : 'rgba(255, 255, 255, 0.03)',
                    border:
                      activeTab === 'users'
                        ? '1px solid rgba(168, 85, 247, 0.4)'
                        : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 150ms',
                  }}
                >
                  <Users size={16} />
                  <span>User Governance & IAM ({users.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: activeTab === 'analytics' ? '#ffffff' : 'var(--text-secondary)',
                    background:
                      activeTab === 'analytics'
                        ? 'rgba(6, 182, 212, 0.2)'
                        : 'rgba(255, 255, 255, 0.03)',
                    border:
                      activeTab === 'analytics'
                        ? '1px solid rgba(6, 182, 212, 0.4)'
                        : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 150ms',
                  }}
                >
                  <TrendingUp size={16} />
                  <span>Telemetry & SLA Audit</span>
                </button>
              </div>
            </div>

            {/* TAB 1: REQUEST TRIAGE & DISPATCH */}
            {activeTab === 'triage' && (
              <div>
                {/* Search & Filters */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  {/* Search Input */}
                  <div className="input-wrapper" style={{ flexGrow: 1, minWidth: '240px' }}>
                    <span className="input-icon-left">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search by ID, title, description, or creator..."
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      className="form-input has-left-icon"
                      style={{ padding: '10px 14px 10px 38px', fontSize: '0.88rem' }}
                    />
                  </div>

                  {/* Status Filter */}
                  <div style={{ minWidth: '150px' }}>
                    <select
                      value={requestStatusFilter}
                      onChange={(e) => setRequestStatusFilter(e.target.value)}
                      className="form-input form-select"
                      style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="OPEN">Open (Needs Action)</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div style={{ minWidth: '150px' }}>
                    <select
                      value={requestPriorityFilter}
                      onChange={(e) => setRequestPriorityFilter(e.target.value)}
                      className="form-input form-select"
                      style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                    >
                      <option value="ALL">All Priorities</option>
                      <option value="URGENT">Urgent Only</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  {/* Quick Toggle: Unassigned Only */}
                  <button
                    onClick={() => setUnassignedOnly(!unassignedOnly)}
                    className={`btn btn-sm ${unassignedOnly ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '9px 14px' }}
                  >
                    <span>Unassigned Only</span>
                  </button>
                </div>

                {/* Table */}
                {filteredRequests.length === 0 ? (
                  <div
                    style={{
                      padding: '50px 20px',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px dashed var(--border-subtle)',
                    }}
                  >
                    <Layers size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>No matching requests found</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                      Try adjusting your status or priority filter parameters.
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="ops-table">
                      <thead>
                        <tr>
                          <th style={{ width: '70px' }}>ID</th>
                          <th>Incident / Request Title</th>
                          <th style={{ width: '120px' }}>Priority</th>
                          <th style={{ width: '150px' }}>Status</th>
                          <th style={{ width: '170px' }}>Reported By</th>
                          <th style={{ width: '260px' }}>Assign Dispatch</th>
                          <th style={{ width: '70px', textAlign: 'center' }}>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((req) => (
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
                                onClick={() => setInspectedRequest(req)}
                                style={{
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                }}
                              >
                                {req.title}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.78rem',
                                  color: 'var(--text-muted)',
                                  marginTop: '2px',
                                }}
                              >
                                Created: {formatDate(req.createdAt)}
                              </div>
                            </td>

                            <td>
                              <span className={`badge badge-priority-${req.priority}`}>
                                {req.priority === 'URGENT' && <Flame size={12} />}
                                {req.priority}
                              </span>
                            </td>

                            <td>
                              <select
                                value={req.status}
                                onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                                className="form-input form-select"
                                style={{
                                  padding: '6px 28px 6px 10px',
                                  fontSize: '0.82rem',
                                  borderRadius: '6px',
                                  background: 'var(--bg-surface-elevated)',
                                }}
                              >
                                <option value="OPEN">OPEN</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="RESOLVED">RESOLVED</option>
                              </select>
                            </td>

                            <td>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                                {req.user?.fullName || 'Requester'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {req.user?.email || '—'}
                              </div>
                            </td>

                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                  Current:{' '}
                                  <strong style={{ color: req.assignedTo ? '#34d399' : '#f87171' }}>
                                    {req.assignedTo ? req.assignedTo.fullName || req.assignedTo.email : 'Unassigned'}
                                  </strong>
                                </div>

                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <select
                                    value={selectedUsers[req.id] ?? (req.assignedTo?.email || '')}
                                    onChange={(e) =>
                                      setSelectedUsers({
                                        ...selectedUsers,
                                        [req.id]: e.target.value,
                                      })
                                    }
                                    className="form-input form-select"
                                    style={{
                                      padding: '5px 24px 5px 8px',
                                      fontSize: '0.8rem',
                                      borderRadius: '6px',
                                      flexGrow: 1,
                                    }}
                                  >
                                    <option value="">Select Employee...</option>
                                    {activeEmployees.map((emp) => (
                                      <option key={emp.id} value={emp.email}>
                                        {emp.fullName} ({emp.email})
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    onClick={() => handleAssignUser(req.id)}
                                    disabled={assigningId === req.id}
                                    className="btn btn-primary btn-sm"
                                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                                  >
                                    {assigningId === req.id ? '...' : 'Assign'}
                                  </button>
                                </div>
                              </div>
                            </td>

                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => setInspectedRequest(req)}
                                className="btn-icon"
                                style={{ color: 'var(--text-muted)' }}
                                title="Inspect details"
                              >
                                <ArrowUpRight size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: USER GOVERNANCE & IAM */}
            {activeTab === 'users' && (
              <div>
                {!canManageUsers && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      color: '#fbbf24',
                      fontSize: '0.85rem',
                      marginBottom: '16px',
                    }}
                  >
                    Note: User modification requires ADMIN or SUPER_ADMIN authorization. Managers can view user directories.
                  </div>
                )}

                {/* Filters */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  <div className="input-wrapper" style={{ flexGrow: 1, minWidth: '240px' }}>
                    <span className="input-icon-left">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search users by name, email, or ID..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="form-input has-left-icon"
                      style={{ padding: '10px 14px 10px 38px', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ minWidth: '160px' }}>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="form-input form-select"
                      style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                    >
                      <option value="ALL">All Roles</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MANAGER">Manager</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="AUDITOR">Auditor</option>
                    </select>
                  </div>

                  <div style={{ minWidth: '150px' }}>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="form-input form-select"
                      style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                    >
                      <option value="ALL">All Account Status</option>
                      <option value="ACTIVE">Active Only</option>
                      <option value="INACTIVE">Inactive / Suspended</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table className="ops-table">
                    <thead>
                      <tr>
                        <th style={{ width: '70px' }}>ID</th>
                        <th>User Profile</th>
                        <th style={{ width: '160px' }}>Current Role</th>
                        <th style={{ width: '180px' }}>Assign Role</th>
                        <th style={{ width: '140px' }}>Status</th>
                        <th style={{ width: '110px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const changes = userChanges[u.id] || {};
                        const selectedRole = changes.role ?? u.role;
                        const selectedActive = changes.active ?? u.active;
                        const isDirty =
                          changes.role !== undefined || changes.active !== undefined;

                        return (
                          <tr key={u.id}>
                            <td>
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.85rem',
                                  color: 'var(--primary-light)',
                                }}
                              >
                                #{u.id}
                              </span>
                            </td>

                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
                                    color: '#fff',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {u.fullName?.[0] || 'U'}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                                    {u.fullName}
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    {u.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className={`badge badge-role-${u.role}`}>
                                {u.role}
                              </span>
                            </td>

                            <td>
                              <select
                                value={selectedRole}
                                disabled={!canManageUsers}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                className="form-input form-select"
                                style={{
                                  padding: '6px 28px 6px 10px',
                                  fontSize: '0.82rem',
                                  borderRadius: '6px',
                                  background: 'var(--bg-surface-elevated)',
                                }}
                              >
                                <option value="EMPLOYEE">EMPLOYEE</option>
                                <option value="MANAGER">MANAGER</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="AUDITOR">AUDITOR</option>
                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                              </select>
                            </td>

                            <td>
                              <select
                                value={selectedActive ? 'ACTIVE' : 'INACTIVE'}
                                disabled={!canManageUsers}
                                onChange={(e) =>
                                  handleActiveChange(u.id, e.target.value === 'ACTIVE')
                                }
                                className="form-input form-select"
                                style={{
                                  padding: '6px 28px 6px 10px',
                                  fontSize: '0.82rem',
                                  borderRadius: '6px',
                                  background: selectedActive
                                    ? 'rgba(16, 185, 129, 0.1)'
                                    : 'rgba(239, 68, 68, 0.1)',
                                  color: selectedActive ? '#34d399' : '#f87171',
                                  borderColor: selectedActive
                                    ? 'rgba(16, 185, 129, 0.3)'
                                    : 'rgba(239, 68, 68, 0.3)',
                                }}
                              >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                              </select>
                            </td>

                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => handleSaveUser(u)}
                                disabled={!isDirty || !canManageUsers || savingUserId === u.id}
                                className={`btn btn-sm ${isDirty ? 'btn-primary' : 'btn-outline'}`}
                                style={{
                                  padding: '5px 12px',
                                  fontSize: '0.78rem',
                                  opacity: isDirty ? 1 : 0.4,
                                }}
                                title={isDirty ? 'Save pending changes' : 'No unsaved modifications'}
                              >
                                <Save size={14} />
                                <span>{savingUserId === u.id ? 'Saving...' : 'Save'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: TELEMETRY & SLA AUDIT */}
            {activeTab === 'analytics' && stats && (
              <div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '24px',
                  }}
                >
                  {/* Status Breakdown */}
                  <div
                    style={{
                      padding: '24px',
                      borderRadius: '16px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <Activity size={20} color="#818cf8" />
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                        Incident Status Distribution
                      </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {[
                        {
                          label: 'Open (Needs Dispatch)',
                          count: stats.openRequests,
                          color: '#38bdf8',
                        },
                        {
                          label: 'In Remediation (Active)',
                          count: stats.inProgressRequests,
                          color: '#fbbf24',
                        },
                        {
                          label: 'Resolved & Signed Off',
                          count: stats.resolvedRequests,
                          color: '#34d399',
                        },
                      ].map((item) => {
                        const pct =
                          stats.totalRequests > 0
                            ? Math.round((item.count / stats.totalRequests) * 100)
                            : 0;

                        return (
                          <div key={item.label}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.85rem',
                                marginBottom: '6px',
                              }}
                            >
                              <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                              <span style={{ fontWeight: 700, color: item.color }}>
                                {item.count} ({pct}%)
                              </span>
                            </div>
                            <div
                              style={{
                                height: '8px',
                                width: '100%',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${pct}%`,
                                  background: item.color,
                                  borderRadius: '4px',
                                  transition: 'width 300ms ease',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dispatch Health */}
                  <div
                    style={{
                      padding: '24px',
                      borderRadius: '16px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <Briefcase size={20} color="#c084fc" />
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                        Workforce Allocation Telemetry
                      </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Active Dispatch Workforce
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                            {activeEmployees.length} Eligible Employees
                          </div>
                        </div>
                        <span className="badge badge-status-RESOLVED">Online</span>
                      </div>

                      <div
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Unassigned Tickets
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f87171' }}>
                            {requests.filter((r) => !r.assignedTo).length} Tickets
                          </div>
                        </div>
                        <span className="badge badge-priority-URGENT">Needs Action</span>
                      </div>

                      <div
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Security Subsystem
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>
                            Stateless JWT Active
                          </div>
                        </div>
                        <span className="badge badge-status-OPEN">Port 8080</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* INSPECT DETAILS MODAL */}
      {inspectedRequest && (
        <div className="modal-backdrop" onClick={() => setInspectedRequest(null)}>
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
                  Incident #{inspectedRequest.id}
                </span>
                <span className={`badge badge-priority-${inspectedRequest.priority}`}>
                  {inspectedRequest.priority}
                </span>
                <span className={`badge badge-status-${inspectedRequest.status}`}>
                  {inspectedRequest.status?.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => setInspectedRequest(null)}
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
                }}
              >
                {inspectedRequest.title}
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
                    Requester
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
                    {inspectedRequest.user?.fullName || 'Requester'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {inspectedRequest.user?.email || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Assigned Specialist
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
                    {inspectedRequest.assignedTo?.fullName || 'Unassigned'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {inspectedRequest.assignedTo?.email || 'Awaiting dispatch'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Creation Timestamp
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
                    {formatDate(inspectedRequest.createdAt)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Current Status
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
                    {inspectedRequest.status}
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Operational Description
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
                  {inspectedRequest.description || 'No detailed context provided.'}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setInspectedRequest(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}