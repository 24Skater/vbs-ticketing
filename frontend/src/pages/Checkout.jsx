/**
 * Checkout Page
 * Complete ticket purchase with payment
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Layout } from '../components/layout';
import { Button, Input, Alert, Spinner } from '../components/ui';
import { useLocalization, useFeatures } from '../hooks/useConfig';
import api from '../lib/api';

export default function Checkout() {
  const navigate = useNavigate();
  const { currency, currencySymbol } = useLocalization();
  const { enablePayments } = useFeatures();
  
  const [checkoutData, setCheckoutData] = useState(null);
  const [step, setStep] = useState('info'); // info, payment, success
  const [error, setError] = useState(null);
  
  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState('manual');
  
  // Load checkout data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('checkout');
    if (stored) {
      try {
        setCheckoutData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse checkout data');
        navigate('/events');
      }
    } else {
      navigate('/events');
    }
  }, [navigate]);
  
  // Create tickets mutation
  const createTicketsMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/tickets/bulk', data);
      return response.data;
    },
    onSuccess: (data) => {
      sessionStorage.removeItem('checkout');
      sessionStorage.setItem('purchase_success', JSON.stringify({
        tickets: data.data,
        customerEmail: customerInfo.email,
      }));
      setStep('success');
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to complete purchase. Please try again.');
    },
  });
  
  const handleInfoSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    if (!customerInfo.name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!customerInfo.email.trim() || !customerInfo.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!customerInfo.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    
    setStep('payment');
  };
  
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Build tickets array
    const tickets = checkoutData.tickets.flatMap(item => 
      Array(item.quantity).fill({
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email,
        ticketTypeId: item.typeId,
        amount: item.price,
        eventId: checkoutData.eventId,
        status: enablePayments && paymentMethod !== 'manual' ? 'PENDING' : 'PAID',
      })
    );
    
    createTicketsMutation.mutate({
      tickets,
      eventId: checkoutData.eventId,
    });
  };
  
  const formatPrice = (amount) => {
    return `${currencySymbol}${(amount / 100).toFixed(2)}`;
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  if (!checkoutData) {
    return (
      <Layout>
        <div className="loading-page">
          <Spinner size="lg" />
          <p>Loading checkout...</p>
        </div>
      </Layout>
    );
  }
  
  // Success Step
  if (step === 'success') {
    return (
      <Layout>
        <div className="success-page">
          <div className="success-content">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1>Purchase Complete!</h1>
            <p>
              Your tickets have been created. A confirmation email has been sent to{' '}
              <strong>{customerInfo.email}</strong>
            </p>
            
            <div className="success-summary">
              <h3>{checkoutData.eventName}</h3>
              <p>{formatDate(checkoutData.eventDate)} at {checkoutData.eventTime}</p>
              <div className="ticket-count">
                {checkoutData.tickets.reduce((sum, t) => sum + t.quantity, 0)} ticket(s) purchased
              </div>
            </div>
            
            <div className="success-actions">
              <Link to="/view" className="btn btn-primary btn-lg">
                View My Tickets
              </Link>
              <Link to="/events" className="btn btn-secondary">
                Browse More Events
              </Link>
            </div>
          </div>
        </div>
        
        <style>{`
          .success-page {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          
          .success-content {
            text-align: center;
            max-width: 500px;
          }
          
          .success-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(34, 197, 94, 0.15);
            color: #22c55e;
            border-radius: 50%;
          }
          
          .success-content h1 {
            margin-bottom: 0.75rem;
          }
          
          .success-content > p {
            color: var(--color-text-muted);
            margin-bottom: 2rem;
          }
          
          .success-summary {
            background: var(--color-surface);
            padding: 1.5rem;
            border-radius: var(--radius-lg);
            margin-bottom: 2rem;
          }
          
          .success-summary h3 {
            margin-bottom: 0.5rem;
          }
          
          .success-summary p {
            color: var(--color-text-muted);
            font-size: 0.9375rem;
            margin-bottom: 1rem;
          }
          
          .ticket-count {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--color-accent);
          }
          
          .success-actions {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
        `}</style>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <section className="checkout-page">
        <div className="container">
          <div className="checkout-grid">
            {/* Left: Form */}
            <div className="checkout-form-section">
              {/* Progress Steps */}
              <div className="checkout-steps">
                <div className={`step ${step === 'info' ? 'active' : step === 'payment' ? 'completed' : ''}`}>
                  <span className="step-number">1</span>
                  <span className="step-label">Your Info</span>
                </div>
                <div className="step-line" />
                <div className={`step ${step === 'payment' ? 'active' : ''}`}>
                  <span className="step-number">2</span>
                  <span className="step-label">Payment</span>
                </div>
              </div>
              
              {error && (
                <Alert variant="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              
              {/* Step 1: Customer Info */}
              {step === 'info' && (
                <form onSubmit={handleInfoSubmit} className="checkout-form">
                  <h2>Your Information</h2>
                  <p className="form-subtitle">
                    Enter your details to receive your tickets
                  </p>
                  
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <Input
                      id="name"
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                      required
                    />
                    <p className="input-help">Tickets will be sent to this email</p>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                  
                  <div className="form-actions">
                    <Link to={`/events/${checkoutData.eventId}`} className="btn btn-ghost">
                      ← Back to Event
                    </Link>
                    <Button type="submit" variant="primary">
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              )}
              
              {/* Step 2: Payment */}
              {step === 'payment' && (
                <form onSubmit={handlePaymentSubmit} className="checkout-form">
                  <h2>Payment</h2>
                  <p className="form-subtitle">
                    Select your payment method
                  </p>
                  
                  {enablePayments ? (
                    <div className="payment-methods">
                      <label className={`payment-option ${paymentMethod === 'manual' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="manual"
                          checked={paymentMethod === 'manual'}
                          onChange={() => setPaymentMethod('manual')}
                        />
                        <div className="option-content">
                          <div className="option-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="4" width="20" height="16" rx="2" />
                              <path d="M6 8h4M6 12h2M6 16h6" />
                            </svg>
                          </div>
                          <div className="option-info">
                            <strong>Pay Later / Cash</strong>
                            <span>Pay at the venue or via bank transfer</span>
                          </div>
                        </div>
                      </label>
                      
                      <label className={`payment-option disabled`}>
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          disabled
                        />
                        <div className="option-content">
                          <div className="option-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="1" y="4" width="22" height="16" rx="2" />
                              <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                          </div>
                          <div className="option-info">
                            <strong>Credit/Debit Card</strong>
                            <span>Coming soon</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="payment-info">
                      <p>
                        <strong>Payment is not required online.</strong><br />
                        Your tickets will be reserved and you can pay at the venue.
                      </p>
                    </div>
                  )}
                  
                  <div className="form-actions">
                    <Button 
                      type="button" 
                      variant="ghost"
                      onClick={() => setStep('info')}
                    >
                      ← Back
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={createTicketsMutation.isPending}
                    >
                      {createTicketsMutation.isPending ? (
                        <><Spinner size="sm" /> Processing...</>
                      ) : (
                        `Complete Purchase`
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
            
            {/* Right: Order Summary */}
            <div className="order-summary-section">
              <div className="summary-card">
                <h3>Order Summary</h3>
                
                <div className="event-info">
                  <h4>{checkoutData.eventName}</h4>
                  <p>{formatDate(checkoutData.eventDate)}</p>
                  <p>{checkoutData.eventTime}</p>
                </div>
                
                <div className="summary-items">
                  {checkoutData.tickets.map((item, index) => (
                    <div key={index} className="summary-item">
                      <div className="item-info">
                        <span className="item-name">{item.typeName}</span>
                        <span className="item-qty">× {item.quantity}</span>
                      </div>
                      <span className="item-price">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="summary-total">
                  <span>Total</span>
                  <span className="total-amount">{formatPrice(checkoutData.total)}</span>
                </div>
                
                <div className="summary-note">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <style>{`
        .loading-page {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        
        .checkout-page {
          padding: 3rem 0;
          min-height: 70vh;
        }
        
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 3rem;
          align-items: start;
        }
        
        .checkout-steps {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-muted);
        }
        
        .step.active {
          color: var(--color-primary);
        }
        
        .step.completed {
          color: var(--color-success);
        }
        
        .step-number {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-surface);
          border-radius: 50%;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .step.active .step-number {
          background: var(--color-primary);
          color: white;
        }
        
        .step.completed .step-number {
          background: var(--color-success);
          color: white;
        }
        
        .step-line {
          flex: 1;
          height: 2px;
          background: var(--color-surface);
          margin: 0 1rem;
          max-width: 100px;
        }
        
        .checkout-form h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .form-subtitle {
          color: var(--color-text-muted);
          margin-bottom: 2rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .input-help {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
          margin-top: 0.375rem;
        }
        
        .form-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .payment-option {
          display: block;
          cursor: pointer;
        }
        
        .payment-option input {
          display: none;
        }
        
        .option-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--color-surface);
          border: 2px solid transparent;
          border-radius: var(--radius);
          transition: all var(--transition-fast);
        }
        
        .payment-option:hover .option-content {
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .payment-option.selected .option-content {
          border-color: var(--color-primary);
          background: rgba(59, 130, 246, 0.05);
        }
        
        .payment-option.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .option-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-background);
          border-radius: var(--radius);
          color: var(--color-text-muted);
        }
        
        .option-info {
          display: flex;
          flex-direction: column;
        }
        
        .option-info strong {
          color: var(--color-text);
          margin-bottom: 0.25rem;
        }
        
        .option-info span {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
        }
        
        .payment-info {
          padding: 1.5rem;
          background: var(--color-surface);
          border-radius: var(--radius);
          text-align: center;
        }
        
        .payment-info p {
          margin: 0;
        }
        
        /* Order Summary */
        .order-summary-section {
          position: sticky;
          top: calc(var(--header-height) + 2rem);
        }
        
        .summary-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .summary-card h3 {
          font-size: 1.125rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .event-info {
          margin-bottom: 1.5rem;
        }
        
        .event-info h4 {
          margin-bottom: 0.5rem;
        }
        
        .event-info p {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin: 0.25rem 0;
        }
        
        .summary-items {
          margin-bottom: 1rem;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .item-info {
          display: flex;
          gap: 0.5rem;
        }
        
        .item-name {
          color: var(--color-text);
        }
        
        .item-qty {
          color: var(--color-text-muted);
        }
        
        .item-price {
          font-weight: 500;
        }
        
        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
        }
        
        .total-amount {
          color: var(--color-accent);
          font-size: 1.5rem;
        }
        
        .summary-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }
        
        @media (max-width: 1024px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }
          
          .order-summary-section {
            position: static;
            order: -1;
          }
        }
      `}</style>
    </Layout>
  );
}

