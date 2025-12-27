# VBS Ticketing System - Modernization Master Plan

## 🎯 Document Purpose

This document serves as:
1. **Systematic Implementation Plan** - Step-by-step guide for all changes
2. **AI Agent Guardrail** - Ensures no steps are skipped
3. **Progress Tracker** - Checkboxes for completion status
4. **Acceptance Criteria** - Validation requirements for each step

---

## 📋 IMPLEMENTATION RULES FOR AI AGENTS

### Critical Rules (MUST FOLLOW)

1. **NEVER skip a step** - Complete each checkbox before moving to the next
2. **NEVER proceed without validation** - Each step has acceptance criteria that MUST pass
3. **ALWAYS create backups** - Before any destructive operation
4. **ALWAYS run tests** - After each implementation step
5. **ALWAYS update this document** - Mark checkboxes as completed
6. **STOP and ASK** if unclear about any step
7. **ROLLBACK immediately** if any step fails validation

### Execution Order

```
PHASE 0 (Preparation) → PHASE 1 (Security) → PHASE 2 (Structure) → 
PHASE 3 (Database) → PHASE 4 (Backend) → PHASE 5 (Frontend) → 
PHASE 6 (Testing) → PHASE 7 (DevOps) → PHASE 8 (Features)
```

### Before Starting ANY Phase

- [ ] Read the entire phase documentation
- [ ] Understand all acceptance criteria
- [ ] Verify prerequisites are met
- [ ] Create a git branch for the phase
- [ ] Notify user of phase start

### After Completing ANY Phase

- [ ] Run all validation checks
- [ ] Update progress in this document
- [ ] Commit changes with descriptive message
- [ ] Create PR or merge to main
- [ ] Notify user of phase completion

---

## 📊 PROGRESS TRACKER

| Phase | Status | Started | Completed | Validated |
|-------|--------|---------|-----------|-----------|
| Phase 0: Preparation | ⬜ Not Started | - | - | - |
| Phase 1: Security | ⬜ Not Started | - | - | - |
| Phase 2: Structure | ⬜ Not Started | - | - | - |
| Phase 3: Database | ⬜ Not Started | - | - | - |
| Phase 4: Backend | ⬜ Not Started | - | - | - |
| Phase 5: Frontend | ⬜ Not Started | - | - | - |
| Phase 6: Testing | ⬜ Not Started | - | - | - |
| Phase 7: DevOps | ⬜ Not Started | - | - | - |
| Phase 8: Features | ⬜ Not Started | - | - | - |

**Status Legend:** ⬜ Not Started | 🔄 In Progress | ✅ Completed | ❌ Blocked

---

# PHASE 0: PREPARATION & SETUP

## 0.1 Environment Assessment

### Step 0.1.1: Document Current State
- [ ] **ACTION**: List all current files and their purposes
- [ ] **ACTION**: Document current dependencies and versions
- [ ] **ACTION**: Screenshot current working application
- [ ] **VALIDATE**: Create `CURRENT_STATE.md` with findings

### Step 0.1.2: Create Backup
- [ ] **ACTION**: Create git commit of current state
- [ ] **ACTION**: Tag commit as `v1.0.0-legacy`
- [ ] **ACTION**: Push to remote repository
- [ ] **VALIDATE**: Verify tag exists with `git tag -l`

```bash
# Commands to execute
git add -A
git commit -m "chore: snapshot before modernization"
git tag v1.0.0-legacy
git push origin main --tags
```

### Step 0.1.3: Setup Development Environment
- [ ] **ACTION**: Ensure Node.js 20+ is installed
- [ ] **ACTION**: Ensure Docker is running
- [ ] **ACTION**: Ensure PostgreSQL container is running
- [ ] **ACTION**: Install global tools: `npm install -g tsx prisma`
- [ ] **VALIDATE**: Run `node -v`, `docker -v`, `npx prisma -v`

**ACCEPTANCE CRITERIA:**
```
✓ Node.js version >= 20.0.0
✓ Docker running and accessible
✓ PostgreSQL container responding
✓ Git repository has v1.0.0-legacy tag
```

---

## 0.2 Create New Project Structure

### Step 0.2.1: Create Directory Structure
- [ ] **ACTION**: Create new directory structure (DO NOT delete old files yet)

```bash
# Execute these commands in order
mkdir -p src/{config,controllers,middleware,routes,services,utils,types,validators}
mkdir -p src/__tests__/{unit,integration,e2e}
mkdir -p scripts
mkdir -p docs
```

- [ ] **VALIDATE**: Verify directories exist with `ls -la src/`

### Step 0.2.2: Initialize TypeScript
- [ ] **ACTION**: Create `tsconfig.json` in project root

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "baseUrl": "."
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "frontend", "admin-panel", "admin-frontend"]
}
```

- [ ] **VALIDATE**: Run `npx tsc --noEmit` (should have no output)

### Step 0.2.3: Update Package.json
- [ ] **ACTION**: Update `package.json` with new scripts and dependencies

```json
{
  "name": "vbs-ticketing",
  "version": "2.0.0",
  "type": "module",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc && npm run build:frontend",
    "build:frontend": "cd frontend && npm install && npm run build",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "typecheck": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:seed": "tsx src/scripts/seed.ts",
    "db:studio": "prisma studio",
    "prepare": "prisma generate"
  }
}
```

- [ ] **VALIDATE**: Run `npm run typecheck` without errors

### Step 0.2.4: Install New Dependencies
- [ ] **ACTION**: Install production dependencies

```bash
npm install zod jsonwebtoken bcryptjs helmet express-rate-limit cors dotenv winston ioredis uuid
```

- [ ] **ACTION**: Install development dependencies

```bash
npm install -D typescript @types/node @types/express @types/jsonwebtoken @types/bcryptjs @types/cors tsx vitest @vitest/coverage-v8 eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier
```

- [ ] **VALIDATE**: `npm ls` shows no peer dependency errors

**PHASE 0 COMPLETION CHECKLIST:**
- [ ] All directories created
- [ ] TypeScript configured and compiling
- [ ] All dependencies installed
- [ ] Package.json updated
- [ ] Git backup created with tag
- [ ] Development environment verified

**STOP POINT**: Do not proceed to Phase 1 until ALL Phase 0 items are checked.

---

# PHASE 1: SECURITY HARDENING

## 1.1 Environment Configuration

### Step 1.1.1: Create Environment Schema
- [ ] **ACTION**: Create `src/config/env.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_DEFAULT_PASSWORD: z.string().min(8).optional(),
  
  // Hubtel
  HUBTEL_API_ID: z.string(),
  HUBTEL_API_KEY: z.string(),
  HUBTEL_CLIENT_ID: z.string().optional(),
  HUBTEL_CLIENT_SECRET: z.string().optional(),
  HUBTEL_POS_SALES_ID: z.string(),
  HUBTEL_WEBHOOK_SECRET: z.string().optional(),
  HUBTEL_CALLBACK_URL: z.string().url().optional(),
  
  // App Config
  PUBLIC_BASE_URL: z.string().url().optional(),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  MIN_TICKET_AMOUNT: z.string().default('300').transform(Number),
  
  // Redis (optional)
  REDIS_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }
  
  return result.data;
}

export const env = validateEnv();
```

- [ ] **VALIDATE**: Create test file and import env

### Step 1.1.2: Create Secure .env.example
- [ ] **ACTION**: Create `.env.example` with all required variables

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vbs_ticketing"

# Authentication (Generate with: openssl rand -base64 32)
JWT_SECRET="your-32-character-minimum-secret-key-here"
JWT_EXPIRES_IN="7d"

# Hubtel Payment Gateway
HUBTEL_API_ID="your-hubtel-api-id"
HUBTEL_API_KEY="your-hubtel-api-key"
HUBTEL_CLIENT_ID="your-hubtel-client-id"
HUBTEL_CLIENT_SECRET="your-hubtel-client-secret"
HUBTEL_POS_SALES_ID="your-pos-sales-id"
HUBTEL_WEBHOOK_SECRET="your-webhook-secret"
HUBTEL_CALLBACK_URL="https://yourdomain.com/api/webhooks/hubtel"

# App Configuration
PUBLIC_BASE_URL="https://yourdomain.com"
ALLOWED_ORIGINS="http://localhost:5173,https://yourdomain.com"
MIN_TICKET_AMOUNT=300

# Redis (Optional - for rate limiting)
REDIS_URL="redis://localhost:6379"
```

- [ ] **ACTION**: Update `.gitignore` to include `.env`
- [ ] **VALIDATE**: `.env` is not tracked by git

## 1.2 Authentication System

### Step 1.2.1: Create Password Utilities
- [ ] **ACTION**: Create `src/utils/password.ts`

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character');
  
  return { valid: errors.length === 0, errors };
}
```

- [ ] **VALIDATE**: Write unit test for password functions

### Step 1.2.2: Create JWT Utilities
- [ ] **ACTION**: Create `src/utils/jwt.ts`

```typescript
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'vbs-ticketing',
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, env.JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'vbs-ticketing',
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'vbs-ticketing',
  }) as TokenPayload;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}
```

- [ ] **VALIDATE**: Write unit test for JWT functions

### Step 1.2.3: Create Auth Middleware
- [ ] **ACTION**: Create `src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { prisma } from '../utils/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      });
    }
    
    const payload = verifyToken(token);
    
    // Verify user still exists and is active
    const user = await prisma.adminUser.findUnique({
      where: { id: payload.userId },
      select: { id: true, status: true, role: true }
    });
    
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ 
        error: 'User account is not active',
        code: 'ACCOUNT_INACTIVE' 
      });
    }
    
    req.user = payload;
    req.userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN' 
    });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        required: roles 
      });
    }
    
    next();
  };
}
```

- [ ] **VALIDATE**: Test middleware with mock requests

## 1.3 Input Validation

### Step 1.3.1: Create Validation Schemas
- [ ] **ACTION**: Create `src/validators/ticket.validator.ts`

```typescript
import { z } from 'zod';

// Ghana phone number validation
const ghanaPhoneRegex = /^(233|0)\d{9}$/;

export const phoneSchema = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => ghanaPhoneRegex.test(val), {
    message: 'Invalid Ghana phone number format'
  });

export const createTicketSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  phone: phoneSchema,
  ticketType: z.enum(['REGULAR', 'VIP', 'EARLY_BIRD']).default('REGULAR'),
  eventId: z.string().cuid().optional(),
  amount: z.number().positive().optional(),
});

export const verifyTicketSchema = z.object({
  ticketId: z.string()
    .regex(/^VBS-[A-Z0-9]{6}$/, 'Invalid ticket ID format'),
});

export const lookupTicketSchema = z.object({
  phone: phoneSchema,
  accessCode: z.string()
    .length(5, 'Access code must be 5 characters')
    .toUpperCase(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type VerifyTicketInput = z.infer<typeof verifyTicketSchema>;
export type LookupTicketInput = z.infer<typeof lookupTicketSchema>;
```

- [ ] **ACTION**: Create `src/validators/auth.validator.ts`

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  name: z.string().min(2).max(100),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STAFF', 'CHECKER']).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

- [ ] **VALIDATE**: Write tests for all validators

### Step 1.3.2: Create Validation Middleware
- [ ] **ACTION**: Create `src/middleware/validate.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data; // Replace with parsed/transformed data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}
```

- [ ] **VALIDATE**: Test with invalid input

## 1.4 Security Middleware

### Step 1.4.1: Create Rate Limiting
- [ ] **ACTION**: Create `src/middleware/rateLimit.middleware.ts`

```typescript
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: {
    error: 'Too many login attempts',
    code: 'AUTH_RATE_LIMIT',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Webhook rate limit (higher for payment callbacks)
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { error: 'Too many webhook calls' },
});

// Public ticket lookup
export const lookupLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 lookups per 5 minutes
  message: {
    error: 'Too many lookup attempts',
    code: 'LOOKUP_RATE_LIMIT',
  },
});
```

- [ ] **VALIDATE**: Test rate limiting triggers correctly

### Step 1.4.2: Configure Helmet Security Headers
- [ ] **ACTION**: Create `src/middleware/security.middleware.ts`

```typescript
import helmet from 'helmet';
import cors from 'cors';
import { env } from '../config/env';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
    
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
});
```

- [ ] **VALIDATE**: Check security headers with curl

### Step 1.4.3: Create Error Handler
- [ ] **ACTION**: Create `src/middleware/errorHandler.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.userId,
  });

  // Handle known error types
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Resource already exists',
        code: 'DUPLICATE_ENTRY',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Resource not found',
        code: 'NOT_FOUND',
      });
    }
  }

  // Default error response
  const isDev = env.NODE_ENV === 'development';
  return res.status(500).json({
    error: isDev ? err.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(isDev && { stack: err.stack }),
  });
}
```

- [ ] **VALIDATE**: Test error responses for different error types

## 1.5 Logging System

### Step 1.5.1: Create Logger
- [ ] **ACTION**: Create `src/utils/logger.ts`

```typescript
import winston from 'winston';
import { env } from '../config/env';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} ${level}: ${message} ${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'vbs-ticketing' },
  transports: [
    new winston.transports.Console({
      format: env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    }),
  ],
});

// Add file transport in production
if (env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }));
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 5242880,
    maxFiles: 5,
  }));
}
```

- [ ] **ACTION**: Create `logs/` directory and add to `.gitignore`
- [ ] **VALIDATE**: Test logger output in console

**PHASE 1 COMPLETION CHECKLIST:**
- [ ] Environment validation working
- [ ] JWT authentication implemented
- [ ] Password hashing implemented
- [ ] Input validation with Zod working
- [ ] Rate limiting configured
- [ ] Security headers (Helmet) configured
- [ ] CORS properly configured
- [ ] Error handling middleware working
- [ ] Logging system operational
- [ ] All unit tests passing

**STOP POINT**: Do not proceed to Phase 2 until ALL Phase 1 items are checked and validated.

---

# PHASE 2: CODE STRUCTURE REORGANIZATION

## 2.1 Create Base Utilities

### Step 2.1.1: Create Prisma Client
- [ ] **ACTION**: Create `src/utils/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Log queries in development
prisma.$on('query' as never, (e: any) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  }
});

prisma.$on('error' as never, (e: any) => {
  logger.error('Prisma error:', e);
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
```

- [ ] **VALIDATE**: Test database connection

### Step 2.1.2: Create Code Generation Utilities
- [ ] **ACTION**: Create `src/utils/generators.ts`

```typescript
import crypto from 'crypto';

const AMBIGUOUS_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateTicketId(): string {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `VBS-${random}`;
}

export function generateAccessCode(length = 5): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += AMBIGUOUS_CHARS[Math.floor(Math.random() * AMBIGUOUS_CHARS.length)];
  }
  return code;
}

export function generateClientReference(length = 18): string {
  let ref = '';
  for (let i = 0; i < length; i++) {
    ref += AMBIGUOUS_CHARS[Math.floor(Math.random() * AMBIGUOUS_CHARS.length)];
  }
  return ref;
}

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
```

- [ ] **VALIDATE**: Test generation functions for uniqueness

### Step 2.1.3: Create Phone Utilities
- [ ] **ACTION**: Create `src/utils/phone.ts`

```typescript
/**
 * Normalize Ghana phone numbers to E.164 format without plus: 233XXXXXXXXX
 */
export function normalizeGhanaPhone(input: string | null | undefined): string {
  if (!input) return '';
  
  // Remove all non-digits
  let phone = String(input).replace(/\D+/g, '');
  
  // Remove leading zeros or country code prefixes
  if (phone.startsWith('00')) phone = phone.slice(2);
  if (phone.startsWith('+')) phone = phone.slice(1);
  
  // Already in correct format
  if (phone.startsWith('233') && phone.length === 12) {
    return phone;
  }
  
  // Local format: 0XXXXXXXXX -> 233XXXXXXXXX
  if (phone.startsWith('0') && phone.length === 10) {
    return `233${phone.slice(1)}`;
  }
  
  // Short format: XXXXXXXXX -> 233XXXXXXXXX
  if (phone.length === 9) {
    return `233${phone}`;
  }
  
  return phone;
}

export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizeGhanaPhone(phone);
  if (normalized.length !== 12) return phone;
  
  // Format: +233 XX XXX XXXX
  return `+${normalized.slice(0, 3)} ${normalized.slice(3, 5)} ${normalized.slice(5, 8)} ${normalized.slice(8)}`;
}

export function isValidGhanaPhone(phone: string): boolean {
  const normalized = normalizeGhanaPhone(phone);
  return normalized.length === 12 && normalized.startsWith('233');
}
```

- [ ] **VALIDATE**: Test with various phone formats

## 2.2 Create Service Layer

### Step 2.2.1: Create Ticket Service
- [ ] **ACTION**: Create `src/services/ticket.service.ts`

```typescript
import { prisma } from '../utils/prisma';
import { generateTicketId, generateAccessCode } from '../utils/generators';
import { normalizeGhanaPhone } from '../utils/phone';
import { AppError } from '../middleware/errorHandler.middleware';
import { CreateTicketInput } from '../validators/ticket.validator';
import { logger } from '../utils/logger';

export interface TicketWithDetails {
  id: string;
  ticketId: string;
  accessCode: string;
  name: string;
  phone: string;
  ticketType: string;
  status: string;
  amount: number;
  eventDate: string;
  eventTime: string;
  checkedIn: boolean;
  checkedInAt: Date | null;
  createdAt: Date;
}

export class TicketService {
  /**
   * Create a new ticket
   */
  async createTicket(input: CreateTicketInput): Promise<TicketWithDetails> {
    const phone = normalizeGhanaPhone(input.phone);
    
    // Generate unique ticket ID
    let ticketId: string;
    let attempts = 0;
    do {
      ticketId = generateTicketId();
      const exists = await prisma.payment.findUnique({ where: { ticketId } });
      if (!exists) break;
      attempts++;
    } while (attempts < 10);
    
    if (attempts >= 10) {
      throw new AppError(500, 'Failed to generate unique ticket ID', 'GENERATION_FAILED');
    }
    
    const accessCode = generateAccessCode();
    const amount = input.amount ?? (input.ticketType === 'VIP' ? 500 : 300);
    
    const ticket = await prisma.payment.create({
      data: {
        name: input.name,
        phone,
        ticketId,
        accessCode,
        ticketType: input.ticketType || 'REGULAR',
        amount,
        status: 'Paid',
        eventDate: 'Dec 27, 2025',
        eventTime: '09:00 AM',
        reference: 'manual_create',
      },
    });
    
    logger.info(`Ticket created: ${ticketId}`, { phone, type: input.ticketType });
    
    return this.mapToTicketDetails(ticket);
  }
  
  /**
   * Get ticket by ID
   */
  async getTicketById(ticketId: string): Promise<TicketWithDetails | null> {
    const ticket = await prisma.payment.findUnique({ where: { ticketId } });
    return ticket ? this.mapToTicketDetails(ticket) : null;
  }
  
  /**
   * Get tickets by phone number
   */
  async getTicketsByPhone(phone: string): Promise<TicketWithDetails[]> {
    const normalized = normalizeGhanaPhone(phone);
    const last9 = normalized.slice(-9);
    
    const tickets = await prisma.payment.findMany({
      where: {
        OR: [
          { phone: normalized },
          { phone: phone },
          { phone: { endsWith: last9 } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });
    
    return tickets.map(this.mapToTicketDetails);
  }
  
  /**
   * Lookup ticket by phone and access code
   */
  async lookupTicket(phone: string, accessCode: string): Promise<TicketWithDetails | null> {
    const normalized = normalizeGhanaPhone(phone);
    
    const ticket = await prisma.payment.findFirst({
      where: {
        phone: normalized,
        accessCode: accessCode.toUpperCase(),
      },
    });
    
    return ticket ? this.mapToTicketDetails(ticket) : null;
  }
  
  /**
   * Check in a ticket
   */
  async checkInTicket(ticketId: string, checkedInBy: string): Promise<TicketWithDetails> {
    const ticket = await prisma.payment.findUnique({ where: { ticketId } });
    
    if (!ticket) {
      throw new AppError(404, 'Ticket not found', 'TICKET_NOT_FOUND');
    }
    
    if (ticket.used) {
      throw new AppError(409, 'Ticket already used', 'TICKET_ALREADY_USED', {
        checkedInAt: ticket.verifiedAt,
        checkedInBy: ticket.verifiedBy,
      });
    }
    
    const updated = await prisma.payment.update({
      where: { ticketId },
      data: {
        used: true,
        verifiedAt: new Date(),
        verifiedBy: checkedInBy,
      },
    });
    
    logger.info(`Ticket checked in: ${ticketId}`, { checkedInBy });
    
    return this.mapToTicketDetails(updated);
  }
  
  /**
   * Get all tickets with pagination
   */
  async getAllTickets(page = 1, limit = 50, filter?: { status?: string; type?: string }) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.type) where.ticketType = filter.type;
    
    const [tickets, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);
    
    return {
      data: tickets.map(this.mapToTicketDetails),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  private mapToTicketDetails(ticket: any): TicketWithDetails {
    return {
      id: String(ticket.id),
      ticketId: ticket.ticketId,
      accessCode: ticket.accessCode || '',
      name: ticket.name,
      phone: ticket.phone,
      ticketType: ticket.ticketType,
      status: ticket.status,
      amount: ticket.amount,
      eventDate: ticket.eventDate,
      eventTime: ticket.eventTime,
      checkedIn: ticket.used,
      checkedInAt: ticket.verifiedAt,
      createdAt: ticket.createdAt,
    };
  }
}

export const ticketService = new TicketService();
```

- [ ] **VALIDATE**: Write integration tests for TicketService

### Step 2.2.2: Create Auth Service
- [ ] **ACTION**: Create `src/services/auth.service.ts`

```typescript
import { prisma } from '../utils/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { generateSecureToken } from '../utils/generators';
import { AppError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export class AuthService {
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    
    if (!user) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }
    
    if (user.status !== 'ACTIVE') {
      throw new AppError(403, 'Account is not active', 'ACCOUNT_INACTIVE');
    }
    
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }
    
    // Create session
    const sessionToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await prisma.adminSession.create({
      data: {
        token: sessionToken,
        adminId: user.id,
        expiresAt,
      },
    });
    
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    const refreshToken = generateRefreshToken(user.id);
    
    logger.info(`User logged in: ${email}`);
    
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
  
  async register(email: string, password: string, name: string, role = 'STAFF') {
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    
    if (existing) {
      throw new AppError(409, 'Email already registered', 'EMAIL_EXISTS');
    }
    
    const passwordHash = await hashPassword(password);
    
    const user = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        status: 'ACTIVE',
      },
    });
    
    logger.info(`User registered: ${email}`);
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
  
  async logout(userId: string, token?: string) {
    if (token) {
      await prisma.adminSession.deleteMany({
        where: { token },
      });
    } else {
      await prisma.adminSession.deleteMany({
        where: { adminId: userId },
      });
    }
    
    logger.info(`User logged out: ${userId}`);
  }
  
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Verify refresh token and issue new access token
    // Implementation depends on your refresh token strategy
    throw new AppError(501, 'Not implemented');
  }
}

export const authService = new AuthService();
```

- [ ] **VALIDATE**: Write integration tests for AuthService

## 2.3 Create Controllers

### Step 2.3.1: Create Ticket Controller
- [ ] **ACTION**: Create `src/controllers/ticket.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ticketService } from '../services/ticket.service';
import { CreateTicketInput, LookupTicketInput, VerifyTicketInput } from '../validators/ticket.validator';
import { logger } from '../utils/logger';

export class TicketController {
  async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as CreateTicketInput;
      const ticket = await ticketService.createTicket(input);
      
      res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.params;
      const ticket = await ticketService.getTicketById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({
          error: 'Ticket not found',
          code: 'TICKET_NOT_FOUND',
        });
      }
      
      res.json({ data: ticket });
    } catch (error) {
      next(error);
    }
  }
  
  async getTicketsByPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.params;
      const tickets = await ticketService.getTicketsByPhone(phone);
      
      res.json({
        count: tickets.length,
        data: tickets,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async lookupTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, accessCode } = req.body as LookupTicketInput;
      const ticket = await ticketService.lookupTicket(phone, accessCode);
      
      if (!ticket) {
        return res.status(404).json({
          error: 'Invalid phone number or access code',
          code: 'TICKET_NOT_FOUND',
        });
      }
      
      res.json({ data: ticket });
    } catch (error) {
      next(error);
    }
  }
  
  async checkInTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.body as VerifyTicketInput;
      const checkedInBy = req.user?.email || 'system';
      
      const ticket = await ticketService.checkInTicket(ticketId, checkedInBy);
      
      res.json({
        success: true,
        status: 'verified',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getAllTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const status = req.query.status as string;
      const type = req.query.type as string;
      
      const result = await ticketService.getAllTickets(page, limit, { status, type });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const ticketController = new TicketController();
```

- [ ] **VALIDATE**: Test controller endpoints

### Step 2.3.2: Create Auth Controller
- [ ] **ACTION**: Create `src/controllers/auth.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { LoginInput, RegisterInput } from '../validators/auth.validator';
import { env } from '../config/env';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as LoginInput;
      const result = await authService.login(email, password);
      
      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      
      res.json({
        success: true,
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role } = req.body as RegisterInput;
      const user = await authService.register(email, password, name, role);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      await authService.logout(req.userId!, refreshToken);
      
      res.clearCookie('refreshToken');
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
  
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ user: req.user });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
```

- [ ] **VALIDATE**: Test auth endpoints

## 2.4 Create Routes

### Step 2.4.1: Create Ticket Routes
- [ ] **ACTION**: Create `src/routes/ticket.routes.ts`

```typescript
import { Router } from 'express';
import { ticketController } from '../controllers/ticket.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { lookupLimiter } from '../middleware/rateLimit.middleware';
import {
  createTicketSchema,
  lookupTicketSchema,
  verifyTicketSchema,
} from '../validators/ticket.validator';

const router = Router();

// Public routes
router.get('/by-phone/:phone', lookupLimiter, ticketController.getTicketsByPhone);
router.post('/lookup', lookupLimiter, validate(lookupTicketSchema), ticketController.lookupTicket);
router.get('/:ticketId', ticketController.getTicket);

// Protected routes
router.use(requireAuth);

router.get('/', requireRole('ADMIN', 'SUPER_ADMIN'), ticketController.getAllTickets);
router.post('/', requireRole('ADMIN', 'SUPER_ADMIN'), validate(createTicketSchema), ticketController.createTicket);
router.post('/check-in', requireRole('ADMIN', 'SUPER_ADMIN', 'CHECKER'), validate(verifyTicketSchema), ticketController.checkInTicket);

export { router as ticketRouter };
```

- [ ] **VALIDATE**: Test all routes

### Step 2.4.2: Create Auth Routes
- [ ] **ACTION**: Create `src/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);

// Only super admins can create new users
router.post(
  '/register',
  requireAuth,
  requireRole('SUPER_ADMIN'),
  validate(registerSchema),
  authController.register
);

export { router as authRouter };
```

- [ ] **VALIDATE**: Test all auth routes

**PHASE 2 COMPLETION CHECKLIST:**
- [ ] All utility files created and tested
- [ ] Service layer implemented
- [ ] Controllers implemented
- [ ] Routes configured
- [ ] All imports working correctly
- [ ] TypeScript compiling without errors
- [ ] Integration tests passing

**STOP POINT**: Do not proceed to Phase 3 until ALL Phase 2 items are checked and validated.

---

# PHASE 3: DATABASE SCHEMA UPGRADE

## 3.1 Create New Schema

### Step 3.1.1: Backup Current Data
- [ ] **ACTION**: Export current data

```bash
# Export current data before migration
npx prisma db pull
pg_dump -U vbs -d vbs_ticketing > backup_$(date +%Y%m%d).sql
```

- [ ] **VALIDATE**: Backup file exists and is not empty

### Step 3.1.2: Create New Schema
- [ ] **ACTION**: Update `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ EVENTS ============
model Event {
  id          String   @id @default(cuid())
  name        String
  description String?
  date        DateTime
  endDate     DateTime?
  venue       String
  address     String?
  capacity    Int      @default(1000)
  isActive    Boolean  @default(true)
  
  tickets     Ticket[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([date])
  @@index([isActive])
}

// ============ CUSTOMERS ============
model Customer {
  id        String   @id @default(cuid())
  name      String
  phone     String   @unique
  email     String?
  
  tickets   Ticket[]
  payments  Payment[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([phone])
  @@index([email])
}

// ============ TICKETS ============
model Ticket {
  id          String       @id @default(cuid())
  ticketId    String       @unique  // VBS-XXXXXX format
  accessCode  String       @unique  // 5-char access code
  
  type        TicketType   @default(REGULAR)
  status      TicketStatus @default(PENDING)
  price       Int
  
  // Relations
  eventId     String
  event       Event        @relation(fields: [eventId], references: [id])
  customerId  String
  customer    Customer     @relation(fields: [customerId], references: [id])
  paymentId   String?
  payment     Payment?     @relation(fields: [paymentId], references: [id])
  
  // Check-in tracking
  checkedIn   Boolean      @default(false)
  checkedInAt DateTime?
  checkedInBy String?
  
  // Legacy fields for migration
  legacyId    Int?         @unique
  
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  @@index([eventId])
  @@index([customerId])
  @@index([status])
  @@index([checkedIn])
  @@index([ticketId])
}

// ============ PAYMENTS ============
model Payment {
  id              String        @id @default(cuid())
  amount          Int
  status          PaymentStatus @default(PENDING)
  
  // Payment provider info
  provider        String        @default("hubtel")
  providerRef     String?       // Transaction ID from provider
  clientReference String?       // Our reference sent to provider
  providerData    Json?         // Full response from provider
  
  // Relations
  customerId      String
  customer        Customer      @relation(fields: [customerId], references: [id])
  tickets         Ticket[]
  
  // Legacy
  legacyId        Int?          @unique
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([providerRef])
  @@index([clientReference])
  @@index([customerId])
  @@index([status])
}

// ============ ADMIN USERS ============
model AdminUser {
  id           String         @id @default(cuid())
  email        String         @unique
  passwordHash String
  name         String
  role         AdminRole      @default(STAFF)
  status       UserStatus     @default(ACTIVE)
  
  sessions     AdminSession[]
  activities   ActivityLog[]
  
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  
  @@index([email])
  @@index([role])
  @@index([status])
}

model AdminSession {
  id        String    @id @default(cuid())
  token     String    @unique
  adminId   String
  admin     AdminUser @relation(fields: [adminId], references: [id], onDelete: Cascade)
  
  userAgent String?
  ipAddress String?
  
  expiresAt DateTime
  createdAt DateTime  @default(now())
  
  @@index([token])
  @@index([adminId])
  @@index([expiresAt])
}

// ============ ACTIVITY LOG ============
model ActivityLog {
  id        String    @id @default(cuid())
  action    String    // e.g., "TICKET_CREATED", "CHECK_IN", "LOGIN"
  details   Json?
  
  adminId   String
  admin     AdminUser @relation(fields: [adminId], references: [id])
  
  ipAddress String?
  userAgent String?
  
  createdAt DateTime  @default(now())
  
  @@index([action])
  @@index([adminId])
  @@index([createdAt])
}

// ============ WEBHOOK EVENTS ============
model WebhookEvent {
  id            String   @id @default(cuid())
  provider      String   @default("hubtel")
  eventType     String
  payload       Json
  signature     String?
  
  processed     Boolean  @default(false)
  processedAt   DateTime?
  error         String?
  
  createdAt     DateTime @default(now())
  
  @@index([provider])
  @@index([processed])
  @@index([createdAt])
}

// ============ ENUMS ============
enum TicketType {
  REGULAR
  VIP
  EARLY_BIRD
  COMPLIMENTARY
}

enum TicketStatus {
  PENDING
  PAID
  USED
  CANCELLED
  REFUNDED
  EXPIRED
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  STAFF
  CHECKER
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

- [ ] **VALIDATE**: Schema syntax is valid with `npx prisma validate`

### Step 3.1.3: Create Migration
- [ ] **ACTION**: Create migration for new schema

```bash
npx prisma migrate dev --name modernize_schema
```

- [ ] **VALIDATE**: Migration files created in `prisma/migrations/`

### Step 3.1.4: Create Data Migration Script
- [ ] **ACTION**: Create `src/scripts/migrate-data.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateData() {
  console.log('Starting data migration...');
  
  // 1. Create default event
  const event = await prisma.event.upsert({
    where: { id: 'default-vbs-2025' },
    update: {},
    create: {
      id: 'default-vbs-2025',
      name: 'VBS 2025: Limitless',
      description: 'Vacation Bible School 2025',
      date: new Date('2025-12-27T09:00:00Z'),
      venue: 'International Community School Pakyi No. 2',
      capacity: 1000,
      isActive: true,
    },
  });
  console.log(`Event created/found: ${event.id}`);
  
  // 2. Migrate old Payment records to new structure
  // Note: This assumes the old 'Payment' model still exists
  // You may need to adjust based on your actual migration strategy
  
  console.log('Data migration completed!');
}

migrateData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **ACTION**: Run migration script
- [ ] **VALIDATE**: Data migrated correctly

**PHASE 3 COMPLETION CHECKLIST:**
- [ ] Current data backed up
- [ ] New schema created and validated
- [ ] Migration applied successfully
- [ ] Data migration script executed
- [ ] All existing data preserved
- [ ] Prisma client regenerated

**STOP POINT**: Do not proceed to Phase 4 until ALL Phase 3 items are checked and validated.

---

# PHASE 4: NEW SERVER IMPLEMENTATION

## 4.1 Create Main Server File

### Step 4.1.1: Create Server Entry Point
- [ ] **ACTION**: Create `src/server.ts`

```typescript
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './utils/prisma';
import { logger } from './utils/logger';

// Middleware
import { helmetMiddleware, corsMiddleware } from './middleware/security.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';

// Routes
import { authRouter } from './routes/auth.routes';
import { ticketRouter } from './routes/ticket.routes';
// import { paymentRouter } from './routes/payment.routes';
// import { webhookRouter } from './routes/webhook.routes';
// import { adminRouter } from './routes/admin.routes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function bootstrap() {
  const app = express();
  
  // Connect to database
  await connectDatabase();
  
  // Security middleware
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  
  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  
  // Rate limiting
  app.use('/api/', apiLimiter);
  
  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  });
  
  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/tickets', ticketRouter);
  // app.use('/api/payments', paymentRouter);
  // app.use('/api/webhooks', webhookRouter);
  // app.use('/api/admin', adminRouter);
  
  // Serve frontend (production)
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
  
  // Error handler (must be last)
  app.use(errorHandler);
  
  // Start server
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });
  
  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Server closed');
      process.exit(0);
    });
    
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
```

- [ ] **VALIDATE**: Server starts without errors

### Step 4.1.2: Test New Server
- [ ] **ACTION**: Run `npm run dev`
- [ ] **ACTION**: Test `/api/health` endpoint
- [ ] **ACTION**: Test authentication endpoints
- [ ] **ACTION**: Test ticket endpoints
- [ ] **VALIDATE**: All endpoints responding correctly

**PHASE 4 COMPLETION CHECKLIST:**
- [ ] Server file created
- [ ] All routes connected
- [ ] Middleware applied in correct order
- [ ] Graceful shutdown working
- [ ] All API endpoints functional
- [ ] Frontend still being served

---

# PHASE 5: FRONTEND MODERNIZATION

## 5.1 Setup Modern Frontend

### Step 5.1.1: Update Frontend Dependencies
- [ ] **ACTION**: Update `frontend/package.json`
- [ ] **ACTION**: Add TanStack Query for data fetching
- [ ] **ACTION**: Add React Hook Form + Zod for forms
- [ ] **VALIDATE**: `npm install` completes without errors

### Step 5.1.2: Create API Client
- [ ] **ACTION**: Create type-safe API client with proper error handling
- [ ] **VALIDATE**: API calls working correctly

### Step 5.1.3: Add Loading States
- [ ] **ACTION**: Add skeleton loaders
- [ ] **ACTION**: Add error boundaries
- [ ] **VALIDATE**: UI handles loading and error states gracefully

**PHASE 5 COMPLETION CHECKLIST:**
- [ ] Dependencies updated
- [ ] API client created
- [ ] Loading states implemented
- [ ] Error handling improved
- [ ] Accessibility improved

---

# PHASE 6: TESTING

## 6.1 Setup Testing Framework

### Step 6.1.1: Configure Vitest
- [ ] **ACTION**: Create `vitest.config.ts`
- [ ] **ACTION**: Create test utilities
- [ ] **VALIDATE**: `npm test` runs

### Step 6.1.2: Write Unit Tests
- [ ] **ACTION**: Test utilities (password, jwt, generators)
- [ ] **ACTION**: Test validators
- [ ] **ACTION**: Test services
- [ ] **VALIDATE**: Code coverage > 80%

### Step 6.1.3: Write Integration Tests
- [ ] **ACTION**: Test API endpoints
- [ ] **ACTION**: Test database operations
- [ ] **VALIDATE**: All integration tests passing

**PHASE 6 COMPLETION CHECKLIST:**
- [ ] Testing framework configured
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Code coverage meets threshold

---

# PHASE 7: DEVOPS & DEPLOYMENT

## 7.1 Docker Setup

### Step 7.1.1: Create Dockerfile
- [ ] **ACTION**: Create production Dockerfile
- [ ] **ACTION**: Create docker-compose.yml for local development
- [ ] **VALIDATE**: Container builds and runs

### Step 7.1.2: CI/CD Pipeline
- [ ] **ACTION**: Create `.github/workflows/ci.yml`
- [ ] **ACTION**: Add linting, testing, building steps
- [ ] **VALIDATE**: Pipeline runs on push

**PHASE 7 COMPLETION CHECKLIST:**
- [ ] Docker working locally
- [ ] CI/CD pipeline configured
- [ ] Automated tests running in CI
- [ ] Deployment workflow ready

---

# PHASE 8: NEW FEATURES

## 8.1 Feature Additions

### Step 8.1.1: Multi-Event Support
- [ ] **ACTION**: Implement event CRUD
- [ ] **ACTION**: Update ticket creation for events
- [ ] **VALIDATE**: Multiple events working

### Step 8.1.2: Email Notifications
- [ ] **ACTION**: Integrate email service (Resend/SendGrid)
- [ ] **ACTION**: Ticket confirmation emails
- [ ] **VALIDATE**: Emails sending correctly

### Step 8.1.3: Real-time Dashboard
- [ ] **ACTION**: Add WebSocket support
- [ ] **ACTION**: Real-time check-in updates
- [ ] **VALIDATE**: Dashboard updates in real-time

**PHASE 8 COMPLETION CHECKLIST:**
- [ ] Multi-event support working
- [ ] Email notifications working
- [ ] Real-time updates working

---

# 📋 FINAL VALIDATION CHECKLIST

Before considering the modernization complete:

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Security audit passed (no critical vulnerabilities)
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Old code removed
- [ ] Production deployment tested
- [ ] Rollback plan documented
- [ ] Team trained on new system

---

# 🚨 EMERGENCY ROLLBACK PROCEDURE

If critical issues are found:

1. **Stop**: Immediately stop all work
2. **Document**: Record the issue and its impact
3. **Rollback**: `git checkout v1.0.0-legacy`
4. **Restore**: Restore database backup if needed
5. **Deploy**: Redeploy legacy version
6. **Investigate**: Root cause analysis
7. **Fix**: Address issues before retrying

---

**Document Version:** 1.0.0  
**Last Updated:** December 2024  
**Author:** AI Assistant  
**Status:** DRAFT - Awaiting Implementation

