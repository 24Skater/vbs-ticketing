import { describe, it, expect } from 'vitest';
import { 
  normalizePhone, 
  validatePhone,
  formatPhone,
  getHubtelChannel 
} from '../phone';

describe('Phone Utilities', () => {
  describe('normalizePhone', () => {
    it('should normalize local format (0241234567)', () => {
      expect(normalizePhone('0241234567')).toBe('233241234567');
    });

    it('should normalize with country code (233241234567)', () => {
      expect(normalizePhone('233241234567')).toBe('233241234567');
    });

    it('should normalize with + prefix (+233241234567)', () => {
      expect(normalizePhone('+233241234567')).toBe('233241234567');
    });

    it('should handle spaces and dashes', () => {
      expect(normalizePhone('024 123 4567')).toBe('233241234567');
      expect(normalizePhone('024-123-4567')).toBe('233241234567');
    });

    it('should return null for invalid numbers', () => {
      expect(normalizePhone('12345')).toBeNull();
      expect(normalizePhone('')).toBeNull();
      expect(normalizePhone('abcdefghij')).toBeNull();
    });
  });

  describe('validatePhone', () => {
    it('should validate correct Ghana phone numbers', () => {
      expect(validatePhone('233241234567').valid).toBe(true);
      expect(validatePhone('233201234567').valid).toBe(true);
      expect(validatePhone('233551234567').valid).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('233001234567').valid).toBe(false); // invalid prefix
      expect(validatePhone('123456789').valid).toBe(false); // too short
    });

    it('should identify carrier correctly', () => {
      expect(validatePhone('233241234567').carrier).toBe('mtn');
      expect(validatePhone('233201234567').carrier).toBe('vodafone');
      expect(validatePhone('233261234567').carrier).toBe('airtelTigo');
    });
  });

  describe('formatPhone', () => {
    it('should format Ghana phone number for display (local)', () => {
      expect(formatPhone('233241234567', 'local')).toBe('0241234567');
    });

    it('should format Ghana phone number for display (spaced)', () => {
      expect(formatPhone('233241234567', 'spaced')).toBe('024 123 4567');
    });

    it('should format Ghana phone number for display (international)', () => {
      expect(formatPhone('233241234567', 'international')).toBe('+233 24 123 4567');
    });
  });

  describe('getHubtelChannel', () => {
    it('should return mtn-gh for MTN numbers', () => {
      expect(getHubtelChannel('233241234567')).toBe('mtn-gh');
      expect(getHubtelChannel('233541234567')).toBe('mtn-gh');
      expect(getHubtelChannel('233551234567')).toBe('mtn-gh');
    });

    it('should return vodafone-gh for Vodafone numbers', () => {
      expect(getHubtelChannel('233201234567')).toBe('vodafone-gh');
      expect(getHubtelChannel('233501234567')).toBe('vodafone-gh');
    });

    it('should return tigo-gh for AirtelTigo numbers', () => {
      expect(getHubtelChannel('233261234567')).toBe('tigo-gh');
      expect(getHubtelChannel('233271234567')).toBe('tigo-gh');
    });

    it('should return null for unknown prefixes', () => {
      expect(getHubtelChannel('233001234567')).toBeNull();
    });
  });
});
