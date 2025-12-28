/**
 * Internationalization (i18n) Configuration
 * Multi-language support using react-i18next
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';

// Supported languages
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
    },
    fallbackLng: 'en',
    supportedLngs: LANGUAGES.map(l => l.code),
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    react: {
      useSuspense: false,
    },
  });

/**
 * Change language
 */
export function changeLanguage(langCode) {
  return i18n.changeLanguage(langCode);
}

/**
 * Get current language
 */
export function getCurrentLanguage() {
  return i18n.language || 'en';
}

/**
 * Get language info
 */
export function getLanguageInfo(code) {
  return LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
}

export default i18n;

