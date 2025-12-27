import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

/**
 * Extended Prisma Client with logging and connection handling
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create Prisma client with appropriate logging
 */
function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return new PrismaClient({
    log: isProduction
      ? [{ emit: 'event', level: 'error' }]
      : [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ],
  });
}

/**
 * Singleton Prisma client instance
 * Reuses existing instance in development to prevent connection exhaustion
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Set up event listeners
prisma.$on('error' as never, (e: { message: string }) => {
  logger.error('Prisma error', { error: e.message });
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  
  // Log queries in development (optional - can be verbose)
  prisma.$on('query' as never, (e: { query: string; duration: number }) => {
    if (process.env.LOG_LEVEL === 'debug') {
      logger.debug('Prisma query', {
        query: e.query,
        duration: `${e.duration}ms`,
      });
    }
  });
}

/**
 * Connect to database
 * Call this at server startup
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database', { error });
    throw error;
  }
}

/**
 * Disconnect from database
 * Call this during graceful shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  } catch (error) {
    logger.error('Error disconnecting from database', { error });
  }
}

/**
 * Health check for database connection
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * Transaction helper for complex operations
 * @param fn - Function to execute within transaction
 * @returns Result of the transaction
 */
export async function withTransaction<T>(
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn);
}

export default prisma;
