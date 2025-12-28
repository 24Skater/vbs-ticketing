/**
 * Admin Panel Layout
 * Modern sidebar navigation with responsive design
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi, clearAuthTokens } from '../../lib/api';

// Icons as inline SVGs for simplicity
const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Tickets: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3" />
      <path d="M2 9v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9" />
      <path d="M12 12v.01" />
      <path d="M8 12h.01" />
      <path d="M16 12h.01" />
    </svg>
  ),
  Events: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  ),
  Reports: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Logs: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
};

const navItems = [
  { path: '/admin', icon: Icons.Dashboard, label: 'Dashboard', exact: true },
  { path: '/admin/tickets', icon: Icons.Tickets, label: 'Tickets' },
  { path: '/admin/events', icon: Icons.Events, label: 'Events' },
  { path: '/admin/reports', icon: Icons.Reports, label: 'Reports' },
  { path: '/admin/users', icon: Icons.Users, label: 'Users' },
  { path: '/admin/logs', icon: Icons.Logs, label: 'Activity Logs' },
  { path: '/admin/settings', icon: Icons.Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore errors
    }
    clearAuthTokens();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/admin" className="sidebar-logo">
            <span className="logo-icon">🎟️</span>
            <span className="logo-text">Admin</span>
          </Link>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <Icons.Close />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item" target="_blank">
            <Icons.Home />
            <span>View Site</span>
          </Link>
          <button className="nav-item logout" onClick={handleLogout}>
            <Icons.Logout />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        {/* Top header */}
        <header className="admin-header">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <Icons.Menu />
          </button>
          
          <div className="header-title">
            {navItems.find(item => isActive(item.path, item.exact))?.label || 'Admin'}
          </div>

          <div className="header-actions">
            {/* Add notifications, user menu, etc. here */}
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: var(--color-background, #0f172a);
        }

        /* Sidebar */
        .admin-sidebar {
          width: 260px;
          background: var(--color-surface, #1e293b);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
          transition: transform 0.3s ease;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .logo-icon {
          font-size: 1.75rem;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text, #f8fafc);
        }

        .sidebar-close {
          display: none;
          background: none;
          border: none;
          color: var(--color-text-muted, #94a3b8);
          cursor: pointer;
          padding: 0.5rem;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: var(--color-text-muted, #94a3b8);
          text-decoration: none;
          border-radius: 0.5rem;
          margin-bottom: 0.25rem;
          transition: all 0.2s;
          font-weight: 500;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-size: 0.9375rem;
        }

        .nav-item:hover {
          color: var(--color-text, #f8fafc);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-item.active {
          color: var(--color-primary, #3b82f6);
          background: rgba(59, 130, 246, 0.1);
        }

        .nav-item svg {
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .nav-item.logout {
          color: #ef4444;
        }

        .nav-item.logout:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        /* Main content */
        .admin-main {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .admin-header {
          height: 64px;
          background: var(--color-surface, #1e293b);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          gap: 1rem;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--color-text, #f8fafc);
          cursor: pointer;
          padding: 0.5rem;
        }

        .header-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text, #f8fafc);
        }

        .header-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-content {
          flex: 1;
          padding: 1.5rem;
        }

        /* Mobile overlay */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 99;
        }

        /* Mobile styles */
        @media (max-width: 1024px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }

          .sidebar-close {
            display: block;
          }

          .sidebar-overlay {
            display: block;
          }

          .admin-main {
            margin-left: 0;
          }

          .menu-toggle {
            display: block;
          }
        }

        @media (max-width: 640px) {
          .admin-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

