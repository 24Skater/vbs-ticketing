/**
 * Configuration Hook
 * Fetches and provides site configuration with theming
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '../lib/api';

/**
 * Fetch site configuration
 */
async function fetchConfig() {
  const response = await api.get('/config');
  return response.data.data;
}

/**
 * Apply theme CSS variables to document
 */
function applyTheme(config) {
  if (!config) return;
  
  const root = document.documentElement;
  
  // Colors
  root.style.setProperty('--color-primary', config.primaryColor);
  root.style.setProperty('--color-secondary', config.secondaryColor);
  root.style.setProperty('--color-accent', config.accentColor);
  root.style.setProperty('--color-background', config.backgroundColor);
  root.style.setProperty('--color-surface', config.surfaceColor);
  root.style.setProperty('--color-text', config.textColor);
  root.style.setProperty('--color-text-muted', config.textMutedColor);
  
  // Typography
  root.style.setProperty('--font-heading', `"${config.headingFont}", system-ui, sans-serif`);
  root.style.setProperty('--font-body', `"${config.bodyFont}", system-ui, sans-serif`);
  
  // Border radius
  const radiusMap = {
    'none': '0px',
    'sm': '0.25rem',
    'md': '0.5rem',
    'lg': '1rem',
    'full': '9999px',
  };
  root.style.setProperty('--radius', radiusMap[config.borderRadius] || '0.5rem');
  
  // Load Google Fonts if needed
  loadGoogleFonts([config.headingFont, config.bodyFont]);
  
  // Update favicon
  if (config.faviconUrl) {
    updateFavicon(config.faviconUrl);
  }
  
  // Update page title
  if (config.metaTitle) {
    document.title = config.metaTitle;
  } else if (config.orgName) {
    document.title = `${config.orgName} - Tickets`;
  }
  
  // Apply custom CSS
  if (config.customCss) {
    applyCustomCss(config.customCss);
  }
}

/**
 * Load Google Fonts dynamically
 */
function loadGoogleFonts(fonts) {
  const uniqueFonts = [...new Set(fonts)].filter(Boolean);
  
  uniqueFonts.forEach(font => {
    const fontId = `google-font-${font.replace(/\s+/g, '-').toLowerCase()}`;
    
    // Skip if already loaded
    if (document.getElementById(fontId)) return;
    
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  });
}

/**
 * Update favicon
 */
function updateFavicon(url) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}

/**
 * Apply custom CSS
 */
function applyCustomCss(css) {
  const styleId = 'custom-theme-css';
  let style = document.getElementById(styleId);
  
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }
  
  style.textContent = css;
}

/**
 * Hook to get and apply site configuration
 */
export function useConfig() {
  const query = useQuery({
    queryKey: ['siteConfig'],
    queryFn: fetchConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Apply theme when config loads/changes
  useEffect(() => {
    if (query.data) {
      applyTheme(query.data);
    }
  }, [query.data]);
  
  return {
    config: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to get organization info
 */
export function useOrganization() {
  const { config, isLoading, error } = useConfig();
  
  return {
    name: config?.orgName || 'My Organization',
    slug: config?.orgSlug,
    description: config?.orgDescription,
    website: config?.orgWebsite,
    email: config?.orgEmail,
    phone: config?.orgPhone,
    logoUrl: config?.logoUrl,
    logoDarkUrl: config?.logoDarkUrl,
    isLoading,
    error,
  };
}

/**
 * Hook to get localization settings
 */
export function useLocalization() {
  const { config, isLoading } = useConfig();
  
  return {
    currency: config?.currency || 'USD',
    currencySymbol: config?.currencySymbol || '$',
    locale: config?.locale || 'en-US',
    language: config?.language || 'en',
    timezone: config?.timezone || 'UTC',
    dateFormat: config?.dateFormat || 'MM/DD/YYYY',
    timeFormat: config?.timeFormat || '12h',
    isLoading,
  };
}

/**
 * Hook to get feature flags
 */
export function useFeatures() {
  const { config, isLoading } = useConfig();
  
  return {
    enablePayments: config?.enablePayments ?? true,
    enableQrCodes: config?.enableQrCodes ?? true,
    enablePdfTickets: config?.enablePdfTickets ?? true,
    enablePublicEventList: config?.enablePublicEventList ?? true,
    enableTicketLookup: config?.enableTicketLookup ?? true,
    maintenanceMode: config?.maintenanceMode ?? false,
    isLoading,
  };
}

export default useConfig;

