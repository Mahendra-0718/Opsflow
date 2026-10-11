import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Layers,
  ShieldAlert,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Activity,
  CheckCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import API from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [backendOnline, setBackendOnline] = useState(true);

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    // Background ping to check backend connectivity
    const checkBackend = async () => {
      try {
        await API.get('/requests', { timeout: 3000 });
        setBackendOnline(true);
      } catch (err) {
        // Even if 401/403 or success, server is responding
        if (err.response) {
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user) return null;

  const isAdminOrManager =
    user.role === 'ADMIN' ||
    user.role === 'MANAGER' ||
    user.role === 'SUPER_ADMIN';

  // Extract initials
  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(8, 11, 18, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="container"
        style={{
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Left: Brand & Backend Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link
            to={isAdminOrManager ? '/admin' : '/dashboard'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Layers size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(to right, #ffffff, #cbd5e1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  OpsFlow
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#818cf8',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    textTransform: 'uppercase',
                  }}
                >
                  Enterprise
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.02em',
                }}
              >
                Workflow Orchestration
              </div>
            </div>
          </Link>

          {/* System Pulse Indicator */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
            }}
            className="d-md-flex"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: backendOnline ? '#10b981' : '#f43f5e',
                boxShadow: backendOnline
                  ? '0 0 8px #10b981'
                  : '0 0 8px #f43f5e',
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              Backend: {backendOnline ? 'Online (8080)' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 500,
              color:
                location.pathname === '/dashboard'
                  ? '#ffffff'
                  : 'var(--text-secondary)',
              background:
                location.pathname === '/dashboard'
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'transparent',
              border:
                location.pathname === '/dashboard'
                  ? '1px solid rgba(99, 102, 241, 0.3)'
                  : '1px solid transparent',
              transition: 'all 150ms',
            }}
          >
            <LayoutDashboard size={16} />
            <span>Employee Portal</span>
          </Link>

          {isAdminOrManager && (
            <Link
              to="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                color:
                  location.pathname === '/admin'
                    ? '#ffffff'
                    : 'var(--text-secondary)',
                background:
                  location.pathname === '/admin'
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25))'
                    : 'transparent',
                border:
                  location.pathname === '/admin'
                    ? '1px solid rgba(168, 85, 247, 0.4)'
                    : '1px solid transparent',
                transition: 'all 150ms',
              }}
            >
              <ShieldAlert size={16} color="#c084fc" />
              <span>Admin Center</span>
            </Link>
          )}
        </nav>

        {/* Right: User Identity & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* User Profile Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 12px 4px 6px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: '30px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)',
              }}
            >
              {initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  lineHeight: 1.2,
                }}
              >
                {user.fullName || 'User'}
              </span>
              <span
                className={`badge badge-role-${user.role}`}
                style={{
                  fontSize: '0.62rem',
                  padding: '1px 6px',
                  alignSelf: 'flex-start',
                  marginTop: '2px',
                }}
              >
                {user.role}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: 'rgba(239, 68, 68, 0.25)',
              color: '#f87171',
            }}
            title="Sign out of OpsFlow"
          >
            <LogOut size={15} />
            <span style={{ display: 'none' }} className="d-sm-inline">
              Sign out
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
