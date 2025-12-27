import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Custom log format for console output
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length 
      ? '\n' + JSON.stringify(meta, null, 2) 
      : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

/**
 * JSON format for file output and production
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Determine log level from environment
 */
function getLogLevel(): string {
  return process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
}

/**
 * Create transports based on environment
 */
function createTransports(): winston.transport[] {
  const transports: winston.transport[] = [
    // Console transport (always enabled)
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? jsonFormat : consoleFormat,
    }),
  ];

  // Add file transports in production
  if (process.env.NODE_ENV === 'production') {
    const logsDir = path.join(__dirname, '../../logs');

    transports.push(
      // Error log
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: jsonFormat,
        maxsize: 5 * 1024 * 1024, // 5MB
        maxFiles: 5,
        tailable: true,
      }),
      // Combined log
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        format: jsonFormat,
        maxsize: 5 * 1024 * 1024, // 5MB
        maxFiles: 5,
        tailable: true,
      })
    );
  }

  return transports;
}

/**
 * Main logger instance
 */
export const logger = winston.createLogger({
  level: getLogLevel(),
  defaultMeta: { service: 'vbs-ticketing' },
  transports: createTransports(),
  // Don't exit on error
  exitOnError: false,
});

/**
 * Create a child logger with additional context
 * @param context - Additional metadata to include in all logs
 */
export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Log HTTP request details
 */
export function logRequest(req: {
  method: string;
  path: string;
  ip?: string;
  userId?: string;
  duration?: number;
  statusCode?: number;
}) {
  const { method, path: reqPath, ip, userId, duration, statusCode } = req;
  
  const level = statusCode && statusCode >= 400 ? 'warn' : 'info';
  
  logger.log(level, `${method} ${reqPath}`, {
    method,
    path: reqPath,
    ip,
    userId,
    duration: duration ? `${duration}ms` : undefined,
    statusCode,
  });
}

/**
 * Log an error with stack trace
 */
export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error(error.message, {
    error: error.name,
    stack: error.stack,
    ...context,
  });
}

/**
 * Log a security event
 */
export function logSecurity(event: string, details?: Record<string, unknown>) {
  logger.warn(`[SECURITY] ${event}`, {
    type: 'security',
    event,
    ...details,
  });
}

/**
 * Log a payment event
 */
export function logPayment(event: string, details?: Record<string, unknown>) {
  logger.info(`[PAYMENT] ${event}`, {
    type: 'payment',
    event,
    ...details,
  });
}

// Handle uncaught exceptions
logger.exceptions.handle(
  new winston.transports.Console({ format: consoleFormat })
);

// Handle unhandled promise rejections
logger.rejections.handle(
  new winston.transports.Console({ format: consoleFormat })
);

