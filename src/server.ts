import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Config & Utils
import { env, isProduction } from './config/env.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './utils/prisma.js';

// Middleware
import {
  helmetMiddleware,
  corsMiddleware,
  apiSecurityHeaders,
  sanitizeRequest,
} from './middleware/security.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware.js';

// Routes
import apiRoutes from './routes/index.js';
import paymentRoutes from './routes/payment.routes.js';
import webhookRoutes from './routes/webhook.routes.js';

// Auth service initialization
import { initializeAdminUser } from './services/auth.service.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// =============================================================================
// TRUST PROXY (for rate limiting behind reverse proxy)
// =============================================================================
if (isProduction) {
  app.set('trust proxy', 1);
}

// =============================================================================
// SECURITY MIDDLEWARE
// =============================================================================
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(sanitizeRequest);

// =============================================================================
// BODY PARSING
// =============================================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================================================
// REQUEST LOGGING
// =============================================================================
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.log(logLevel, `${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  
  next();
});

// =============================================================================
// API ROUTES
// =============================================================================

// Health check (no rate limit)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
  });
});

// Webhooks (special handling, no rate limit for trusted sources)
app.use('/api/webhooks', webhookRoutes);

// API routes with rate limiting and security headers
app.use('/api', apiLimiter, apiSecurityHeaders, apiRoutes);
app.use('/api/payments', apiLimiter, apiSecurityHeaders, paymentRoutes);

// =============================================================================
// STATIC FILES & SPA
// =============================================================================
const frontendPath = path.join(__dirname, '../frontend/dist');

// Serve static files
app.use(express.static(frontendPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  const indexPath = path.join(frontendPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // If frontend not built, show helpful message
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>VBS Ticketing</title></head>
        <body style="font-family: system-ui; padding: 40px; text-align: center;">
          <h1>🎫 VBS Ticketing API</h1>
          <p>API is running on port ${env.PORT}</p>
          <p>Frontend not built. Run: <code>npm run build:frontend</code></p>
          <hr>
          <p><a href="/api/health">Health Check</a></p>
        </body>
        </html>
      `);
    }
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================
app.use(notFoundHandler);
app.use(errorHandler);

// =============================================================================
// SERVER STARTUP
// =============================================================================
async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();
    
    // Initialize default admin user
    initializeAdminUser();
    
    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
      logger.info(`   Environment: ${env.NODE_ENV}`);
      logger.info(`   API: http://localhost:${env.PORT}/api`);
      logger.info(`   Health: http://localhost:${env.PORT}/api/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;

