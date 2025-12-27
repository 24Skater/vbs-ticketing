import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Standard error response for rate limiting
 */
interface RateLimitError {
  error: string;
  code: string;
  retryAfter: string;
  limit: number;
  remaining: number;
}

/**
 * Create a rate limit error response
 */
function createRateLimitResponse(
  message: string,
  code: string,
  retryAfter: number,
  limit: number
): RateLimitError {
  return {
    error: message,
    code,
    retryAfter: `${Math.ceil(retryAfter / 1000)} seconds`,
    limit,
    remaining: 0,
  };
}

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: createRateLimitResponse(
    'Too many requests from this IP, please try again later',
    'RATE_LIMIT_EXCEEDED',
    15 * 60 * 1000,
    100
  ),
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,  // Disable X-RateLimit-* headers
  handler: (_req: Request, res: Response) => {
    res.status(429).json(createRateLimitResponse(
      'Too many requests from this IP, please try again later',
      'RATE_LIMIT_EXCEEDED',
      15 * 60 * 1000,
      100
    ));
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 10 attempts per hour per IP (to prevent brute force)
 */
export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: createRateLimitResponse(
    'Too many login attempts, please try again in an hour',
    'AUTH_RATE_LIMIT',
    60 * 60 * 1000,
    10
  ),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  handler: (_req: Request, res: Response) => {
    res.status(429).json(createRateLimitResponse(
      'Too many login attempts, please try again in an hour',
      'AUTH_RATE_LIMIT',
      60 * 60 * 1000,
      10
    ));
  },
});

/**
 * Rate limiter for public ticket lookups
 * 20 requests per 5 minutes per IP
 */
export const lookupLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  message: createRateLimitResponse(
    'Too many lookup attempts, please wait a few minutes',
    'LOOKUP_RATE_LIMIT',
    5 * 60 * 1000,
    20
  ),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json(createRateLimitResponse(
      'Too many lookup attempts, please wait a few minutes',
      'LOOKUP_RATE_LIMIT',
      5 * 60 * 1000,
      20
    ));
  },
});

/**
 * Rate limiter for webhook endpoints
 * Higher limit since these come from payment providers
 * 120 requests per minute per IP
 */
export const webhookLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  message: createRateLimitResponse(
    'Too many webhook calls',
    'WEBHOOK_RATE_LIMIT',
    60 * 1000,
    120
  ),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json(createRateLimitResponse(
      'Too many webhook calls',
      'WEBHOOK_RATE_LIMIT',
      60 * 1000,
      120
    ));
  },
});

/**
 * Rate limiter for ticket creation
 * 50 tickets per hour per IP
 */
export const createTicketLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: createRateLimitResponse(
    'Ticket creation limit reached, please try again later',
    'CREATE_RATE_LIMIT',
    60 * 60 * 1000,
    50
  ),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json(createRateLimitResponse(
      'Ticket creation limit reached, please try again later',
      'CREATE_RATE_LIMIT',
      60 * 60 * 1000,
      50
    ));
  },
});

/**
 * Strict rate limiter for password reset
 * 3 requests per hour per IP
 */
export const passwordResetLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: createRateLimitResponse(
    'Too many password reset attempts, please try again later',
    'PASSWORD_RESET_RATE_LIMIT',
    60 * 60 * 1000,
    3
  ),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json(createRateLimitResponse(
      'Too many password reset attempts, please try again later',
      'PASSWORD_RESET_RATE_LIMIT',
      60 * 60 * 1000,
      3
    ));
  },
});

