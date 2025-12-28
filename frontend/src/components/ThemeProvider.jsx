/**
 * Theme Provider Component
 * Loads site config and applies theme to the app
 */

import { createContext, useContext } from 'react';
import { useConfig } from '../hooks/useConfig';
import { Spinner } from './ui';

// Context for theme/config
const ThemeContext = createContext(null);

/**
 * Theme Provider wrapper
 */
export function ThemeProvider({ children }) {
  const { config, isLoading, error } = useConfig();
  
  // Show loading while fetching config
  if (isLoading) {
    return (
      <div className="theme-loading">
        <Spinner size="lg" />
        <p>Loading...</p>
        <style>{`
          .theme-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            background: #0f172a;
            color: #94a3b8;
          }
        `}</style>
      </div>
    );
  }
  
  // Show maintenance mode if enabled
  if (config?.maintenanceMode) {
    return (
      <div className="maintenance-mode">
        <div className="maintenance-content">
          {config.logoUrl && (
            <img src={config.logoUrl} alt={config.orgName} className="maintenance-logo" />
          )}
          <h1>Under Maintenance</h1>
          <p>We're making some improvements. Please check back soon.</p>
          {config.orgEmail && (
            <a href={`mailto:${config.orgEmail}`}>Contact Support</a>
          )}
        </div>
        <style>{`
          .maintenance-mode {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-background, #0f172a);
            color: var(--color-text, #f8fafc);
            padding: 24px;
          }
          .maintenance-content {
            text-align: center;
            max-width: 500px;
          }
          .maintenance-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 24px;
          }
          .maintenance-mode h1 {
            font-size: 32px;
            margin: 0 0 12px 0;
          }
          .maintenance-mode p {
            color: var(--color-text-muted, #94a3b8);
            margin: 0 0 24px 0;
          }
          .maintenance-mode a {
            color: var(--color-primary, #3b82f6);
            text-decoration: none;
          }
          .maintenance-mode a:hover {
            text-decoration: underline;
          }
        `}</style>
      </div>
    );
  }
  
  return (
    <ThemeContext.Provider value={config}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Logo component that respects theme
 */
export function Logo({ className = '', size = 'md' }) {
  const config = useTheme();
  
  const sizeStyles = {
    sm: { height: '24px' },
    md: { height: '40px' },
    lg: { height: '60px' },
  };
  
  if (!config?.logoUrl) {
    return (
      <span className={`logo-text ${className}`} style={sizeStyles[size]}>
        {config?.orgName || 'VBS Tickets'}
      </span>
    );
  }
  
  return (
    <img 
      src={config.logoUrl} 
      alt={config.orgName || 'Logo'} 
      className={`logo-image ${className}`}
      style={sizeStyles[size]}
    />
  );
}

/**
 * Hero section with configurable background
 */
export function Hero({ children, overlay = true }) {
  const config = useTheme();
  
  const heroStyle = {
    backgroundImage: config?.heroImageUrl 
      ? `url(${config.heroImageUrl})`
      : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
  
  return (
    <div className="hero-section" style={heroStyle}>
      {overlay && <div className="hero-overlay" />}
      <div className="hero-content">
        {children || (
          <>
            <h1>{config?.homePageTitle || 'Welcome'}</h1>
            {config?.homePageSubtitle && (
              <p>{config.homePageSubtitle}</p>
            )}
          </>
        )}
      </div>
      <style>{`
        .hero-section {
          position: relative;
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px 24px;
          background-color: var(--color-surface);
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.5),
            rgba(0, 0, 0, 0.7)
          );
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
        }
        .hero-content h1 {
          font-family: var(--font-heading);
          font-size: clamp(28px, 5vw, 48px);
          margin: 0 0 12px 0;
          color: var(--color-text);
        }
        .hero-content p {
          font-size: 18px;
          color: var(--color-text-muted);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

/**
 * Footer with configurable content
 */
export function Footer() {
  const config = useTheme();
  
  return (
    <footer className="site-footer">
      <div className="footer-content">
        {config?.orgEmail && (
          <a href={`mailto:${config.orgEmail}`} className="footer-link">
            {config.orgEmail}
          </a>
        )}
        <span className="footer-text">
          {config?.footerText || 'Powered by VBS Ticketing'}
        </span>
        {config?.orgWebsite && (
          <a 
            href={config.orgWebsite} 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            {config.orgWebsite.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>
      <style>{`
        .site-footer {
          background: var(--color-surface);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px;
          text-align: center;
        }
        .footer-content {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 16px;
        }
        .footer-text {
          color: var(--color-text-muted);
          font-size: 14px;
        }
        .footer-link {
          color: var(--color-text-muted);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: var(--color-primary);
        }
      `}</style>
    </footer>
  );
}

export default ThemeProvider;

