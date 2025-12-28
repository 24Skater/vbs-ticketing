/**
 * Activity Logs Page
 * Track all actions performed in the admin panel
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function ActivityLogs() {
  const [filters, setFilters] = useState({
    action: '',
    user: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
  });

  // Fetch logs
  const { data, isLoading } = useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: async () => {
      const response = await api.get('/audit-logs', { params: filters });
      return response;
    },
  });

  const logs = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionIcon = (action) => {
    const icons = {
      'ticket.create': '🎟️',
      'ticket.verify': '✅',
      'ticket.cancel': '❌',
      'ticket.update': '📝',
      'ticket.delete': '🗑️',
      'payment.success': '💳',
      'payment.failed': '⚠️',
      'user.login': '🔐',
      'user.logout': '🚪',
      'user.create': '👤',
      'user.update': '✏️',
      'event.create': '📅',
      'event.update': '📝',
      'config.update': '⚙️',
      'export.tickets': '📥',
      default: '📋',
    };
    return icons[action] || icons.default;
  };

  const getActionColor = (action) => {
    if (action.includes('create')) return '#10b981';
    if (action.includes('delete') || action.includes('cancel')) return '#ef4444';
    if (action.includes('update')) return '#3b82f6';
    if (action.includes('verify') || action.includes('success')) return '#8b5cf6';
    if (action.includes('login')) return '#10b981';
    if (action.includes('logout')) return '#f59e0b';
    return '#6b7280';
  };

  return (
    <div className="logs-page">
      {/* Header */}
      <div className="page-header">
        <h1>Activity Logs</h1>
        <span className="log-count">{pagination.total} entries</span>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
          >
            <option value="">All Actions</option>
            <option value="ticket">Ticket Actions</option>
            <option value="payment">Payment Actions</option>
            <option value="user">User Actions</option>
            <option value="event">Event Actions</option>
            <option value="config">Config Changes</option>
          </select>
        </div>

        <div className="filter-group">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
            placeholder="From date"
          />
        </div>

        <div className="filter-group">
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
            placeholder="To date"
          />
        </div>

        <button 
          className="btn btn-ghost"
          onClick={() => setFilters({ action: '', user: '', dateFrom: '', dateTo: '', page: 1 })}
        >
          Clear Filters
        </button>
      </div>

      {/* Logs List */}
      <div className="logs-container">
        {isLoading ? (
          <div className="loading-state">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No activity logs found</div>
            <div className="empty-desc">Activity will appear here as actions are performed</div>
          </div>
        ) : (
          <div className="logs-list">
            {logs.map((log, i) => (
              <div key={log.id || i} className="log-item">
                <div 
                  className="log-icon"
                  style={{ background: `${getActionColor(log.action)}20` }}
                >
                  {getActionIcon(log.action)}
                </div>
                <div className="log-content">
                  <div className="log-action">
                    <span 
                      className="action-badge"
                      style={{ color: getActionColor(log.action) }}
                    >
                      {log.action}
                    </span>
                    <span className="log-message">{log.message}</span>
                  </div>
                  <div className="log-meta">
                    <span className="log-user">
                      👤 {log.userName || log.userId || 'System'}
                    </span>
                    <span className="log-time">
                      🕐 {formatDate(log.createdAt)}
                    </span>
                    {log.ipAddress && (
                      <span className="log-ip">
                        🌐 {log.ipAddress}
                      </span>
                    )}
                  </div>
                  {log.metadata && (
                    <details className="log-details">
                      <summary>Details</summary>
                      <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={!pagination.hasPrev}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="page-btn"
            disabled={!pagination.hasNext}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next →
          </button>
        </div>
      )}

      <style>{`
        .logs-page {
          max-width: 1200px;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
        }

        .log-count {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          background: var(--color-surface);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
        }

        /* Filters */
        .filters-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .filter-group select,
        .filter-group input {
          padding: 0.625rem 1rem;
          background: var(--color-surface);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.375rem;
          color: var(--color-text);
          font-size: 0.875rem;
        }

        /* Logs Container */
        .logs-container {
          background: var(--color-surface);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .loading-state,
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          color: var(--color-text-muted);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 0.5rem;
        }

        /* Logs List */
        .logs-list {
          display: flex;
          flex-direction: column;
        }

        .log-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.2s;
        }

        .log-item:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .log-item:last-child {
          border-bottom: none;
        }

        .log-icon {
          width: 40px;
          height: 40px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .log-content {
          flex: 1;
          min-width: 0;
        }

        .log-action {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.375rem;
        }

        .action-badge {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          font-family: monospace;
        }

        .log-message {
          color: var(--color-text);
          font-size: 0.9375rem;
        }

        .log-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .log-meta span {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .log-details {
          margin-top: 0.75rem;
        }

        .log-details summary {
          font-size: 0.75rem;
          color: var(--color-primary);
          cursor: pointer;
        }

        .log-details pre {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 0.375rem;
          font-size: 0.75rem;
          overflow-x: auto;
          color: var(--color-text-muted);
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .page-btn {
          padding: 0.5rem 1rem;
          background: var(--color-surface);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.375rem;
          color: var(--color-text);
          cursor: pointer;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }

        .btn {
          padding: 0.625rem 1.25rem;
          border-radius: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
        }

        .btn-ghost {
          background: transparent;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}

