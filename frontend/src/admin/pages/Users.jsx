/**
 * Users Management Page
 * CRUD for admin users with role management
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', color: '#ef4444' },
  { value: 'ADMIN', label: 'Admin', color: '#8b5cf6' },
  { value: 'STAFF', label: 'Staff', color: '#3b82f6' },
  { value: 'CHECKER', label: 'Checker', color: '#10b981' },
];

export default function Users() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/auth/users');
      return response.data || [];
    },
  });

  const users = data || [];

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (userId) => api.delete(`/auth/users/${userId}`),
    onSuccess: () => queryClient.invalidateQueries(['users']),
  });

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleDelete = (user) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const getRoleInfo = (role) => ROLES.find(r => r.value === role) || ROLES[2];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="users-page">
      {/* Header */}
      <div className="page-header">
        <h1>Users</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          ➕ Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="table-container">
        {isLoading ? (
          <div className="loading-state">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <div className="empty-title">No users yet</div>
            <div className="empty-desc">Add users to manage your team</div>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                return (
                  <tr key={user.id}>
                    <td className="user-cell">
                      <div className="user-avatar">
                        {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="role-badge"
                        style={{ 
                          background: `${roleInfo.color}20`,
                          color: roleInfo.color 
                        }}
                      >
                        {roleInfo.label}
                      </span>
                    </td>
                    <td>
                      <span className={`status-dot ${user.isActive ? 'active' : 'inactive'}`} />
                      {user.isActive ? 'Active' : 'Inactive'}
                    </td>
                    <td>{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn"
                        onClick={() => handleEdit(user)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn danger"
                        onClick={() => handleDelete(user)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* User Modal */}
      {showModal && (
        <UserModal 
          user={editingUser} 
          onClose={() => setShowModal(false)} 
        />
      )}

      <style>{`
        .users-page {
          max-width: 1200px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
        }

        /* Table */
        .table-container {
          background: var(--color-surface);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th,
        .users-table td {
          padding: 1rem 1.25rem;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .users-table th {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.02);
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 500;
          color: var(--color-text);
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .role-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 0.5rem;
        }

        .status-dot.active {
          background: #10b981;
        }

        .status-dot.inactive {
          background: #6b7280;
        }

        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.375rem 0.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
          border-radius: 0.25rem;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .action-btn.danger:hover {
          background: rgba(239, 68, 68, 0.2);
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
        }

        .btn {
          padding: 0.625rem 1.25rem;
          border-radius: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }
      `}</style>
    </div>
  );
}

// User Modal Component
function UserModal({ user, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'STAFF',
    isActive: user?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (user) {
        // Update
        await api.patch(`/auth/users/${user.id}`, formData);
      } else {
        // Create
        await api.post('/auth/register', formData);
      }
      queryClient.invalidateQueries(['users']);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save user');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{user ? 'Edit User' : 'Add New User'}</h3>
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
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>{user ? 'New Password (leave empty to keep current)' : 'Password *'}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!user}
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label>Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>

            {user && (
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>

        <style>{`
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

          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            padding: 1rem 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }

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

          .form-group.checkbox label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
          }

          .form-group.checkbox input {
            width: auto;
          }

          .form-error {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            padding: 0.75rem;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
            font-size: 0.875rem;
          }

          .btn-ghost {
            background: transparent;
            color: var(--color-text-muted);
          }
        `}</style>
      </div>
    </div>
  );
}

