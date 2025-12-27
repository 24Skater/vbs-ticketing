import { z } from 'zod';

/**
 * Environment variable schema with strict validation
 * All required variables must be present for the app to start
 */
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Hubtel Payment Gateway
  HUBTEL_API_ID: z.string().min(1, 'HUBTEL_API_ID is required'),
  HUBTEL_API_KEY: z.string().min(1, 'HUBTEL_API_KEY is required'),
  HUBTEL_CLIENT_ID: z.string().optional(),
  HUBTEL_CLIENT_SECRET: z.string().optional(),
  HUBTEL_POS_SALES_ID: z.string().min(1, 'HUBTEL_POS_SALES_ID is required'),
  HUBTEL_WEBHOOK_SECRET: z.string().optional(),
  HUBTEL_CALLBACK_URL: z.string().url().optional(),
  HUBTEL_WEBHOOK_TRUST: z.string().transform(val => val?.toLowerCase() === 'true').default('false'),

  // App Configuration
  PUBLIC_BASE_URL: z.string().url().optional(),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5000'),
  MIN_TICKET_AMOUNT: z.string().default('300').transform(Number),

  // Redis (optional - for distributed rate limiting)
  REDIS_URL: z.string().url().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 * Exits the process if validation fails
 */
function validateEnv(): Env {
  // Load dotenv if not already loaded
  if (!process.env.DATABASE_URL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('dotenv').config();
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error('');
    
    const errors = result.error.format();
    Object.entries(errors).forEach(([key, value]) => {
      if (key !== '_errors' && typeof value === 'object' && '_errors' in value) {
        const errorMessages = (value as { _errors: string[] })._errors;
        if (errorMessages.length > 0) {
          console.error(`  ${key}: ${errorMessages.join(', ')}`);
        }
      }
    });
    
    console.error('');
    console.error('Please check your .env file and ensure all required variables are set.');
    console.error('See .env.example for reference.');
    process.exit(1);
  }

  return result.data;
}

/**
 * Validated environment variables
 * Access these instead of process.env directly
 */
export const env = validateEnv();

/**
 * Helper to check if we're in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Helper to check if we're in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Helper to check if we're in test mode
 */
export const isTest = env.NODE_ENV === 'test';

