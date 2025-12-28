/**
 * Formatting Utilities
 * Locale-aware date, time, number, and currency formatting
 */

/**
 * Get the current locale from i18n or config
 */
export function getCurrentLocale() {
  // Try to get from localStorage (set by i18n)
  const i18nLang = localStorage.getItem('i18nextLng') || 'en';
  
  // Map language codes to full locales
  const localeMap = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
  };
  
  return localeMap[i18nLang] || 'en-US';
}

/**
 * Format a date
 * @param {Date|string|number} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export function formatDate(date, options = {}) {
  const locale = getCurrentLocale();
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Format date with time
 */
export function formatDateTime(date, options = {}) {
  const locale = getCurrentLocale();
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Format time only
 */
export function formatTime(date, options = {}) {
  const locale = getCurrentLocale();
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const defaultOptions = {
    hour: 'numeric',
    minute: '2-digit',
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Format a short date (e.g., "Dec 25")
 */
export function formatShortDate(date) {
  return formatDate(date, { month: 'short', day: 'numeric' });
}

/**
 * Format weekday and date (e.g., "Saturday, December 25")
 */
export function formatFullDate(date) {
  return formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Get relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date) {
  const locale = getCurrentLocale();
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffDays / 365);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (Math.abs(diffYears) >= 1) {
    return rtf.format(diffYears, 'year');
  } else if (Math.abs(diffMonths) >= 1) {
    return rtf.format(diffMonths, 'month');
  } else if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffMins) >= 1) {
    return rtf.format(diffMins, 'minute');
  } else {
    return rtf.format(diffSecs, 'second');
  }
}

/**
 * Format a number
 * @param {number} num - Number to format
 * @param {object} options - Intl.NumberFormat options
 * @returns {string} Formatted number
 */
export function formatNumber(num, options = {}) {
  const locale = getCurrentLocale();
  return new Intl.NumberFormat(locale, options).format(num);
}

/**
 * Format currency (amount in cents/smallest unit)
 * @param {number} amount - Amount in smallest currency unit (e.g., cents)
 * @param {string} currency - ISO 4217 currency code
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, currency = 'USD') {
  const locale = getCurrentLocale();
  const majorUnit = amount / 100;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(majorUnit);
}

/**
 * Format compact number (e.g., 1.2K, 3.5M)
 */
export function formatCompactNumber(num) {
  const locale = getCurrentLocale();
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

/**
 * Format percentage
 */
export function formatPercent(value, decimals = 0) {
  const locale = getCurrentLocale();
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Parse a localized number string back to number
 */
export function parseLocalizedNumber(str, locale) {
  const loc = locale || getCurrentLocale();
  const parts = new Intl.NumberFormat(loc).formatToParts(12345.67);
  const decimalSep = parts.find(p => p.type === 'decimal')?.value || '.';
  const groupSep = parts.find(p => p.type === 'group')?.value || ',';
  
  const normalized = str
    .replace(new RegExp(`\\${groupSep}`, 'g'), '')
    .replace(decimalSep, '.');
  
  return parseFloat(normalized);
}

/**
 * Get list of month names
 */
export function getMonthNames(format = 'long') {
  const locale = getCurrentLocale();
  const months = [];
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(2000, i, 1);
    months.push(new Intl.DateTimeFormat(locale, { month: format }).format(date));
  }
  
  return months;
}

/**
 * Get list of weekday names
 */
export function getWeekdayNames(format = 'long') {
  const locale = getCurrentLocale();
  const weekdays = [];
  
  // Start from Sunday (Jan 2, 2000 is a Sunday)
  for (let i = 0; i < 7; i++) {
    const date = new Date(2000, 0, 2 + i);
    weekdays.push(new Intl.DateTimeFormat(locale, { weekday: format }).format(date));
  }
  
  return weekdays;
}

