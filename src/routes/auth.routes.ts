import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimit.middleware.js';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  refreshTokenSchema,
} from '../validators/auth.validator.js';
import { z } from 'zod';

const router = Router();

/**
 * Public Routes (rate limited)
 */

// Login
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

// Refresh token
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken
);

// Validate admin key (legacy support)
router.post(
  '/validate-key',
  authLimiter,
  validate(z.object({ key: z.string().min(1) })),
  authController.validateAdminKey
);

// Forgot password
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(z.object({ email: z.string().email() })),
  authController.forgotPassword
);

/**
 * Authenticated Routes
 */

// Logout
router.post(
  '/logout',
  requireAuth,
  authController.logout
);

// Get current user profile
router.get(
  '/me',
  requireAuth,
  authController.getCurrentUser
);

// Change password
router.post(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  authController.changePassword
);

/**
 * Admin Routes
 */

// Register new user (admin only)
router.post(
  '/register',
  requireAuth,
  requireRole('SUPER_ADMIN'),
  validate(registerSchema),
  authController.register
);

// Get all users (super admin only)
router.get(
  '/users',
  requireAuth,
  requireRole('SUPER_ADMIN'),
  authController.getAllUsers
);

// Delete user (super admin only)
router.delete(
  '/users/:userId',
  requireAuth,
  requireRole('SUPER_ADMIN'),
  authController.deleteUser
);

export default router;
