import { describe, it, expect } from 'vitest';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyAccessToken, 
  verifyRefreshToken,
  generateTokenPair,
  isTokenExpired,
} from '../jwt';

describe('JWT Utilities', () => {
  const testPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'ADMIN',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testPayload.userId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);
      
      expect(decoded).not.toBeNull();
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
      expect(decoded.type).toBe('access');
    });

    it('should throw for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });

    it('should throw for empty token', () => {
      expect(() => verifyAccessToken('')).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(testPayload.userId);
      const decoded = verifyRefreshToken(token);
      
      expect(decoded).not.toBeNull();
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.type).toBe('refresh');
    });

    it('should throw for invalid token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both tokens', () => {
      const pair = generateTokenPair(testPayload);
      
      expect(pair.accessToken).toBeDefined();
      expect(pair.refreshToken).toBeDefined();
      expect(pair.accessTokenExpiresAt).toBeInstanceOf(Date);
      expect(pair.refreshTokenExpiresAt).toBeInstanceOf(Date);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for fresh token', () => {
      const token = generateAccessToken(testPayload);
      
      expect(isTokenExpired(token)).toBe(false);
    });

    it('should return true for invalid token', () => {
      expect(isTokenExpired('invalid')).toBe(true);
    });
  });

  describe('token isolation', () => {
    it('should not verify access token as refresh token', () => {
      const accessToken = generateAccessToken(testPayload);
      
      expect(() => verifyRefreshToken(accessToken)).toThrow('Invalid token type');
    });

    it('should not verify refresh token as access token', () => {
      const refreshToken = generateRefreshToken(testPayload.userId);
      
      expect(() => verifyAccessToken(refreshToken)).toThrow('Invalid token type');
    });
  });
});
