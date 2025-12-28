/**
 * Site Footer Component
 * Bottom section with links, contact info, and copyright
 */

import { Link } from 'react-router-dom';
import { useTheme } from '../ThemeProvider';

export default function Footer() {
  const config = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            {config?.logoUrl ? (
              <img 
                src={config.logoDarkUrl || config.logoUrl} 
                alt={config?.orgName || 'Logo'} 
                className="footer-logo"
              />
            ) : (
              <span className="footer-logo-text">
                {config?.orgName || 'VBS Tickets'}
              </span>
            )}
            {config?.orgDescription && (
              <p className="footer-description">{config.orgDescription}</p>
            )}
          </div>
          
          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <nav className="footer-nav">
              <Link to="/">Home</Link>
              <Link to="/events">Events</Link>
              <Link to="/view">Find My Ticket</Link>
            </nav>
          </div>
          
          {/* Contact */}
          <div className="footer-section">
            <h4>Contact</h4>
            <div className="footer-contact">
              {config?.orgEmail && (
                <a href={`mailto:${config.orgEmail}`} className="contact-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {config.orgEmail}
                </a>
              )}
              {config?.orgPhone && (
                <a href={`tel:${config.orgPhone}`} className="contact-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {config.orgPhone}
                </a>
              )}
              {config?.orgWebsite && (
                <a href={config.orgWebsite} target="_blank" rel="noopener noreferrer" className="contact-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} {config?.orgName || 'VBS Tickets'}. All rights reserved.
          </p>
          <p className="footer-powered">
            {config?.footerText || 'Powered by VBS Ticketing'}
          </p>
        </div>
      </div>
      
      <style>{`
        .site-footer {
          background: var(--color-surface);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: auto;
        }
        
        .footer-container {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: 3rem var(--container-padding) 1.5rem;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }
        
        .footer-brand {
          max-width: 300px;
        }
        
        .footer-logo {
          height: 40px;
          width: auto;
          margin-bottom: 1rem;
        }
        
        .footer-logo-text {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          display: block;
          margin-bottom: 1rem;
        }
        
        .footer-description {
          font-size: 0.9375rem;
          color: var(--color-text-muted);
          margin: 0;
        }
        
        .footer-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text);
          margin-bottom: 1rem;
        }
        
        .footer-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .footer-nav a {
          color: var(--color-text-muted);
          font-size: 0.9375rem;
          transition: color var(--transition-fast);
        }
        
        .footer-nav a:hover {
          color: var(--color-primary);
        }
        
        .footer-contact {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .contact-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-muted);
          font-size: 0.9375rem;
          transition: color var(--transition-fast);
        }
        
        .contact-link:hover {
          color: var(--color-primary);
        }
        
        .contact-link svg {
          flex-shrink: 0;
          opacity: 0.7;
        }
        
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .footer-copyright,
        .footer-powered {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .footer-brand {
            max-width: none;
          }
          
          .footer-bottom {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}

