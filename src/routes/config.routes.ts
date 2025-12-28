/**
 * Configuration Routes
 * Public and admin routes for site configuration
 */

import { Router, Request, Response } from 'express';
import * as configController from '../controllers/config.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

const router = Router();

// Helper to wrap controllers for type compatibility
const wrap = (fn: (req: Request, res: Response) => Promise<void>) => {
  return asyncHandler(async (req: Request, res: Response) => fn(req, res));
};

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * GET /api/config
 * Get public site configuration
 */
router.get('/', wrap(configController.getPublicConfig));

/**
 * GET /api/config/theme.css
 * Get theme CSS variables
 */
router.get('/theme.css', wrap(configController.getThemeCss));

/**
 * GET /api/config/payment-providers
 * Get enabled payment providers (public info)
 */
router.get('/payment-providers', wrap(configController.getPublicPaymentProviders));

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * GET /api/admin/config
 * Get full configuration (admin only)
 */
router.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  wrap(configController.getFullConfig)
);

/**
 * PATCH /api/admin/config
 * Update site configuration (admin only)
 */
router.patch(
  '/admin',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  wrap(configController.updateConfig)
);

/**
 * POST /api/admin/config/clear-cache
 * Clear config cache
 */
router.post(
  '/admin/clear-cache',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  wrap(configController.clearCache)
);

// ============================================================================
// PAYMENT PROVIDER ADMIN ROUTES
// ============================================================================

/**
 * GET /api/admin/payment-providers
 * List all payment providers
 */
router.get(
  '/admin/payment-providers',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  wrap(configController.getAllPaymentProviders)
);

/**
 * GET /api/admin/payment-providers/:provider
 * Get specific provider config
 */
router.get(
  '/admin/payment-providers/:provider',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  wrap(configController.getPaymentProvider)
);

/**
 * PUT /api/admin/payment-providers/:provider
 * Create or update provider config
 */
router.put(
  '/admin/payment-providers/:provider',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  wrap(configController.upsertPaymentProvider)
);

/**
 * DELETE /api/admin/payment-providers/:provider
 * Delete provider config
 */
router.delete(
  '/admin/payment-providers/:provider',
  requireAuth,
  requireRole('SUPER_ADMIN'),
  wrap(configController.deletePaymentProvider)
);

/**
 * POST /api/admin/payment-providers/:provider/toggle
 * Enable/disable provider
 */
router.post(
  '/admin/payment-providers/:provider/toggle',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  wrap(configController.togglePaymentProvider)
);

/**
 * POST /api/admin/payment-providers/:provider/set-default
 * Set provider as default
 */
router.post(
  '/admin/payment-providers/:provider/set-default',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  wrap(configController.setDefaultPaymentProvider)
);

// ============================================================================
// BRANDING ROUTES
// ============================================================================

/**
 * GET /api/config/admin/branding
 * Get branding configuration
 */
router.get(
  '/admin/branding',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  wrap(configController.getBranding)
);

/**
 * PATCH /api/config/admin/branding
 * Update branding configuration
 */
router.patch(
  '/admin/branding',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  wrap(configController.updateBranding)
);

/**
 * POST /api/config/admin/theme-preset
 * Apply a theme preset
 */
router.post(
  '/admin/theme-preset',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  wrap(configController.applyThemePreset)
);

export default router;

