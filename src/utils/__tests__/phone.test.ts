import { describe, it, expect } from 'vitest';
import {
  normalizePhone,
  normalizePhoneForStorage,
  validatePhone,
  formatPhone,
  formatPhoneDisplay,
  maskPhone,
  phonesMatch,
  isValidPhone,
  getHubtelChannel,
  getGhanaCarrier,
} from '../phone';

describe('Phone Utilities', () => {
  describe('validatePhone', () => {
    it('should validate US phone numbers', () => {
      // Use a valid US phone number format
      const result = validatePhone('+1 212 555 1234');
      expect(result.valid).toBe(true);
      expect(result.country).toBe('US');
      expect(result.countryCode).toBe('1');
    });

    it('should validate UK phone numbers', () => {
      const result = validatePhone('+44 20 7946 0958');
      expect(result.valid).toBe(true);
      expect(result.country).toBe('GB');
    });

    it('should validate Ghana phone numbers', () => {
      const result = validatePhone('+233 24 123 4567');
      expect(result.valid).toBe(true);
      expect(result.country).toBe('GH');
    });

    it('should validate German phone numbers', () => {
      const result = validatePhone('+49 30 12345678');
      expect(result.valid).toBe(true);
      expect(result.country).toBe('DE');
    });

    it('should accept local format with default country', () => {
      const result = validatePhone('0241234567', 'GH');
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('233241234567');
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('12345').valid).toBe(false);
      expect(validatePhone('').valid).toBe(false);
    });

    it('should handle long digit strings gracefully', () => {
      // libphonenumber may or may not validate arbitrary digit strings
      const result = validatePhone('9876543210123');
      // Should not throw and should return a consistent result
      expect(typeof result.valid).toBe('boolean');
      expect(result).toHaveProperty('normalized');
    });
  });

  describe('normalizePhone', () => {
    it('should normalize international format', () => {
      // Use a real valid US number
      expect(normalizePhone('+1 212 555 1234')).toBe('12125551234');
    });

    it('should normalize Ghana local format with country hint', () => {
      expect(normalizePhone('0241234567', 'GH')).toBe('233241234567');
    });

    it('should return null for invalid numbers', () => {
      expect(normalizePhone('12345')).toBeNull();
      expect(normalizePhone('')).toBeNull();
    });
  });

  describe('normalizePhoneForStorage', () => {
    it('should normalize valid phone', () => {
      expect(normalizePhoneForStorage('+1 555 123 4567')).toBe('15551234567');
    });

    it('should return cleaned digits for invalid but usable phone', () => {
      expect(normalizePhoneForStorage('123-456-7890')).toBe('1234567890');
    });
  });

  describe('formatPhone', () => {
    it('should format in international format', () => {
      const formatted = formatPhone('15551234567', 'INTERNATIONAL');
      expect(formatted).toContain('+1');
    });

    it('should format in E164 format', () => {
      const formatted = formatPhone('15551234567', 'E164');
      expect(formatted).toBe('+15551234567');
    });

    it('should handle already formatted numbers', () => {
      const formatted = formatPhone('+44 20 7946 0958', 'INTERNATIONAL');
      expect(formatted).toContain('+44');
    });
  });

  describe('formatPhoneDisplay', () => {
    it('should format for display', () => {
      const formatted = formatPhoneDisplay('15551234567');
      expect(formatted).toContain('+1');
    });
  });

  describe('maskPhone', () => {
    it('should mask phone number', () => {
      const masked = maskPhone('15551234567');
      expect(masked).toBe('155******67');
    });

    it('should handle short numbers', () => {
      expect(maskPhone('12345')).toBe('***');
    });

    it('should handle empty input', () => {
      expect(maskPhone('')).toBe('***');
    });
  });

  describe('phonesMatch', () => {
    it('should match same phone in different formats', () => {
      expect(phonesMatch('+1 555 123 4567', '15551234567')).toBe(true);
      expect(phonesMatch('(555) 123-4567', '5551234567', 'US')).toBe(true);
    });

    it('should not match different phones', () => {
      expect(phonesMatch('15551234567', '15559876543')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should return true for valid phone', () => {
      expect(isValidPhone('+1 212 555 1234')).toBe(true);
      expect(isValidPhone('+44 20 7946 0958')).toBe(true);
    });

    it('should return false for invalid phone', () => {
      expect(isValidPhone('123')).toBe(false);
    });
  });

  // Ghana-specific utilities (for Hubtel integration)
  describe('getGhanaCarrier', () => {
    it('should identify MTN numbers', () => {
      expect(getGhanaCarrier('233241234567')).toBe('mtn');
      expect(getGhanaCarrier('233541234567')).toBe('mtn');
      expect(getGhanaCarrier('233551234567')).toBe('mtn');
    });

    it('should identify Vodafone numbers', () => {
      expect(getGhanaCarrier('233201234567')).toBe('vodafone');
      expect(getGhanaCarrier('233501234567')).toBe('vodafone');
    });

    it('should identify AirtelTigo numbers', () => {
      expect(getGhanaCarrier('233261234567')).toBe('airtelTigo');
      expect(getGhanaCarrier('233271234567')).toBe('airtelTigo');
    });

    it('should return null for unknown prefixes', () => {
      expect(getGhanaCarrier('233001234567')).toBeNull();
      expect(getGhanaCarrier('15551234567')).toBeNull();
    });
  });

  describe('getHubtelChannel', () => {
    it('should return mtn-gh for MTN numbers', () => {
      expect(getHubtelChannel('233241234567')).toBe('mtn-gh');
      expect(getHubtelChannel('233541234567')).toBe('mtn-gh');
    });

    it('should return vodafone-gh for Vodafone numbers', () => {
      expect(getHubtelChannel('233201234567')).toBe('vodafone-gh');
    });

    it('should return tigo-gh for AirtelTigo numbers', () => {
      expect(getHubtelChannel('233261234567')).toBe('tigo-gh');
    });

    it('should return null for non-Ghana numbers', () => {
      expect(getHubtelChannel('15551234567')).toBeNull();
    });
  });
});
