/**
 * Configuration Controller
 * Handles API requests for site configuration
 */

import { Request, Response } from 'express';
import * as configService from '../services/config.service.js';
import { PaymentProviderType } from '@prisma/client';

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

/**
 * GET /api/config
 * Get public site configuration (no sensitive data)
 */
export async function getPublicConfig(
  _req: Request,
  res: Response
): Promise<void> {
  const config = await configService.getPublicSiteConfig();
  
  res.json({
    success: true,
    data: config
  });
}

/**
 * GET /api/config/theme.css
 * Get theme CSS variables
 */
export async function getThemeCss(
  _req: Request,
  res: Response
): Promise<void> {
  const config = await configService.getPublicSiteConfig();
  const css = configService.generateThemeCss(config);
  
  res.setHeader('Content-Type', 'text/css');
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min cache
  res.send(css);
}

/**
 * GET /api/config/payment-providers
 * Get enabled payment providers (public info only)
 */
export async function getPublicPaymentProviders(
  _req: Request,
  res: Response
): Promise<void> {
  const providers = await configService.getEnabledPaymentProviders();
  
  res.json({
    success: true,
    data: providers
  });
}

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/config
 * Get full site configuration (admin only)
 */
export async function getFullConfig(
  _req: Request,
  res: Response
): Promise<void> {
  const config = await configService.getSiteConfig();
  
  res.json({
    success: true,
    data: config
  });
}

/**
 * PATCH /api/admin/config
 * Update site configuration (admin only)
 */
export async function updateConfig(
  req: Request,
  res: Response
): Promise<void> {
  const config = await configService.updateSiteConfig(req.body);
  
  res.json({
    success: true,
    message: 'Configuration updated successfully',
    data: config
  });
}

/**
 * POST /api/admin/config/clear-cache
 * Clear configuration cache
 */
export async function clearCache(
  _req: Request,
  res: Response
): Promise<void> {
  configService.clearConfigCache();
  
  res.json({
    success: true,
    message: 'Configuration cache cleared'
  });
}

// ============================================================================
// PAYMENT PROVIDER ADMIN ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/payment-providers
 * Get all payment provider configs (including secrets)
 */
export async function getAllPaymentProviders(
  _req: Request,
  res: Response
): Promise<void> {
  const providers = await configService.getPaymentProviders();
  
  res.json({
    success: true,
    data: providers
  });
}

/**
 * GET /api/admin/payment-providers/:provider
 * Get specific payment provider config
 */
export async function getPaymentProvider(
  req: Request,
  res: Response
): Promise<void> {
  const { provider } = req.params;
  
  const providerConfig = await configService.getPaymentProvider(
    provider as PaymentProviderType
  );
  
  if (!providerConfig) {
    res.status(404).json({
      success: false,
      error: 'Payment provider not found'
    });
    return;
  }
  
  res.json({
    success: true,
    data: providerConfig
  });
}

/**
 * PUT /api/admin/payment-providers/:provider
 * Create or update payment provider config
 */
export async function upsertPaymentProvider(
  req: Request,
  res: Response
): Promise<void> {
  const { provider } = req.params;
  const data = req.body;
  
  const providerConfig = await configService.upsertPaymentProvider(
    provider as PaymentProviderType,
    data
  );
  
  res.json({
    success: true,
    message: 'Payment provider updated successfully',
    data: providerConfig
  });
}

/**
 * DELETE /api/admin/payment-providers/:provider
 * Delete payment provider config
 */
export async function deletePaymentProvider(
  req: Request,
  res: Response
): Promise<void> {
  const { provider } = req.params;
  
  await configService.deletePaymentProvider(provider as PaymentProviderType);
  
  res.json({
    success: true,
    message: 'Payment provider deleted successfully'
  });
}

/**
 * POST /api/admin/payment-providers/:provider/toggle
 * Enable/disable payment provider
 */
export async function togglePaymentProvider(
  req: Request,
  res: Response
): Promise<void> {
  const { provider } = req.params;
  const { enabled } = req.body;
  
  const providerConfig = await configService.upsertPaymentProvider(
    provider as PaymentProviderType,
    { displayName: provider, enabled: Boolean(enabled) }
  );
  
  res.json({
    success: true,
    message: `Payment provider ${enabled ? 'enabled' : 'disabled'}`,
    data: providerConfig
  });
}

/**
 * POST /api/admin/payment-providers/:provider/set-default
 * Set payment provider as default
 */
export async function setDefaultPaymentProvider(
  req: Request,
  res: Response
): Promise<void> {
  const { provider } = req.params;
  
  const providerConfig = await configService.upsertPaymentProvider(
    provider as PaymentProviderType,
    { displayName: provider, isDefault: true }
  );
  
  res.json({
    success: true,
    message: 'Default payment provider updated',
    data: providerConfig
  });
}

// ============================================================================
// BRANDING ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/branding
 * Get branding configuration
 */
export async function getBranding(
  _req: Request,
  res: Response
): Promise<void> {
  const branding = await configService.getBranding();
  
  res.json({
    success: true,
    data: branding
  });
}

/**
 * PATCH /api/admin/branding
 * Update branding configuration
 */
export async function updateBranding(
  req: Request,
  res: Response
): Promise<void> {
  const branding = await configService.updateBranding(req.body);
  
  res.json({
    success: true,
    message: 'Branding updated successfully',
    data: branding
  });
}

/**
 * POST /api/admin/theme-preset
 * Apply a theme preset
 */
export async function applyThemePreset(
  req: Request,
  res: Response
): Promise<void> {
  const { preset } = req.body;
  
  if (!preset || !configService.THEME_PRESETS[preset as keyof typeof configService.THEME_PRESETS]) {
    res.status(400).json({
      success: false,
      error: 'Invalid theme preset'
    });
    return;
  }
  
  const branding = await configService.applyThemePreset(
    preset as keyof typeof configService.THEME_PRESETS
  );
  
  res.json({
    success: true,
    message: `Applied ${preset} theme preset`,
    data: branding
  });
}

