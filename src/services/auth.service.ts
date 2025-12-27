import { prisma } from '../utils/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { logger, logSecurity } from '../utils/logger.js';
import type { AuthTokens, UserData, UserRole, ServiceResult } from '../types/index.js';

/**
 * Initialize default admin user if none exists
 */
export async function initializeAdminUser(): Promise<void> {
  try {
    const adminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
    if (adminCount === 0) {
      const passwordHash = await hashPassword('Admin123!');
      await prisma.user.create({
        data: {
          email: 'admin@vbs.local',
          name: 'VBS Admin',
          passwordHash,
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });
      logger.info('Default admin user created: admin@vbs.local / Admin123!');
    } else {
      logger.info('Admin user(s) already exist');
    }
  } catch (error) {
    logger.error('Failed to initialize admin user', { error });
  }
}

/**
 * Register a new user
 */
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'STAFF'
): Promise<ServiceResult<UserData>> {
  try {
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return { success: false, error: 'User already exists', code: 'USER_EXISTS' };
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role: role as any,
        isActive: true,
      },
    });

    logSecurity('User registered', { email, role });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
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
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });

    if (!user) {
      logSecurity('Login failed - user not found', { email });
      return { success: false, error: 'Invalid credentials', code: 'UNAUTHORIZED' };
    }

    if (!user.isActive) {
      logSecurity('Login failed - user inactive', { email });
      return { success: false, error: 'Account is disabled', code: 'ACCOUNT_DISABLED' };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      logSecurity('Login failed - invalid password', { email });
      return { success: false, error: 'Invalid credentials', code: 'UNAUTHORIZED' };
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Store session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.refreshTokenExpiresAt,
      },
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
          role: user.role as UserRole,
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
    
    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return { success: false, error: 'Invalid or expired session', code: 'INVALID_SESSION' };
    }

    const user = session.user;
    if (!user.isActive) {
      return { success: false, error: 'Account is disabled', code: 'ACCOUNT_DISABLED' };
    }

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
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
export async function logout(userId: string, refreshToken?: string): Promise<void> {
  try {
    if (refreshToken) {
      await prisma.session.deleteMany({ where: { refreshToken } });
    } else {
      await prisma.session.deleteMany({ where: { userId } });
    }
    logSecurity('User logged out', { userId });
  } catch (error) {
    logger.error('Logout failed', { userId, error });
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
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
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    return { success: false, error: 'User not found', code: 'USER_NOT_FOUND' };
  }

  // Verify current password
  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Current password is incorrect', code: 'INVALID_PASSWORD' };
  }

  // Hash and save new password
  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

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
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    createdAt: user.createdAt,
  }));
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string): Promise<ServiceResult<void>> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    return { success: false, error: 'User not found', code: 'USER_NOT_FOUND' };
  }

  // Soft delete - just deactivate
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  logSecurity('User deactivated', { userId, email: user.email });
  
  return { success: true, data: undefined };
}
