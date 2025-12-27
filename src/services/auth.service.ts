import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { generateSecureToken, generateSessionId } from '../utils/generators.js';
import { logger, logSecurity } from '../utils/logger.js';
import type { AuthTokens, UserData, UserRole, ServiceResult } from '../types/index.js';

/**
 * Note: This service uses the existing "Payment" model for admin users
 * In Phase 3, we'll create proper User and Session models
 * For now, we use environment-based admin authentication
 */

// In-memory session store (will be replaced with Prisma in Phase 3)
const sessions = new Map<string, { userId: string; refreshToken: string; expiresAt: Date }>();

// In-memory admin users (will be replaced with database in Phase 3)
const adminUsers = new Map<string, {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}>();

/**
 * Initialize default admin user from environment
 */
export function initializeAdminUser(): void {
  const adminKey = process.env.ADMIN_KEY;
  if (adminKey) {
    // Create a default admin based on ADMIN_KEY
    const defaultAdmin = {
      id: 'admin-default',
      email: 'admin@vbs.local',
      name: 'VBS Admin',
      passwordHash: '', // Will be set on first use
      role: 'SUPER_ADMIN' as UserRole,
      createdAt: new Date(),
    };
    adminUsers.set(defaultAdmin.email, defaultAdmin);
    logger.info('Default admin user initialized');
  }
}

/**
 * Register a new admin user
 */
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'STAFF'
): Promise<ServiceResult<UserData>> {
  try {
    // Check if user exists
    if (adminUsers.has(email.toLowerCase())) {
      return { success: false, error: 'User already exists', code: 'USER_EXISTS' };
    }

    const passwordHash = await hashPassword(password);
    const user = {
      id: generateSessionId(),
      email: email.toLowerCase(),
      name,
      passwordHash,
      role,
      createdAt: new Date(),
    };

    adminUsers.set(user.email, user);
    logSecurity('User registered', { email, role });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  } catch (error) {
    logger.error('Registration failed', { email, error });
    return { success: false, error: 'Registration failed', code: 'REGISTER_FAILED' };
  }
}

/**
 * Authenticate user with email and password
 */
export async function login(
  email: string,
  password: string
): Promise<ServiceResult<AuthTokens>> {
  try {
    const user = adminUsers.get(email.toLowerCase());

    if (!user) {
      logSecurity('Login failed - user not found', { email });
      return { success: false, error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
    }

    // For default admin, check against ADMIN_KEY
    if (user.id === 'admin-default') {
      const adminKey = process.env.ADMIN_KEY;
      if (password !== adminKey) {
        logSecurity('Login failed - invalid admin key', { email });
        return { success: false, error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
      }
    } else {
      // Normal password verification
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        logSecurity('Login failed - invalid password', { email });
        return { success: false, error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
      }
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store session
    const sessionId = generateSessionId();
    sessions.set(sessionId, {
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.refreshTokenExpiresAt,
    });

    logSecurity('Login successful', { email, userId: user.id });

    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    };
  } catch (error) {
    logger.error('Login error', { email, error });
    return { success: false, error: 'Login failed', code: 'LOGIN_FAILED' };
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<ServiceResult<{ accessToken: string; expiresIn: number }>> {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = Array.from(adminUsers.values()).find(u => u.id === decoded.userId);

    if (!user) {
      return { success: false, error: 'User not found', code: 'USER_NOT_FOUND' };
    }

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        expiresIn: 7 * 24 * 60 * 60,
      },
    };
  } catch (error) {
    logger.warn('Refresh token failed', { error });
    return { success: false, error: 'Invalid refresh token', code: 'INVALID_TOKEN' };
  }
}

/**
 * Logout - invalidate session
 */
export async function logout(userId: string): Promise<void> {
  // Remove all sessions for this user
  for (const [sessionId, session] of sessions.entries()) {
    if (session.userId === userId) {
      sessions.delete(sessionId);
    }
  }
  logSecurity('User logged out', { userId });
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserData | null> {
  const user = Array.from(adminUsers.values()).find(u => u.id === userId);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

/**
 * Update user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<ServiceResult<void>> {
  const user = Array.from(adminUsers.values()).find(u => u.id === userId);
  
  if (!user) {
    return { success: false, error: 'User not found', code: 'USER_NOT_FOUND' };
  }

  // Verify current password
  if (user.id !== 'admin-default') {
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect', code: 'INVALID_PASSWORD' };
    }
  }

  // Hash and save new password
  const newHash = await hashPassword(newPassword);
  user.passwordHash = newHash;
  adminUsers.set(user.email, user);

  logSecurity('Password changed', { userId });
  return { success: true, data: undefined };
}

/**
 * Validate admin key (for legacy compatibility)
 */
export function validateAdminKey(key: string): boolean {
  const adminKey = process.env.ADMIN_KEY;
  return !!adminKey && key === adminKey;
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<UserData[]> {
  return Array.from(adminUsers.values()).map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  }));
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string): Promise<ServiceResult<void>> {
  const user = Array.from(adminUsers.values()).find(u => u.id === userId);
  
  if (!user) {
    return { success: false, error: 'User not found', code: 'USER_NOT_FOUND' };
  }

  if (user.id === 'admin-default') {
    return { success: false, error: 'Cannot delete default admin', code: 'FORBIDDEN' };
  }

  adminUsers.delete(user.email);
  logSecurity('User deleted', { userId, deletedEmail: user.email });
  
  return { success: true, data: undefined };
}

/**
 * Generate password reset token
 */
export async function generatePasswordResetToken(
  email: string
): Promise<ServiceResult<string>> {
  const user = adminUsers.get(email.toLowerCase());
  
  if (!user) {
    // Don't reveal if user exists
    return { success: true, data: '' };
  }

  const token = generateSecureToken();
  // In Phase 3, store this in database with expiry
  
  logSecurity('Password reset requested', { email });
  return { success: true, data: token };
}
