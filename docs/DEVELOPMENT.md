# VBS Ticketing System - Development Guide

This guide covers setting up a development environment and working with the codebase.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [Testing](#testing)
- [Database](#database)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 20+ | Runtime |
| npm | 10+ | Package manager |
| PostgreSQL | 14+ | Database |
| Git | Latest | Version control |

### Optional

| Software | Purpose |
|----------|---------|
| Docker Desktop | Containerized development |
| VS Code | Recommended IDE |
| Postman | API testing |

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-azuretools.vscode-docker"
  ]
}
```

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vbs-ticketing.git
cd vbs-ticketing
```

### 2. Switch to Development Branch

```bash
git checkout modernization-v2
```

### 3. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 4. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit with your settings
code .env  # or use any text editor
```

**Required environment variables:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vbs_ticketing"

# JWT (generate a secure random string)
JWT_SECRET="your-super-secure-secret-at-least-32-characters"

# Hubtel (get from Hubtel dashboard)
HUBTEL_API_ID="your-api-id"
HUBTEL_API_KEY="your-api-key"
HUBTEL_POS_SALES_ID="your-pos-sales-id"
HUBTEL_CALLBACK_URL="http://localhost:5000/api/webhooks/hubtel"
```

### 5. Set Up Database

**Option A: Using Docker (Recommended)**

```bash
# Start PostgreSQL in Docker
npm run docker:dev

# Database will be available at localhost:5432
# Adminer GUI at localhost:8080
```

**Option B: Local PostgreSQL**

```bash
# Create database
createdb vbs_ticketing

# Or using psql
psql -c "CREATE DATABASE vbs_ticketing;"
```

### 6. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 7. Start Development Server

```bash
# Start backend with hot reload
npm run dev

# In another terminal, start frontend
cd frontend && npm run dev
```

**Access points:**
- Backend API: http://localhost:5000
- Frontend: http://localhost:5173
- API Health Check: http://localhost:5000/api/health

---

## Development Workflow

### Branch Strategy

```
main                 # Production-ready code (protected)
├── modernization-v2 # Current development branch
    ├── feature/*    # Feature branches
    ├── fix/*        # Bug fix branches
    └── docs/*       # Documentation branches
```

### Creating a Feature Branch

```bash
# From modernization-v2
git checkout modernization-v2
git pull origin modernization-v2
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your code changes
2. Run type checking: `npm run typecheck`
3. Run tests: `npm test`
4. Commit with conventional commits:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in ticket creation"
git commit -m "docs: update API documentation"
```

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

### Submitting Changes

```bash
git push origin feature/your-feature-name
# Create a Pull Request to modernization-v2
```

---

## Project Structure

```
src/
├── config/
│   └── env.ts              # Environment validation
├── controllers/
│   ├── auth.controller.ts  # Authentication handlers
│   ├── ticket.controller.ts
│   ├── event.controller.ts
│   ├── payment.controller.ts
│   ├── analytics.controller.ts
│   └── webhook.controller.ts
├── middleware/
│   ├── auth.middleware.ts     # JWT verification
│   ├── validate.middleware.ts # Zod validation
│   ├── rateLimit.middleware.ts
│   ├── security.middleware.ts
│   └── errorHandler.middleware.ts
├── routes/
│   ├── index.ts            # Route aggregator
│   ├── auth.routes.ts
│   ├── ticket.routes.ts
│   ├── event.routes.ts
│   ├── payment.routes.ts
│   ├── analytics.routes.ts
│   └── webhook.routes.ts
├── services/
│   ├── auth.service.ts     # Business logic
│   ├── ticket.service.ts
│   ├── event.service.ts
│   ├── hubtel.service.ts
│   ├── pdf.service.ts
│   └── analytics.service.ts
├── utils/
│   ├── prisma.ts           # Database client
│   ├── logger.ts           # Winston logger
│   ├── jwt.ts              # Token utilities
│   ├── password.ts         # Bcrypt utilities
│   ├── phone.ts            # Ghana phone utilities
│   └── generators.ts       # ID generators
├── validators/
│   ├── auth.validator.ts   # Zod schemas
│   ├── ticket.validator.ts
│   └── payment.validator.ts
├── types/
│   └── index.ts            # TypeScript types
└── server.ts               # Application entry
```

### Key Files

| File | Purpose |
|------|---------|
| `src/server.ts` | Express app setup |
| `src/config/env.ts` | Environment validation |
| `prisma/schema.prisma` | Database schema |
| `tsconfig.json` | TypeScript configuration |
| `vitest.config.ts` | Test configuration |

---

## Code Style

### TypeScript Guidelines

```typescript
// Use explicit types for function parameters and returns
function createTicket(data: CreateTicketData): Promise<ServiceResult<TicketData>> {
  // ...
}

// Use interface for object shapes
interface TicketData {
  ticketId: string;
  name: string;
  status: TicketStatus;
}

// Use type for unions and primitives
type TicketStatus = 'PENDING' | 'PAID' | 'USED' | 'CANCELLED';

// Use const for constants
const MAX_TICKETS_PER_REQUEST = 100;
```

### File Naming

- Files: `kebab-case.ts` (e.g., `ticket.service.ts`)
- Components: `PascalCase.jsx` (e.g., `TicketForm.jsx`)
- Types/Interfaces: `PascalCase`
- Functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`

### Import Order

```typescript
// 1. Node modules
import express from 'express';
import { z } from 'zod';

// 2. Local modules (services, utils)
import { prisma } from '../utils/prisma.js';
import * as ticketService from '../services/ticket.service.js';

// 3. Types
import type { Request, Response } from 'express';
import type { TicketData } from '../types/index.js';
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm test -- --watch

# Run specific file
npm test -- src/utils/__tests__/password.test.ts

# Run with coverage
npm run test:coverage
```

### Writing Tests

```typescript
// src/services/__tests__/ticket.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ticketService from '../ticket.service';

describe('ticketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should create a ticket with valid data', async () => {
      const data = {
        name: 'John Doe',
        phone: '0241234567',
      };

      const result = await ticketService.createTicket(data);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('ticketId');
    });

    it('should reject invalid phone number', async () => {
      const data = {
        name: 'John Doe',
        phone: 'invalid',
      };

      const result = await ticketService.createTicket(data);

      expect(result.success).toBe(false);
      expect(result.error).toContain('phone');
    });
  });
});
```

### Test Structure

```
src/
├── __tests__/
│   ├── setup.ts           # Global test setup
│   ├── mocks/
│   │   └── prisma.mock.ts # Prisma mock
│   └── helpers/
│       └── index.ts       # Test utilities
├── services/__tests__/
│   └── ticket.service.test.ts
├── middleware/__tests__/
│   └── auth.test.ts
└── utils/__tests__/
    ├── password.test.ts
    └── phone.test.ts
```

---

## Database

### Prisma Commands

```bash
# Generate client after schema changes
npm run db:generate

# Create migration
npm run db:migrate:dev

# Apply migrations
npm run db:migrate

# Reset database (careful!)
npx prisma migrate reset

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

### Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate:dev -- --name your_migration_name`
3. Run `npm run db:generate`
4. Update affected services/types

### Common Prisma Operations

```typescript
import { prisma } from '../utils/prisma.js';

// Find one
const ticket = await prisma.ticket.findUnique({
  where: { ticketId: 'VBS-123456' },
  include: { event: true },
});

// Find many with filters
const tickets = await prisma.ticket.findMany({
  where: { status: 'PAID' },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: 0,
});

// Create
const newTicket = await prisma.ticket.create({
  data: { name, phone, ticketId, accessCode },
});

// Update
const updated = await prisma.ticket.update({
  where: { id },
  data: { status: 'USED' },
});

// Transaction
await prisma.$transaction([
  prisma.ticket.update({ ... }),
  prisma.payment.create({ ... }),
]);
```

---

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

**Prisma client out of sync:**
```bash
npm run db:generate
```

**Module not found errors:**
```bash
# Ensure .js extensions in imports for ESM
import { prisma } from '../utils/prisma.js';  # ✓
import { prisma } from '../utils/prisma';     # ✗
```

**Database connection failed:**
```bash
# Check PostgreSQL is running
docker ps  # if using Docker

# Check connection string
echo $DATABASE_URL
```

**TypeScript errors in tests:**
Tests are excluded from `tsconfig.json` and handled by Vitest.

### Getting Help

1. Check existing issues on GitHub
2. Review the documentation
3. Ask in team chat
4. Create a new issue with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details

---

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL URL | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `30d` |
| `HUBTEL_API_ID` | Hubtel API ID | Required |
| `HUBTEL_API_KEY` | Hubtel API Key | Required |
| `HUBTEL_POS_SALES_ID` | Hubtel POS ID | Required |
| `HUBTEL_CALLBACK_URL` | Payment callback URL | Required |
| `LOG_LEVEL` | Winston log level | `info` |
| `CORS_ORIGINS` | Allowed origins | `*` |

---

## Next Steps

- Read the [API Documentation](API.md)
- Review the [Architecture Guide](ARCHITECTURE.md)
- Check the [Deployment Guide](DEPLOYMENT.md)

