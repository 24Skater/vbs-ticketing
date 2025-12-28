/**
 * Site Header Component
 * Navigation bar with logo, menu, and actions
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeProvider';
import LanguageSwitcher from '../LanguageSwitcher';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const config = useTheme();
  const { t } = useTranslation();
  
  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/events', label: t('nav.events') },
    { href: '/view', label: t('nav.myTickets') },
  ];
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <header className="site-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          {config?.logoUrl ? (
            <img 
              src={config.logoUrl} 
              alt={config?.orgName || 'Home'} 
              className="logo-image"
            />
          ) : (
            <span className="logo-text">{config?.orgName || 'VBS Tickets'}</span>
          )}
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* Actions */}
        <div className="header-actions">
          <LanguageSwitcher />
          <Link to="/events" className="btn btn-primary btn-sm">
            {t('events.getTickets')}
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="mobile-nav">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={`mobile-nav-link ${isActive(link.href) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mobile-lang-switcher">
            <LanguageSwitcher variant="inline" />
          </div>
        </nav>
      )}
      
      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .header-container {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: 0 var(--container-padding);
          height: var(--header-height);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }
        
        .header-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          flex-shrink: 0;
        }
        
        .logo-image {
          height: 40px;
          width: auto;
          object-fit: contain;
        }
        
        .logo-text {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .header-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .nav-link {
          padding: 0.5rem 1rem;
          font-weight: 500;
          color: var(--color-text-muted);
          border-radius: var(--radius);
          transition: all var(--transition-fast);
        }
        
        .nav-link:hover {
          color: var(--color-text);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .nav-link.active {
          color: var(--color-primary);
          background: rgba(59, 130, 246, 0.1);
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .mobile-menu-btn {
          display: none;
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: var(--color-text);
          cursor: pointer;
        }
        
        .mobile-nav {
          display: none;
          padding: 1rem var(--container-padding);
          background: var(--color-surface);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .mobile-nav-link {
          display: block;
          padding: 0.75rem 1rem;
          color: var(--color-text-muted);
          font-weight: 500;
          border-radius: var(--radius);
          transition: all var(--transition-fast);
        }
        
        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          color: var(--color-text);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .mobile-lang-switcher {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }
          
          .mobile-menu-btn {
            display: flex;
          }
          
          .mobile-nav {
            display: block;
          }
          
          .header-actions .btn {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}

