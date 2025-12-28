/**
 * Event Details Page
 * View event info and select tickets
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/layout';
import { Button, Spinner, Alert } from '../components/ui';
import { useLocalization } from '../hooks/useConfig';
import api from '../lib/api';

async function fetchEvent(idOrSlug) {
  const response = await api.get(`/events/${idOrSlug}`);
  return response.data.data;
}

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currency, currencySymbol } = useLocalization();
  
  const [selectedTickets, setSelectedTickets] = useState({});
  const [error, setError] = useState(null);
  
  const { data: event, isLoading, error: fetchError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEvent(eventId),
    staleTime: 5 * 60 * 1000,
  });
  
  // Calculate total
  const total = event?.ticketTypes?.reduce((sum, type) => {
    const quantity = selectedTickets[type.id] || 0;
    return sum + (type.price * quantity);
  }, 0) || 0;
  
  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  
  const handleQuantityChange = (typeId, delta) => {
    setSelectedTickets(prev => {
      const current = prev[typeId] || 0;
      const newValue = Math.max(0, Math.min(10, current + delta));
      
      if (newValue === 0) {
        const { [typeId]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [typeId]: newValue };
    });
  };
  
  const handleProceedToCheckout = () => {
    if (totalTickets === 0) {
      setError('Please select at least one ticket');
      return;
    }
    
    // Store selection in sessionStorage for checkout page
    sessionStorage.setItem('checkout', JSON.stringify({
      eventId: event.id,
      eventName: event.name,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      tickets: Object.entries(selectedTickets).map(([typeId, quantity]) => {
        const type = event.ticketTypes.find(t => t.id === typeId);
        return {
          typeId,
          typeName: type.name,
          price: type.price,
          quantity,
        };
      }),
      total,
      currency,
    }));
    
    navigate('/checkout');
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const formatPrice = (amount) => {
    return `${currencySymbol}${(amount / 100).toFixed(2)}`;
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="loading-page">
          <Spinner size="lg" />
          <p>Loading event...</p>
        </div>
      </Layout>
    );
  }
  
  if (fetchError || !event) {
    return (
      <Layout>
        <div className="error-page">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <h2>Event Not Found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/events')}>
            Browse Events
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      {/* Hero Banner */}
      <section className="event-hero" style={{
        backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : undefined
      }}>
        <div className="hero-overlay" />
        <div className="hero-content container">
          <div className="event-badge">
            {new Date(event.eventDate) > new Date() ? 'Upcoming' : 'Past Event'}
          </div>
          <h1>{event.name}</h1>
          <div className="event-quick-info">
            <span className="info-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
              </svg>
              {formatDate(event.eventDate)}
            </span>
            <span className="info-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {event.eventTime}
            </span>
            {event.venue && (
              <span className="info-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {event.venue}
              </span>
            )}
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="event-content">
        <div className="container">
          <div className="content-grid">
            {/* Left: Event Details */}
            <div className="event-details">
              <div className="details-section">
                <h2>About This Event</h2>
                <p className="event-description">
                  {event.description || 'Join us for an amazing event! More details coming soon.'}
                </p>
              </div>
              
              {event.venue && (
                <div className="details-section">
                  <h3>Venue</h3>
                  <div className="venue-info">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{event.venue}</span>
                  </div>
                </div>
              )}
              
              <div className="details-section">
                <h3>Event Schedule</h3>
                <div className="schedule-info">
                  <div className="schedule-item">
                    <strong>Date</strong>
                    <span>{formatDate(event.eventDate)}</span>
                  </div>
                  <div className="schedule-item">
                    <strong>Time</strong>
                    <span>{event.eventTime}</span>
                  </div>
                  {event.endDate && (
                    <div className="schedule-item">
                      <strong>End Date</strong>
                      <span>{formatDate(event.endDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right: Ticket Selection */}
            <div className="ticket-selection">
              <div className="ticket-card">
                <h2>Select Tickets</h2>
                
                {error && (
                  <Alert variant="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}
                
                {event.ticketTypes?.length > 0 ? (
                  <div className="ticket-types">
                    {event.ticketTypes.map(type => {
                      const available = type.quantity - (type.sold || 0);
                      const isAvailable = available > 0;
                      const quantity = selectedTickets[type.id] || 0;
                      
                      return (
                        <div key={type.id} className={`ticket-type ${!isAvailable ? 'sold-out' : ''}`}>
                          <div className="type-info">
                            <h4>{type.name}</h4>
                            {type.description && (
                              <p className="type-description">{type.description}</p>
                            )}
                            <div className="type-price">{formatPrice(type.price)}</div>
                            <div className="type-availability">
                              {isAvailable ? (
                                <span className="available">{available} available</span>
                              ) : (
                                <span className="sold-out-badge">Sold Out</span>
                              )}
                            </div>
                          </div>
                          
                          {isAvailable && (
                            <div className="quantity-selector">
                              <button
                                className="qty-btn"
                                onClick={() => handleQuantityChange(type.id, -1)}
                                disabled={quantity === 0}
                                aria-label="Decrease quantity"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                              </button>
                              <span className="qty-value">{quantity}</span>
                              <button
                                className="qty-btn"
                                onClick={() => handleQuantityChange(type.id, 1)}
                                disabled={quantity >= 10 || quantity >= available}
                                aria-label="Increase quantity"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-tickets">
                    <p>Tickets are not yet available for this event.</p>
                  </div>
                )}
                
                {/* Order Summary */}
                {totalTickets > 0 && (
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Tickets ({totalTickets})</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="primary" 
                  className="checkout-btn"
                  onClick={handleProceedToCheckout}
                  disabled={totalTickets === 0}
                >
                  {totalTickets === 0 ? 'Select Tickets' : `Proceed to Checkout`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <style>{`
        .loading-page,
        .error-page {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          gap: 1rem;
        }
        
        .error-page svg {
          color: var(--color-text-muted);
        }
        
        .error-page h2 {
          margin: 0;
        }
        
        .error-page p {
          margin-bottom: 1rem;
        }
        
        .event-hero {
          position: relative;
          min-height: 400px;
          display: flex;
          align-items: flex-end;
          background-size: cover;
          background-position: center;
          background-color: var(--color-surface);
        }
        
        .event-hero .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(15, 23, 42, 0.95) 0%,
            rgba(15, 23, 42, 0.5) 100%
          );
        }
        
        .event-hero .hero-content {
          position: relative;
          z-index: 1;
          padding: 3rem 0;
        }
        
        .event-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          background: var(--color-primary);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-radius: var(--radius-full);
          margin-bottom: 1rem;
        }
        
        .event-hero h1 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          margin-bottom: 1.5rem;
        }
        
        .event-quick-info {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-muted);
          font-size: 1rem;
        }
        
        .event-content {
          padding: 3rem 0;
        }
        
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 3rem;
          align-items: start;
        }
        
        .event-details {
          padding-right: 2rem;
        }
        
        .details-section {
          margin-bottom: 2rem;
        }
        
        .details-section h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .details-section h3 {
          font-size: 1.125rem;
          margin-bottom: 0.75rem;
        }
        
        .event-description {
          font-size: 1.0625rem;
          line-height: 1.75;
          color: var(--color-text-muted);
          white-space: pre-wrap;
        }
        
        .venue-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-muted);
        }
        
        .schedule-info {
          display: grid;
          gap: 0.75rem;
        }
        
        .schedule-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .schedule-item strong {
          color: var(--color-text);
        }
        
        .schedule-item span {
          color: var(--color-text-muted);
        }
        
        /* Ticket Selection */
        .ticket-selection {
          position: sticky;
          top: calc(var(--header-height) + 2rem);
        }
        
        .ticket-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .ticket-card h2 {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
        }
        
        .ticket-types {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .ticket-type {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--color-background);
          border-radius: var(--radius);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .ticket-type.sold-out {
          opacity: 0.5;
        }
        
        .type-info h4 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }
        
        .type-description {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
          margin-bottom: 0.5rem;
        }
        
        .type-price {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-accent);
          margin-bottom: 0.25rem;
        }
        
        .type-availability {
          font-size: 0.75rem;
        }
        
        .available {
          color: var(--color-success);
        }
        
        .sold-out-badge {
          color: var(--color-error);
          font-weight: 600;
        }
        
        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--color-surface);
          padding: 0.25rem;
          border-radius: var(--radius);
        }
        
        .qty-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-background);
          border: none;
          border-radius: calc(var(--radius) - 2px);
          color: var(--color-text);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .qty-btn:hover:not(:disabled) {
          background: var(--color-primary);
          color: white;
        }
        
        .qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .qty-value {
          min-width: 24px;
          text-align: center;
          font-weight: 600;
        }
        
        .no-tickets {
          text-align: center;
          padding: 2rem;
          color: var(--color-text-muted);
        }
        
        .order-summary {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1rem;
          margin-bottom: 1rem;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          color: var(--color-text-muted);
        }
        
        .summary-row.total {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 0.5rem;
          padding-top: 0.75rem;
        }
        
        .checkout-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
        }
        
        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          
          .event-details {
            padding-right: 0;
          }
          
          .ticket-selection {
            position: static;
          }
        }
        
        @media (max-width: 640px) {
          .event-hero {
            min-height: 300px;
          }
          
          .event-quick-info {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .ticket-type {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </Layout>
  );
}

