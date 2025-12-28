/**
 * Events Page
 * Browse all available events with filtering
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/layout';
import { Spinner, Input } from '../components/ui';
import api from '../lib/api';

async function fetchEvents() {
  const response = await api.get('/events?active=true');
  return response.data.data || [];
}

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000,
  });
  
  // Filter events based on search
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    
    const query = searchQuery.toLowerCase();
    return events.filter(event => 
      event.name.toLowerCase().includes(query) ||
      event.venue?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);
  
  // Group events by month
  const groupedEvents = useMemo(() => {
    const groups = {};
    
    filteredEvents.forEach(event => {
      const date = new Date(event.eventDate);
      const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(event);
    });
    
    return groups;
  }, [filteredEvents]);
  
  return (
    <Layout>
      {/* Header */}
      <section className="page-header">
        <div className="container">
          <h1>Upcoming Events</h1>
          <p>Find and book tickets for amazing events</p>
        </div>
      </section>
      
      {/* Filters */}
      <section className="filters-section">
        <div className="container">
          <div className="filters-bar">
            <div className="search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="view-toggles">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          
          {searchQuery && (
            <div className="search-results-info">
              Found {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} 
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </div>
      </section>
      
      {/* Events List */}
      <section className="events-list-section">
        <div className="container">
          {isLoading ? (
            <div className="loading-state">
              <Spinner size="lg" />
              <p>Loading events...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <h3>Failed to Load Events</h3>
              <p>Please try again later</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <h3>No Events Found</h3>
              <p>
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Check back soon for upcoming events!'}
              </p>
              {searchQuery && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="events-grid">
              {Object.entries(groupedEvents).map(([month, monthEvents]) => (
                <div key={month} className="events-month-group">
                  <h2 className="month-header">{month}</h2>
                  <div className="month-events-grid">
                    {monthEvents.map((event, index) => (
                      <EventGridCard key={event.id} event={event} index={index} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="events-list">
              {Object.entries(groupedEvents).map(([month, monthEvents]) => (
                <div key={month} className="events-month-group">
                  <h2 className="month-header">{month}</h2>
                  <div className="month-events-list">
                    {monthEvents.map((event, index) => (
                      <EventListCard key={event.id} event={event} index={index} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      <style>{`
        .page-header {
          background: linear-gradient(135deg, var(--color-surface), var(--color-background));
          padding: 4rem 0;
          text-align: center;
        }
        
        .page-header h1 {
          margin-bottom: 0.5rem;
        }
        
        .page-header p {
          color: var(--color-text-muted);
          font-size: 1.125rem;
          margin: 0;
        }
        
        .filters-section {
          background: var(--color-background);
          padding: 1.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          position: sticky;
          top: var(--header-height);
          z-index: 50;
        }
        
        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        
        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }
        
        .search-box svg {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
          pointer-events: none;
        }
        
        .search-input {
          width: 100%;
          padding: 0.75rem 2.5rem;
          background: var(--color-surface);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
          color: var(--color-text);
          font-size: 1rem;
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        
        .clear-btn {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          padding: 0.25rem;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
        }
        
        .clear-btn:hover {
          color: var(--color-text);
        }
        
        .view-toggles {
          display: flex;
          gap: 0.25rem;
          padding: 0.25rem;
          background: var(--color-surface);
          border-radius: var(--radius);
        }
        
        .view-btn {
          padding: 0.5rem 0.75rem;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          border-radius: calc(var(--radius) - 2px);
          display: flex;
          transition: all var(--transition-fast);
        }
        
        .view-btn:hover {
          color: var(--color-text);
        }
        
        .view-btn.active {
          background: var(--color-primary);
          color: white;
        }
        
        .search-results-info {
          margin-top: 1rem;
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }
        
        .events-list-section {
          padding: 2rem 0 4rem;
          min-height: 50vh;
        }
        
        .events-month-group {
          margin-bottom: 3rem;
        }
        
        .month-header {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          color: var(--color-text-muted);
          font-weight: 500;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.75rem;
        }
        
        .month-events-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        
        .month-events-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .loading-state,
        .error-state,
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--color-text-muted);
        }
        
        .empty-state svg,
        .error-state svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        .empty-state h3,
        .error-state h3 {
          margin-bottom: 0.5rem;
          color: var(--color-text);
        }
        
        .empty-state button {
          margin-top: 1rem;
        }
        
        @media (max-width: 1024px) {
          .month-events-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 640px) {
          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            max-width: none;
          }
          
          .view-toggles {
            align-self: flex-end;
          }
          
          .month-events-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}

// Grid Event Card
function EventGridCard({ event, index }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      weekday: date.toLocaleString('default', { weekday: 'short' }),
    };
  };
  
  const dateInfo = formatDate(event.eventDate);
  
  return (
    <Link 
      to={`/events/${event.slug || event.id}`}
      className="event-grid-card animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="card-image">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.name} />
        ) : (
          <div className="image-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
            </svg>
          </div>
        )}
        <div className="date-badge">
          <span className="date-day">{dateInfo.day}</span>
          <span className="date-month">{dateInfo.month}</span>
        </div>
      </div>
      <div className="card-content">
        <h3>{event.name}</h3>
        <div className="event-meta">
          {event.venue && (
            <span className="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {event.venue}
            </span>
          )}
          <span className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {event.eventTime}
          </span>
        </div>
      </div>
      
      <style>{`
        .event-grid-card {
          display: block;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform var(--transition-base), box-shadow var(--transition-base);
        }
        
        .event-grid-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
        }
        
        .card-image {
          position: relative;
          aspect-ratio: 16/10;
          background: var(--color-background);
        }
        
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          background: linear-gradient(135deg, var(--color-surface), var(--color-background));
        }
        
        .date-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: var(--color-primary);
          color: white;
          border-radius: var(--radius);
          text-align: center;
          padding: 0.5rem 0.75rem;
          line-height: 1.2;
        }
        
        .date-day {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .date-month {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .card-content {
          padding: 1.25rem;
        }
        
        .card-content h3 {
          font-size: 1.125rem;
          margin-bottom: 0.75rem;
          color: var(--color-text);
        }
        
        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }
        
        .meta-item svg {
          flex-shrink: 0;
        }
      `}</style>
    </Link>
  );
}

// List Event Card
function EventListCard({ event, index }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <Link 
      to={`/events/${event.slug || event.id}`}
      className="event-list-card animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="list-card-image">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.name} />
        ) : (
          <div className="list-image-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
            </svg>
          </div>
        )}
      </div>
      <div className="list-card-content">
        <h3>{event.name}</h3>
        <div className="list-event-meta">
          <span className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
            </svg>
            {formatDate(event.eventDate)} at {event.eventTime}
          </span>
          {event.venue && (
            <span className="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {event.venue}
            </span>
          )}
        </div>
        {event.description && (
          <p className="list-event-description">{event.description}</p>
        )}
      </div>
      <div className="list-card-action">
        <span className="btn btn-primary btn-sm">Get Tickets</span>
      </div>
      
      <style>{`
        .event-list-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform var(--transition-base), box-shadow var(--transition-base);
        }
        
        .event-list-card:hover {
          transform: translateX(5px);
          box-shadow: var(--shadow-lg);
        }
        
        .list-card-image {
          flex-shrink: 0;
          width: 120px;
          height: 80px;
          border-radius: var(--radius);
          overflow: hidden;
          background: var(--color-background);
        }
        
        .list-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .list-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
        }
        
        .list-card-content {
          flex: 1;
          min-width: 0;
        }
        
        .list-card-content h3 {
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
          color: var(--color-text);
        }
        
        .list-event-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .list-event-description {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .list-card-action {
          flex-shrink: 0;
        }
        
        @media (max-width: 640px) {
          .event-list-card {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
          
          .list-card-image {
            width: 100%;
            height: 160px;
          }
          
          .list-event-meta {
            justify-content: center;
          }
          
          .list-card-action {
            align-self: center;
          }
        }
      `}</style>
    </Link>
  );
}

