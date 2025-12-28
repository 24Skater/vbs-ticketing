/**
 * Tickets Management Page
 * List, search, filter, bulk operations, export
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '../../lib/api';

// Status badge component
function StatusBadge({ status }) {
  const colors = {
    PAID: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
    USED: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6' },
    PENDING: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
    CANCELLED: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
    REFUNDED: { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' },
  };

  const style = colors[status] || colors.PENDING;

  return (
    <span 
      className="status-badge"
      style={{ background: style.bg, color: style.text }}
    >
      {status}
    </span>
  );
}

export default function Tickets() {
  const queryClient = useQueryClient();
  
  // State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Fetch tickets
  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets', { search, status, page }],
    queryFn: async () => {
      const response = await ticketsApi.list({
        query: search || undefined,
        status: status || undefined,
        page,
        limit: 25,
      });
      return response;
    },
  });

  const tickets = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  // Mutations
  const verifyMutation = useMutation({
    mutationFn: (ticketId) => ticketsApi.verify(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries(['tickets']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ticketId) => ticketsApi.delete(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries(['tickets']);
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async ({ action, ticketIds }) => {
      const promises = ticketIds.map(id => {
        if (action === 'verify') return ticketsApi.verify(id);
        if (action === 'cancel') return ticketsApi.updateStatus(id, 'CANCELLED');
        if (action === 'delete') return ticketsApi.delete(id);
        return Promise.resolve();
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tickets']);
      setSelected(new Set());
      setShowBulkModal(false);
    },
  });

  // Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(new Set(tickets.map(t => t.ticketId)));
    } else {
      setSelected(new Set());
    }
  };

  const handleSelect = (ticketId) => {
    const newSelected = new Set(selected);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelected(newSelected);
  };

  const handleBulkAction = (action) => {
    setBulkAction(action);
    setShowBulkModal(true);
  };

  const confirmBulkAction = () => {
    bulkMutation.mutate({
      action: bulkAction,
      ticketIds: Array.from(selected),
    });
  };

  const handleExport = async (format) => {
    try {
      const response = await fetch(`/api/analytics/export/tickets?format=${format}&status=${status}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="tickets-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Tickets</h1>
          <span className="ticket-count">{pagination.total} total</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowVerifyModal(true)}>
            ✅ Verify
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            ➕ New Ticket
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, phone, email, ticket ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-group">
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="PAID">Paid</option>
            <option value="USED">Checked In</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div className="export-group">
          <button className="btn btn-ghost" onClick={() => handleExport('csv')}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="bulk-bar">
          <span className="bulk-count">{selected.size} selected</span>
          <div className="bulk-actions">
            <button 
              className="btn btn-sm btn-success" 
              onClick={() => handleBulkAction('verify')}
            >
              ✅ Check In
            </button>
            <button 
              className="btn btn-sm btn-warning"
              onClick={() => handleBulkAction('cancel')}
            >
              ❌ Cancel
            </button>
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => handleBulkAction('delete')}
            >
              🗑️ Delete
            </button>
          </div>
          <button 
            className="btn btn-sm btn-ghost"
            onClick={() => setSelected(new Set())}
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        {isLoading ? (
          <div className="loading-state">Loading tickets...</div>
        ) : error ? (
          <div className="error-state">Failed to load tickets</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎟️</div>
            <div className="empty-title">No tickets found</div>
            <div className="empty-desc">Try adjusting your search or filters</div>
          </div>
        ) : (
          <table className="tickets-table">
            <thead>
              <tr>
                <th className="col-checkbox">
                  <input 
                    type="checkbox"
                    checked={selected.size === tickets.length && tickets.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Ticket ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr 
                  key={ticket.ticketId}
                  className={selected.has(ticket.ticketId) ? 'selected' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(ticket.ticketId)}
                      onChange={() => handleSelect(ticket.ticketId)}
                    />
                  </td>
                  <td className="col-id">
                    <code>{ticket.ticketId}</code>
                    <span className="access-code">{ticket.accessCode}</span>
                  </td>
                  <td className="col-name">
                    <div className="name-cell">
                      <span className="name">{ticket.name}</span>
                      {ticket.email && (
                        <span className="email">{ticket.email}</span>
                      )}
                    </div>
                  </td>
                  <td>{ticket.phone}</td>
                  <td>{ticket.ticketTypeName || 'Standard'}</td>
                  <td>{formatCurrency(ticket.amount, ticket.currency)}</td>
                  <td><StatusBadge status={ticket.status} /></td>
                  <td>{formatDate(ticket.createdAt)}</td>
                  <td className="col-actions">
                    {ticket.status === 'PAID' && (
                      <button
                        className="action-btn success"
                        onClick={() => verifyMutation.mutate(ticket.ticketId)}
                        title="Check In"
                      >
                        ✅
                      </button>
                    )}
                    <button
                      className="action-btn"
                      onClick={() => window.open(`/api/tickets/${ticket.ticketId}/pdf`, '_blank')}
                      title="Download PDF"
                    >
                      📄
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => {
                        if (confirm('Delete this ticket?')) {
                          deleteMutation.mutate(ticket.ticketId);
                        }
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={!pagination.hasPrev}
            onClick={() => setPage(p => p - 1)}
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="page-btn"
            disabled={!pagination.hasNext}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Bulk Action</h3>
              <button className="close-btn" onClick={() => setShowBulkModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to <strong>{bulkAction}</strong> {selected.size} ticket(s)?
              </p>
              {bulkAction === 'delete' && (
                <p className="warning">⚠️ This action cannot be undone.</p>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowBulkModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`btn ${bulkAction === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                onClick={confirmBulkAction}
                disabled={bulkMutation.isPending}
              >
                {bulkMutation.isPending ? 'Processing...' : `Confirm ${bulkAction}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Verify Modal */}
      {showVerifyModal && (
        <VerifyModal onClose={() => setShowVerifyModal(false)} />
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal onClose={() => setShowCreateModal(false)} />
      )}

      <style>{`
        .tickets-page {
          max-width: 1400px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
        }

        .ticket-count {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          background: var(--color-surface);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        /* Filters */
        .filters-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 280px;
          position: relative;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: var(--color-surface);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          color: var(--color-text);
          font-size: 0.875rem;
        }

        .search-box input:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
        }

        .filter-select {
          padding: 0.75rem 1rem;
          background: var(--color-surface);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          color: var(--color-text);
          font-size: 0.875rem;
        }

        /* Bulk Bar */
        .bulk-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .bulk-count {
          font-weight: 600;
          color: var(--color-primary);
        }

        .bulk-actions {
          display: flex;
          gap: 0.5rem;
          margin-left: auto;
        }

        /* Table */
        .table-container {
          background: var(--color-surface);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .tickets-table {
          width: 100%;
          border-collapse: collapse;
        }

        .tickets-table th,
        .tickets-table td {
          padding: 0.875rem 1rem;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tickets-table th {
          background: rgba(255, 255, 255, 0.02);
          font-weight: 600;
          color: var(--color-text-muted);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tickets-table tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .tickets-table tr.selected {
          background: rgba(59, 130, 246, 0.05);
        }

        .col-checkbox {
          width: 40px;
        }

        .col-id {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .col-id code {
          font-family: monospace;
          font-size: 0.8125rem;
          color: var(--color-primary);
        }

        .access-code {
          font-size: 0.6875rem;
          color: var(--color-text-muted);
        }

        .name-cell {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .name-cell .name {
          font-weight: 500;
          color: var(--color-text);
        }

        .name-cell .email {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.625rem;
          border-radius: 1rem;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .col-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.375rem 0.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
          border-radius: 0.25rem;
          transition: background 0.2s;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .action-btn.success:hover {
          background: rgba(16, 185, 129, 0.2);
        }

        .action-btn.danger:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        /* States */
        .loading-state,
        .error-state,
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

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
        }

        .modal {
          background: var(--color-surface);
          border-radius: 0.75rem;
          width: 100%;
          max-width: 480px;
          margin: 1rem;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: var(--color-text);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--color-text-muted);
          cursor: pointer;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-body p {
          color: var(--color-text);
          margin: 0 0 1rem;
        }

        .warning {
          color: #f59e0b !important;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Buttons */
        .btn {
          padding: 0.625rem 1.25rem;
          border-radius: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-secondary {
          background: var(--color-surface);
          color: var(--color-text);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-ghost {
          background: transparent;
          color: var(--color-text-muted);
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-warning {
          background: #f59e0b;
          color: white;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn:hover {
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .tickets-table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}

// Quick Verify Modal Component
function VerifyModal({ onClose }) {
  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setLoading(true);
    try {
      const response = await ticketsApi.verify(ticketId.toUpperCase());
      setResult({ success: true, data: response.data });
    } catch (err) {
      setResult({ success: false, error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3>Quick Verify</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleVerify}>
            <input
              type="text"
              placeholder="Enter Ticket ID (e.g. VBS-ABC123)"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className="verify-input"
              autoFocus
            />
            <button 
              type="submit" 
              className="btn btn-primary verify-btn"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Check In'}
            </button>
          </form>

          {result && (
            <div className={`verify-result ${result.success ? 'success' : 'error'}`}>
              {result.success ? (
                <>
                  <div className="result-icon">✅</div>
                  <div className="result-text">
                    <strong>{result.data.name}</strong> checked in successfully!
                  </div>
                </>
              ) : (
                <>
                  <div className="result-icon">❌</div>
                  <div className="result-text">{result.error}</div>
                </>
              )}
            </div>
          )}
        </div>

        <style>{`
          .verify-input {
            width: 100%;
            padding: 1rem;
            font-size: 1.25rem;
            text-align: center;
            text-transform: uppercase;
            font-family: monospace;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            color: var(--color-text);
            margin-bottom: 1rem;
          }

          .verify-input:focus {
            outline: none;
            border-color: var(--color-primary);
          }

          .verify-btn {
            width: 100%;
            padding: 1rem;
          }

          .verify-result {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .verify-result.success {
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
          }

          .verify-result.error {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }

          .result-icon {
            font-size: 1.5rem;
          }
        `}</style>
      </div>
    </div>
  );
}

// Create Ticket Modal Component  
function CreateTicketModal({ onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    amount: 0,
    status: 'PAID',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await ticketsApi.create(formData);
      queryClient.invalidateQueries(['tickets']);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create ticket');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Ticket</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}
            
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Amount (cents)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>

        <style>{`
          .form-group {
            margin-bottom: 1rem;
          }

          .form-group label {
            display: block;
            margin-bottom: 0.375rem;
            font-size: 0.875rem;
            color: var(--color-text-muted);
          }

          .form-group input,
          .form-group select {
            width: 100%;
            padding: 0.625rem 0.875rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.375rem;
            color: var(--color-text);
            font-size: 0.875rem;
          }

          .form-group input:focus,
          .form-group select:focus {
            outline: none;
            border-color: var(--color-primary);
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .form-error {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            padding: 0.75rem;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
            font-size: 0.875rem;
          }
        `}</style>
      </div>
    </div>
  );
}

