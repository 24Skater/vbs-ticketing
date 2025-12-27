import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, DecodedToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

/**
 * Extend Express Request to include user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
      userId?: string;
    }
  }
}

/**
 * Extract token from Authorization header
 * Supports: "Bearer <token>" format
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  return null;
}

/**
 * Middleware to require authentication
 * Verifies JWT token and attaches user to request
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        message: 'Please provide a valid access token in the Authorization header',
      });
      return;
    }

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      req.userId = decoded.userId;
      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
      
      logger.warn('Authentication failed', {
        error: errorMessage,
        ip: req.ip,
        path: req.path,
      });

      if (errorMessage.includes('expired')) {
        res.status(401).json({
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please log in again.',
        });
        return;
      }

      res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
        message: 'The provided token is invalid or malformed.',
      });
      return;
    }
  } catch (error) {
    logger.error('Auth middleware error', { error });
    res.status(500).json({
      error: 'Authentication error',
      code: 'AUTH_ERROR',
    });
  }
}

/**
 * Middleware to optionally attach user if token is present
 * Does not require authentication, but will attach user if valid token exists
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        req.userId = decoded.userId;
      } catch {
        // Token invalid, but that's okay for optional auth
        // Just don't attach user
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    next();
  }
}

/**
 * Role type for authorization
 */
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CHECKER';

/**
 * Role hierarchy - higher roles include permissions of lower roles
 */
const roleHierarchy: Record<Role, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  STAFF: 60,
  CHECKER: 40,
};

/**
 * Middleware factory to require specific roles
 * Must be used after requireAuth
 * 
 * @param roles - Allowed roles for this route
 * @returns Express middleware function
 * 
 * @example
 * router.get('/admin', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), handler);
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const userRole = req.user.role as Role;

    // Check if user has any of the required roles
    if (roles.includes(userRole)) {
      next();
      return;
    }

    // Check role hierarchy - higher roles can access lower role routes
    const userLevel = roleHierarchy[userRole] || 0;
    const hasAccess = roles.some(role => userLevel >= roleHierarchy[role]);

    if (hasAccess) {
      next();
      return;
    }

    logger.warn('Authorization failed', {
      userId: req.user.userId,
      userRole,
      requiredRoles: roles,
      path: req.path,
    });

    res.status(403).json({
      error: 'Insufficient permissions',
      code: 'FORBIDDEN',
      message: `This action requires one of the following roles: ${roles.join(', ')}`,
      requiredRoles: roles,
    });
  };
}

/**
 * Middleware to require minimum role level
 * Uses role hierarchy for comparison
 */
export function requireMinRole(minRole: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const userRole = req.user.role as Role;
    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[minRole];

    if (userLevel >= requiredLevel) {
      next();
      return;
    }

    res.status(403).json({
      error: 'Insufficient permissions',
      code: 'FORBIDDEN',
      message: `This action requires at least ${minRole} role`,
    });
  };
}

