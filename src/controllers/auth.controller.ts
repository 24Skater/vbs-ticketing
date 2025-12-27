import { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { asyncHandler, Errors } from '../middleware/errorHandler.middleware.js';
import type { LoginInput, RegisterInput, ChangePasswordInput } from '../validators/auth.validator.js';

/**
 * User login
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;
  
  const result = await authService.login(email, password);

  if (!result.success) {
    throw Errors.unauthorized(result.error);
  }

  res.json({
    success: true,
    data: result.data,
    message: 'Login successful',
  });
});

/**
 * Register new user (admin only)
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body as RegisterInput;
  
  const result = await authService.registerUser(email, password, name, role);

  if (!result.success) {
    if (result.code === 'USER_EXISTS') {
      throw Errors.conflict('User with this email already exists');
    }
    throw Errors.badRequest(result.error);
  }

  res.status(201).json({
    success: true,
    data: result.data,
    message: 'User registered successfully',
  });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw Errors.badRequest('Refresh token is required');
  }

  const result = await authService.refreshAccessToken(refreshToken);

  if (!result.success) {
    throw Errors.unauthorized(result.error);
  }

  res.json({
    success: true,
    data: result.data,
  });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  if (userId) {
    await authService.logout(userId);
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  if (!userId) {
    throw Errors.unauthorized();
  }

  const user = await authService.getUserById(userId);

  if (!user) {
    throw Errors.notFound('User');
  }

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Change password
 * POST /api/auth/change-password
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { currentPassword, newPassword } = req.body as ChangePasswordInput;
  
  if (!userId) {
    throw Errors.unauthorized();
  }

  const result = await authService.changePassword(userId, currentPassword, newPassword);

  if (!result.success) {
    if (result.code === 'INVALID_PASSWORD') {
      throw Errors.badRequest('Current password is incorrect');
    }
    throw Errors.badRequest(result.error);
  }

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * Validate admin key (legacy endpoint)
 * POST /api/auth/validate-key
 */
export const validateAdminKey = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.body;
  
  if (!key) {
    throw Errors.badRequest('Admin key is required');
  }

  const isValid = authService.validateAdminKey(key);

  if (!isValid) {
    throw Errors.unauthorized('Invalid admin key');
  }

  res.json({
    success: true,
    message: 'Admin key is valid',
  });
});

/**
 * Get all users (super admin only)
 * GET /api/auth/users
 */
export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await authService.getAllUsers();

  res.json({
    success: true,
    data: users,
    count: users.length,
  });
});

/**
 * Delete user (super admin only)
 * DELETE /api/auth/users/:userId
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const result = await authService.deleteUser(userId);

  if (!result.success) {
    if (result.code === 'FORBIDDEN') {
      throw Errors.forbidden(result.error);
    }
    throw Errors.notFound('User');
  }

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

/**
 * Request password reset
 * POST /api/auth/forgot-password
 * Note: Email-based password reset not yet implemented
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    throw Errors.badRequest('Email is required');
  }

  // TODO: Implement email-based password reset when email service is configured
  // For now, just log the request
  console.log('Password reset requested for:', email);

  // Always return success to prevent email enumeration
  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent',
  });
});
