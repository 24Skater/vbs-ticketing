import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger.js';

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'ERROR';
    this.details = details;
    this.isOperational = true; // Distinguishes from programming errors
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
    
    // Set prototype explicitly for instanceof to work
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Common error factory functions
 */
export const Errors = {
  badRequest: (message: string, details?: unknown) =>
    new AppError(400, message, 'BAD_REQUEST', details),
    
  unauthorized: (message = 'Authentication required') =>
    new AppError(401, message, 'UNAUTHORIZED'),
    
  forbidden: (message = 'Access denied') =>
    new AppError(403, message, 'FORBIDDEN'),
    
  notFound: (resource = 'Resource') =>
    new AppError(404, `${resource} not found`, 'NOT_FOUND'),
    
  conflict: (message: string) =>
    new AppError(409, message, 'CONFLICT'),
    
  tooManyRequests: (message = 'Too many requests') =>
    new AppError(429, message, 'TOO_MANY_REQUESTS'),
    
  internal: (message = 'Internal server error') =>
    new AppError(500, message, 'INTERNAL_ERROR'),
    
  notImplemented: (feature = 'Feature') =>
    new AppError(501, `${feature} not implemented`, 'NOT_IMPLEMENTED'),
};

/**
 * Format Zod validation errors
 */
function formatZodError(error: ZodError) {
  return {
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    })),
  };
}

/**
 * Format Prisma database errors
 */
function formatPrismaError(error: Prisma.PrismaClientKnownRequestError) {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const target = (error.meta?.target as string[])?.join(', ') || 'field';
      return {
        statusCode: 409,
        response: {
          error: `A record with this ${target} already exists`,
          code: 'DUPLICATE_ENTRY',
          field: target,
        },
      };
      
    case 'P2025':
      // Record not found
      return {
        statusCode: 404,
        response: {
          error: 'Record not found',
          code: 'NOT_FOUND',
        },
      };
      
    case 'P2003':
      // Foreign key constraint
      return {
        statusCode: 400,
        response: {
          error: 'Related record not found',
          code: 'FOREIGN_KEY_ERROR',
        },
      };
      
    case 'P2014':
      // Required relation violation
      return {
        statusCode: 400,
        response: {
          error: 'Required relation missing',
          code: 'RELATION_ERROR',
        },
      };
      
    default:
      return {
        statusCode: 500,
        response: {
          error: 'Database error',
          code: 'DATABASE_ERROR',
        },
      };
  }
}

/**
 * Determine if error should be logged
 */
function shouldLogError(error: Error): boolean {
  // Don't log validation errors or expected 4xx errors
  if (error instanceof ZodError) return false;
  if (error instanceof AppError && error.statusCode < 500) return false;
  return true;
}

/**
 * Main error handler middleware
 * Must be registered last in the middleware chain
 */
export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error if needed
  if (shouldLogError(error)) {
    logger.error(error.message, {
      error: error.name,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: req.userId,
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json(formatZodError(error));
    return;
  }

  // Handle custom application errors
  if (error instanceof AppError) {
    const response: { error: string; code: string; details?: unknown } = {
      error: error.message,
      code: error.code,
    };
    if (error.details) {
      response.details = error.details;
    }
    res.status(error.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { statusCode, response } = formatPrismaError(error);
    res.status(statusCode).json(response);
    return;
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      error: 'Invalid data provided',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
    return;
  }

  // Handle syntax errors in JSON body
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      error: 'Invalid JSON in request body',
      code: 'INVALID_JSON',
    });
    return;
  }

  // Default error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response: { error: string; code: string; stack?: string } = {
    error: isDevelopment ? error.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
  };
  
  if (isDevelopment && error.stack) {
    response.stack = error.stack;
  }
  
  res.status(500).json(response);
};

/**
 * 404 handler for unknown routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
};

/**
 * Async handler wrapper to catch promise rejections
 * Use this to wrap async route handlers
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await getUsers();
 *   res.json(users);
 * }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

