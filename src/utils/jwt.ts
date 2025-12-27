import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Token payload structure for access tokens
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

/**
 * Decoded token with standard JWT claims
 */
export interface DecodedToken extends TokenPayload, JwtPayload {
  iat: number;
  exp: number;
}

/**
 * Token generation result
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

/**
 * Parse duration string to milliseconds
 * Supports: 1d, 7d, 1h, 30m, etc.
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // Default: 7 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 's': return value * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

/**
 * Generate an access token
 * @param payload - User data to encode in the token
 * @returns Signed JWT access token
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'type'>): string {
  // Cast expiresIn to expected type - env validation ensures it's a valid duration string
  const expiresIn = env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'];
  
  return jwt.sign(
    { ...payload, type: 'access' },
    env.JWT_SECRET,
    {
      expiresIn,
      issuer: 'vbs-ticketing',
      subject: payload.userId,
    }
  );
}

/**
 * Generate a refresh token
 * @param userId - User ID to encode
 * @returns Signed JWT refresh token
 */
export function generateRefreshToken(userId: string): string {
  // Cast expiresIn to expected type - env validation ensures it's a valid duration string
  const expiresIn = env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'];
  
  return jwt.sign(
    { userId, type: 'refresh' },
    env.JWT_SECRET,
    {
      expiresIn,
      issuer: 'vbs-ticketing',
      subject: userId,
    }
  );
}

/**
 * Generate both access and refresh tokens
 * @param payload - User data for access token
 * @returns Token pair with expiration dates
 */
export function generateTokenPair(payload: Omit<TokenPayload, 'type'>): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload.userId);

  const accessExpiresMs = parseDuration(env.JWT_EXPIRES_IN);
  const refreshExpiresMs = parseDuration(env.JWT_REFRESH_EXPIRES_IN);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: new Date(Date.now() + accessExpiresMs),
    refreshTokenExpiresAt: new Date(Date.now() + refreshExpiresMs),
  };
}

/**
 * Verify and decode an access token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyAccessToken(token: string): DecodedToken {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer: 'vbs-ticketing',
  }) as DecodedToken;

  if (decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }

  return decoded;
}

/**
 * Verify and decode a refresh token
 * @param token - JWT refresh token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyRefreshToken(token: string): DecodedToken {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer: 'vbs-ticketing',
  }) as DecodedToken;

  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  return decoded;
}

/**
 * Decode a token without verifying (for debugging/logging)
 * @param token - JWT token to decode
 * @returns Decoded payload or null if invalid format
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwt.decode(token) as DecodedToken;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired
 * @param token - JWT token to check
 * @returns true if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

/**
 * Get time until token expires
 * @param token - JWT token to check
 * @returns Milliseconds until expiration (negative if expired)
 */
export function getTokenTimeRemaining(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return -1;
  return decoded.exp * 1000 - Date.now();
}

