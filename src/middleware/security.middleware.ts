import helmet from 'helmet';
import cors from 'cors';
import { RequestHandler } from 'express';

/**
 * Get allowed origins from environment
 */
function getAllowedOrigins(): string[] {
  const origins = process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5000,http://localhost:5001';
  return origins.split(',').map(origin => origin.trim());
}

/**
 * Helmet security headers middleware
 * Configures various HTTP headers for security
 */
export const helmetMiddleware: RequestHandler = helmet({
  // Disable CSP in development for Vite compatibility
  contentSecurityPolicy: false,
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  // Hide X-Powered-By header
  hidePoweredBy: true,
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  // Prevent MIME type sniffing
  noSniff: true,
  // XSS filter
  xssFilter: true,
  // Referrer policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // Cross-Origin-Embedder-Policy - disable for compatibility
  crossOriginEmbedderPolicy: false,
  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: { policy: 'same-site' },
});

/**
 * CORS middleware with dynamic origin checking
 */
export const corsMiddleware: RequestHandler = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
      return;
    }
    
    // Origin not allowed
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  maxAge: 86400, // Cache preflight for 24 hours
  optionsSuccessStatus: 204,
});

/**
 * Security headers for API responses
 * Additional headers not covered by Helmet
 */
export const apiSecurityHeaders: RequestHandler = (_req, res, next) => {
  // Prevent caching of sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

/**
 * Request sanitization middleware
 * Removes potentially dangerous fields from request
 */
export const sanitizeRequest: RequestHandler = (req, _res, next) => {
  // Remove __proto__ and constructor from body to prevent prototype pollution
  if (req.body && typeof req.body === 'object') {
    delete req.body.__proto__;
    delete req.body.constructor;
    delete req.body.prototype;
  }
  
  next();
};

