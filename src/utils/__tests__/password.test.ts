import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../password';

describe('Password Utilities', () => {
  const testPassword = 'MySecurePassword123!';

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const hash = await hashPassword(testPassword);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(testPassword);
      expect(hash.startsWith('$2')).toBe(true); // bcrypt hash prefix
    });

    it('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for matching password', async () => {
      const hash = await hashPassword(testPassword);
      const isMatch = await verifyPassword(testPassword, hash);
      
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hash = await hashPassword(testPassword);
      const isMatch = await verifyPassword('WrongPassword', hash);
      
      expect(isMatch).toBe(false);
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword(testPassword);
      const isMatch = await verifyPassword('', hash);
      
      expect(isMatch).toBe(false);
    });
  });
});
