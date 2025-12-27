/**
 * Configuration Middleware
 * Attaches site configuration to request object
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as configService from '../services/config.service.js';
import { PublicSiteConfig } from '../services/config.service.js';
import { logger } from '../utils/logger.js';

// Extend Request type to include config
declare global {
  namespace Express {
    interface Request {
      siteConfig?: PublicSiteConfig;
    }
  }
}

/**
 * Load site configuration on each request
 * Attaches public config to req.siteConfig
 */
export const loadSiteConfig: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    req.siteConfig = await configService.getPublicSiteConfig();
    next();
  } catch (error) {
    logger.error('Failed to load site configuration', { error });
    // Continue without config - don't block requests
    next();
  }
};

/**
 * Check maintenance mode
 * Returns 503 if site is in maintenance mode
 * Allows admin routes through
 */
export const checkMaintenanceMode: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const config = req.siteConfig || await configService.getPublicSiteConfig();
    
    // Skip maintenance check for admin routes and health checks
    if (
      req.path.startsWith('/api/admin') ||
      req.path.startsWith('/api/auth') ||
      req.path === '/api/health' ||
      req.path.startsWith('/admin')
    ) {
      next();
      return;
    }
    
    if (config.maintenanceMode) {
      res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable',
        message: 'The site is currently undergoing maintenance. Please try again later.',
        code: 'MAINTENANCE_MODE'
      });
      return;
    }
    
    next();
  } catch (error) {
    logger.error('Failed to check maintenance mode', { error });
    next();
  }
};

/**
 * Initialize config on app startup
 * Creates default config if not exists
 */
export async function initializeConfig(): Promise<void> {
  try {
    const config = await configService.getSiteConfig();
    logger.info('Site configuration loaded', { 
      orgName: config.orgName,
      currency: config.currency,
      locale: config.locale 
    });
    
    // Initialize default payment providers
    await configService.initializeDefaultProviders();
  } catch (error) {
    logger.error('Failed to initialize site configuration', { error });
    throw error;
  }
}

