/**
 * Events Management Page
 * CRUD for events and ticket types
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../../lib/api';

export default function Events() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Fetch events
  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await eventsApi.list();
      return response.data || [];
    },
  });

  const events = data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (eventId) => eventsApi.delete(eventId),
    onSuccess: () => queryClient.invalidateQueries(['events']),
  });

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setShowModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="events-page">
      {/* Header */}
      <div className="page-header">
        <h1>Events</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          ➕ New Event
        </button>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="loading-state">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div className="empty-title">No events yet</div>
          <div className="empty-desc">Create your first event to start selling tickets</div>
          <button className="btn btn-primary" onClick={handleCreate}>
            Create Event
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div 
                className="event-image"
                style={{ 
                  backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : undefined 
                }}
              >
                {!event.imageUrl && <span className="event-emoji">📅</span>}
                <span className={`event-status ${event.isActive ? 'active' : 'inactive'}`}>
                  {event.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="event-content">
                <h3>{event.name}</h3>
                <div className="event-meta">
                  <span>📍 {event.venue || 'TBD'}</span>
                  <span>📅 {formatDate(event.eventDate)}</span>
                  <span>🕐 {event.eventTime || 'TBD'}</span>
                </div>
                <p className="event-desc">{event.description || 'No description'}</p>
                <div className="event-stats">
                  <span>🎟️ {event._count?.tickets || 0} tickets</span>
                </div>
              </div>
              <div className="event-actions">
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleEdit(event)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    if (confirm('Delete this event?')) {
                      deleteMutation.mutate(event.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Modal */}
      {showModal && (
        <EventModal
          event={editingEvent}
          onClose={() => setShowModal(false)}
        />
      )}

      <style>{`
        .events-page {
          max-width: 1400px;
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

        .loading-state,
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          background: var(--color-surface);
          border-radius: 0.75rem;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 0.5rem;
        }

        .empty-desc {
          color: var(--color-text-muted);
          margin-bottom: 1.5rem;
        }

        /* Events Grid */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .event-card {
          background: var(--color-surface);
          border-radius: 0.75rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .event-image {
          height: 160px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .event-emoji {
          font-size: 3rem;
        }

        .event-status {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .event-status.active {
          background: rgba(16, 185, 129, 0.9);
          color: white;
        }

        .event-status.inactive {
          background: rgba(107, 114, 128, 0.9);
          color: white;
        }

        .event-content {
          padding: 1.25rem;
          flex: 1;
        }

        .event-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0 0 0.75rem;
        }

        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          margin-bottom: 0.75rem;
        }

        .event-meta span {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
        }

        .event-desc {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin: 0 0 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .event-stats {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
        }

        .event-actions {
          display: flex;
          gap: 0.5rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .btn {
          padding: 0.625rem 1.25rem;
          border-radius: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text);
        }

        .btn-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        @media (max-width: 640px) {
          .events-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// Event Modal Component
function EventModal({ event, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: event?.name || '',
    slug: event?.slug || '',
    description: event?.description || '',
    venue: event?.venue || '',
    eventDate: event?.eventDate ? event.eventDate.split('T')[0] : '',
    eventTime: event?.eventTime || '',
    isActive: event?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (event) {
        await eventsApi.update(event.id, form);
      } else {
        await eventsApi.create(form);
      }
      queryClient.invalidateQueries(['events']);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save event');
    }
    setLoading(false);
  };

  // Auto-generate slug from name
  const handleNameChange = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setForm({ ...form, name, slug: event ? form.slug : slug });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{event ? 'Edit Event' : 'Create Event'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}
            
            <div className="form-group">
              <label>Event Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Venue</label>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="text"
                  value={form.eventTime}
                  onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                  placeholder="e.g. 09:00 AM"
                />
              </div>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active (visible to public)
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
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
            max-width: 560px;
            margin: 1rem;
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            position: sticky;
            top: 0;
            background: var(--color-surface);
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
          .form-group select,
          .form-group textarea {
            width: 100%;
            padding: 0.625rem 0.875rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.375rem;
            color: var(--color-text);
            font-size: 0.875rem;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
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

