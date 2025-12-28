/**
 * Home Page
 * Landing page with hero, featured events, and CTA
 */

import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/layout';
import { useTheme } from '../components/ThemeProvider';
import { Spinner } from '../components/ui';
import api from '../lib/api';

// Fetch featured events
async function fetchFeaturedEvents() {
  const response = await api.get('/events?active=true&limit=6');
  return response.data.data || [];
}

export default function Home() {
  const config = useTheme();
  
  const { data: events, isLoading } = useQuery({
    queryKey: ['featuredEvents'],
    queryFn: fetchFeaturedEvents,
    staleTime: 5 * 60 * 1000,
  });
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero" style={{
        backgroundImage: config?.heroImageUrl ? `url(${config.heroImageUrl})` : undefined
      }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title animate-slide-up">
            {config?.homePageTitle || 'Welcome'}
          </h1>
          <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '100ms' }}>
            {config?.homePageSubtitle || 'Get your tickets for upcoming events'}
          </p>
          <div className="hero-actions animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link to="/events" className="btn btn-primary btn-lg">
              Browse Events
            </Link>
            <Link to="/view" className="btn btn-outline btn-lg">
              Find My Ticket
            </Link>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3>Easy Booking</h3>
              <p>Select your event, choose tickets, and checkout in minutes</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M7 7h.01M7 12h.01M7 17h.01M12 7h5M12 12h5M12 17h5" />
                </svg>
              </div>
              <h3>Digital Tickets</h3>
              <p>Get your tickets instantly via email with QR codes</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3>Secure Payments</h3>
              <p>Multiple payment options with enterprise-grade security</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Events Section */}
      <section className="events-section">
        <div className="container">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <Link to="/events" className="view-all-link">
              View All <span>→</span>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="loading-state">
              <Spinner size="lg" />
              <p>Loading events...</p>
            </div>
          ) : events?.length > 0 ? (
            <div className="events-grid">
              {events.slice(0, 6).map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <h3>No Events Yet</h3>
              <p>Check back soon for upcoming events!</p>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Your Tickets?</h2>
            <p>Don't miss out on amazing events. Get your tickets today!</p>
            <Link to="/events" className="btn btn-accent btn-lg">
              Get Tickets Now
            </Link>
          </div>
        </div>
      </section>
      
      <style>{`
        /* Hero Section */
        .hero {
          position: relative;
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background-size: cover;
          background-position: center;
          background-color: var(--color-surface);
        }
        
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(15, 23, 42, 0.7) 0%,
            rgba(15, 23, 42, 0.9) 100%
          );
        }
        
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          padding: 2rem;
        }
        
        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--color-text) 0%, var(--color-text-muted) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-subtitle {
          font-size: clamp(1.125rem, 2vw, 1.5rem);
          color: var(--color-text-muted);
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .scroll-indicator {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          color: var(--color-text-muted);
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(10px); }
        }
        
        /* Features Section */
        .features {
          padding: 5rem 0;
          background: var(--color-background);
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        
        .feature-card {
          text-align: center;
          padding: 2rem;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform var(--transition-base), box-shadow var(--transition-base);
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }
        
        .feature-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          border-radius: var(--radius-lg);
          color: white;
        }
        
        .feature-card h3 {
          margin-bottom: 0.75rem;
          font-size: 1.25rem;
        }
        
        .feature-card p {
          font-size: 0.9375rem;
          margin: 0;
        }
        
        /* Events Section */
        .events-section {
          padding: 5rem 0;
          background: var(--color-surface);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .section-header h2 {
          margin: 0;
        }
        
        .view-all-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-primary);
          font-weight: 500;
          transition: gap var(--transition-fast);
        }
        
        .view-all-link:hover {
          gap: 0.75rem;
        }
        
        .events-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        
        .loading-state,
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--color-text-muted);
        }
        
        .empty-state svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        .empty-state h3 {
          margin-bottom: 0.5rem;
        }
        
        /* CTA Section */
        .cta-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
        }
        
        .cta-content {
          text-align: center;
          color: white;
        }
        
        .cta-content h2 {
          color: white;
          margin-bottom: 1rem;
        }
        
        .cta-content p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.125rem;
          margin-bottom: 2rem;
        }
        
        .cta-content .btn {
          background: white;
          color: var(--color-primary);
        }
        
        .cta-content .btn:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-2px);
        }
        
        /* Responsive */
        @media (max-width: 1024px) {
          .features-grid,
          .events-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 640px) {
          .features-grid,
          .events-grid {
            grid-template-columns: 1fr;
          }
          
          .hero {
            min-height: 80vh;
          }
          
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </Layout>
  );
}

// Event Card Component
function EventCard({ event, index }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <Link 
      to={`/events/${event.slug || event.id}`} 
      className="event-card animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="event-image">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.name} />
        ) : (
          <div className="event-image-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        )}
        <div className="event-date-badge">
          {formatDate(event.eventDate)}
        </div>
      </div>
      <div className="event-info">
        <h3 className="event-name">{event.name}</h3>
        {event.venue && (
          <p className="event-venue">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {event.venue}
          </p>
        )}
        <div className="event-footer">
          <span className="event-time">{event.eventTime}</span>
          <span className="event-cta">Get Tickets →</span>
        </div>
      </div>
      
      <style>{`
        .event-card {
          display: block;
          background: var(--color-background);
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform var(--transition-base), box-shadow var(--transition-base);
        }
        
        .event-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
        }
        
        .event-image {
          position: relative;
          aspect-ratio: 16/9;
          background: var(--color-surface);
        }
        
        .event-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .event-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          background: linear-gradient(135deg, var(--color-surface), var(--color-background));
        }
        
        .event-date-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          padding: 0.5rem 1rem;
          background: var(--color-primary);
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: var(--radius);
        }
        
        .event-info {
          padding: 1.25rem;
        }
        
        .event-name {
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
          color: var(--color-text);
        }
        
        .event-venue {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin-bottom: 1rem;
        }
        
        .event-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .event-time {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }
        
        .event-cta {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-primary);
          transition: gap var(--transition-fast);
        }
        
        .event-card:hover .event-cta {
          color: var(--color-accent);
        }
      `}</style>
    </Link>
  );
}

