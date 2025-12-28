/**
 * Language Switcher Component
 * Dropdown to change the application language
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, changeLanguage, getCurrentLanguage, getLanguageInfo } from '../lib/i18n';

export default function LanguageSwitcher({ variant = 'dropdown' }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const currentLang = getLanguageInfo(getCurrentLanguage());
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };
  
  // Simple inline buttons variant
  if (variant === 'inline') {
    return (
      <div className="lang-switcher-inline">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
            aria-label={`Switch to ${lang.name}`}
            title={lang.nativeName}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
        
        <style>{`
          .lang-switcher-inline {
            display: flex;
            gap: 0.25rem;
            padding: 0.25rem;
            background: var(--color-surface);
            border-radius: var(--radius);
          }
          
          .lang-btn {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 600;
            background: transparent;
            border: none;
            color: var(--color-text-muted);
            border-radius: calc(var(--radius) - 2px);
            cursor: pointer;
            transition: all var(--transition-fast);
          }
          
          .lang-btn:hover {
            color: var(--color-text);
            background: rgba(255, 255, 255, 0.05);
          }
          
          .lang-btn.active {
            background: var(--color-primary);
            color: white;
          }
        `}</style>
      </div>
    );
  }
  
  // Dropdown variant (default)
  return (
    <div className="lang-switcher" ref={dropdownRef}>
      <button
        className="lang-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="lang-flag">{currentLang.flag}</span>
        <span className="lang-code">{currentLang.code.toUpperCase()}</span>
        <svg 
          className={`lang-arrow ${isOpen ? 'open' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="lang-dropdown" role="listbox">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
              role="option"
              aria-selected={i18n.language === lang.code}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-name">{lang.nativeName}</span>
              {i18n.language === lang.code && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
      
      <style>{`
        .lang-switcher {
          position: relative;
        }
        
        .lang-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--color-surface);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius);
          color: var(--color-text);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .lang-trigger:hover {
          border-color: var(--color-primary);
        }
        
        .lang-flag {
          font-size: 1.125rem;
        }
        
        .lang-code {
          font-weight: 500;
        }
        
        .lang-arrow {
          transition: transform var(--transition-fast);
        }
        
        .lang-arrow.open {
          transform: rotate(180deg);
        }
        
        .lang-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          min-width: 160px;
          background: var(--color-surface);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          overflow: hidden;
          animation: fadeIn 0.15s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .lang-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          color: var(--color-text);
          font-size: 0.875rem;
          text-align: left;
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        
        .lang-option:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .lang-option.active {
          background: rgba(59, 130, 246, 0.1);
          color: var(--color-primary);
        }
        
        .lang-name {
          flex: 1;
        }
        
        .lang-option svg {
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}

