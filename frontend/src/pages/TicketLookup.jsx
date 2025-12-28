/**
 * Ticket Lookup Page
 * Find and view tickets by phone/email and access code
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Layout } from '../components/layout';
import { Button, Input, Alert, Spinner, Card } from '../components/ui';
import { useLocalization } from '../hooks/useConfig';
import api from '../lib/api';
import QRCode from 'qrcode';

export default function TicketLookup() {
  const { currencySymbol } = useLocalization();
  
  const [phone, setPhone] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [ticket, setTicket] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState(null);
  
  const lookupMutation = useMutation({
    mutationFn: async ({ phone, accessCode }) => {
      const response = await api.get('/tickets/lookup', {
        params: { phone, accessCode: accessCode.toUpperCase() },
      });
      return response.data.data;
    },
    onSuccess: async (data) => {
      setTicket(data);
      setError(null);
      
      // Generate QR code
      try {
        const qrData = JSON.stringify({
          ticketId: data.ticketId,
          accessCode: data.accessCode,
        });
        const url = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        });
        setQrCodeUrl(url);
      } catch (e) {
        console.error('Failed to generate QR code', e);
      }
    },
    onError: (err) => {
      setTicket(null);
      setQrCodeUrl('');
      setError(err.response?.data?.error || 'Ticket not found. Please check your details and try again.');
    },
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    
    if (!accessCode.trim()) {
      setError('Please enter your access code');
      return;
    }
    
    lookupMutation.mutate({ phone: phone.trim(), accessCode: accessCode.trim() });
  };
  
  const handleDownloadPdf = async () => {
    if (!ticket) return;
    
    try {
      const response = await api.get(`/tickets/${ticket.ticketId}/pdf`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${ticket.ticketId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download PDF. Please try again.');
    }
  };
  
  const handleReset = () => {
    setTicket(null);
    setQrCodeUrl('');
    setPhone('');
    setAccessCode('');
    setError(null);
  };
  
  const formatPrice = (amount) => {
    return `${currencySymbol}${(amount / 100).toFixed(2)}`;
  };
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      PAID: { class: 'badge-success', label: 'Confirmed' },
      PENDING: { class: 'badge-warning', label: 'Pending' },
      USED: { class: 'badge-info', label: 'Checked In' },
      CANCELLED: { class: 'badge-error', label: 'Cancelled' },
      REFUNDED: { class: 'badge-neutral', label: 'Refunded' },
    };
    return statusConfig[status] || { class: 'badge-neutral', label: status };
  };
  
  return (
    <Layout>
      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <h1>Find My Tickets</h1>
          <p>Enter your details to access your tickets</p>
        </div>
      </section>
      
      <section className="lookup-section">
        <div className="container">
          {!ticket ? (
            <div className="lookup-form-container">
              <Card className="lookup-card">
                <form onSubmit={handleSubmit} className="lookup-form">
                  {error && (
                    <Alert variant="error" onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                    />
                    <p className="input-help">The phone number used during purchase</p>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="accessCode">Access Code</label>
                    <Input
                      id="accessCode"
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      placeholder="e.g. ABC12"
                      maxLength={5}
                      className="access-code-input"
                      autoComplete="off"
                    />
                    <p className="input-help">5-character code from your confirmation email</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="submit-btn"
                    disabled={lookupMutation.isPending}
                  >
                    {lookupMutation.isPending ? (
                      <><Spinner size="sm" /> Searching...</>
                    ) : (
                      'Find My Ticket'
                    )}
                  </Button>
                </form>
              </Card>
              
              <div className="lookup-help">
                <h3>Need Help?</h3>
                <p>
                  Your access code was sent to you via email after your purchase. 
                  If you can't find it, please check your spam folder or contact support.
                </p>
              </div>
            </div>
          ) : (
            <div className="ticket-display">
              <div className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-status">
                    <span className={`badge ${getStatusBadge(ticket.status).class}`}>
                      {getStatusBadge(ticket.status).label}
                    </span>
                  </div>
                  <h2 className="ticket-id">{ticket.ticketId}</h2>
                </div>
                
                <div className="ticket-body">
                  <div className="ticket-main">
                    <div className="ticket-info-grid">
                      <div className="info-item">
                        <span className="info-label">Name</span>
                        <span className="info-value">{ticket.name}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Ticket Type</span>
                        <span className="info-value">{ticket.ticketTypeName}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Event Date</span>
                        <span className="info-value">{ticket.eventDate}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Event Time</span>
                        <span className="info-value">{ticket.eventTime}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Amount</span>
                        <span className="info-value">{formatPrice(ticket.amount)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Access Code</span>
                        <span className="info-value code">{ticket.accessCode}</span>
                      </div>
                    </div>
                    
                    {ticket.used && ticket.verifiedAt && (
                      <div className="checked-in-notice">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span>
                          Checked in at {new Date(ticket.verifiedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="ticket-qr">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Ticket QR Code" />
                    ) : (
                      <div className="qr-placeholder">
                        <Spinner size="md" />
                      </div>
                    )}
                    <p className="qr-help">Show this code at entry</p>
                  </div>
                </div>
                
                <div className="ticket-actions">
                  <Button variant="primary" onClick={handleDownloadPdf}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download PDF
                  </Button>
                  <Button variant="secondary" onClick={handleReset}>
                    Look Up Another Ticket
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      <style>{`
        .page-hero {
          background: linear-gradient(135deg, var(--color-surface), var(--color-background));
          padding: 4rem 0;
          text-align: center;
        }
        
        .page-hero h1 {
          margin-bottom: 0.5rem;
        }
        
        .page-hero p {
          color: var(--color-text-muted);
          font-size: 1.125rem;
          margin: 0;
        }
        
        .lookup-section {
          padding: 3rem 0;
          min-height: 50vh;
        }
        
        .lookup-form-container {
          max-width: 500px;
          margin: 0 auto;
        }
        
        .lookup-card {
          padding: 2rem;
        }
        
        .lookup-form {
          display: flex;
          flex-direction: column;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        
        .input-help {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
          margin-top: 0.375rem;
        }
        
        .access-code-input input {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-weight: 600;
        }
        
        .submit-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
        }
        
        .lookup-help {
          text-align: center;
          margin-top: 2rem;
          padding: 1.5rem;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
        }
        
        .lookup-help h3 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .lookup-help p {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin: 0;
        }
        
        /* Ticket Display */
        .ticket-display {
          max-width: 700px;
          margin: 0 auto;
        }
        
        .ticket-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .ticket-header {
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          padding: 1.5rem;
          text-align: center;
        }
        
        .ticket-status {
          margin-bottom: 0.5rem;
        }
        
        .ticket-id {
          color: white;
          font-size: 2rem;
          margin: 0;
          letter-spacing: 0.1em;
        }
        
        .ticket-body {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 2rem;
          padding: 2rem;
        }
        
        .ticket-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .info-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text-muted);
        }
        
        .info-value {
          font-size: 1rem;
          font-weight: 500;
          color: var(--color-text);
        }
        
        .info-value.code {
          font-family: monospace;
          font-size: 1.25rem;
          letter-spacing: 0.15em;
          color: var(--color-primary);
        }
        
        .checked-in-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border-radius: var(--radius);
          font-size: 0.875rem;
        }
        
        .ticket-qr {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .ticket-qr img {
          width: 160px;
          height: 160px;
          border-radius: var(--radius);
        }
        
        .qr-placeholder {
          width: 160px;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-background);
          border-radius: var(--radius);
        }
        
        .qr-help {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin: 0;
        }
        
        .ticket-actions {
          display: flex;
          gap: 1rem;
          padding: 1.5rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .ticket-actions button {
          flex: 1;
        }
        
        @media (max-width: 640px) {
          .ticket-body {
            grid-template-columns: 1fr;
            text-align: center;
          }
          
          .ticket-info-grid {
            grid-template-columns: 1fr;
          }
          
          .ticket-qr {
            order: -1;
          }
          
          .ticket-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </Layout>
  );
}

