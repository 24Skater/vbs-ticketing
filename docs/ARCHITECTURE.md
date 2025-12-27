# VBS Ticketing System - Architecture Documentation

This document describes the system architecture, design patterns, and technical decisions.

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Backend Architecture](#backend-architecture)
- [Database Design](#database-design)
- [Authentication & Authorization](#authentication--authorization)
- [Payment Integration](#payment-integration)
- [Frontend Architecture](#frontend-architecture)
- [Security Architecture](#security-architecture)
- [API Design](#api-design)
- [Error Handling](#error-handling)
- [Logging & Monitoring](#logging--monitoring)

---

## System Overview

The VBS Ticketing System is a full-stack application for managing event tickets with mobile money payment integration. It follows a monolithic architecture with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│  React SPA          │  Admin Panel         │  Mobile (PWA)         │
│  (Public Portal)    │  (Staff Access)      │  (Check-in App)       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY                                │
├─────────────────────────────────────────────────────────────────────┤
│  Nginx Reverse Proxy  │  SSL Termination  │  Rate Limiting         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│                      Express.js + TypeScript                         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │Middleware│  │  Routes  │  │Controllers│  │ Services │            │
│  │  Stack   │──│ Mapping  │──│ Handlers  │──│  Logic   │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│       │                                          │                   │
│       ▼                                          ▼                   │
│  ┌──────────┐                            ┌──────────────┐           │
│  │Validators│                            │   Utilities  │           │
│  │  (Zod)   │                            │(JWT,Bcrypt..│           │
│  └──────────┘                            └──────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
            ┌───────────┐  ┌───────────┐  ┌───────────┐
            │PostgreSQL │  │  Hubtel   │  │  PDFKit   │
            │ (Prisma)  │  │   API     │  │  QRCode   │
            └───────────┘  └───────────┘  └───────────┘
```

---

## Technology Stack

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 20+ |
| TypeScript | Type safety | 5.x |
| Express.js | Web framework | 4.x |
| Prisma | ORM & migrations | 5.x |
| PostgreSQL | Database | 14+ |
| Zod | Validation | 3.x |
| JWT | Authentication | - |
| bcryptjs | Password hashing | - |
| Winston | Logging | 3.x |
| Helmet | Security headers | 7.x |

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI framework | 18.x |
| Vite | Build tool | 5.x |
| TanStack Query | Data fetching | 5.x |
| React Hook Form | Form handling | 7.x |
| Tailwind CSS | Styling | 4.x |
| Axios | HTTP client | 1.x |

### DevOps

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| GitHub Actions | CI/CD |
| Nginx | Reverse proxy |
| PM2 | Process manager |

---

## Backend Architecture

### Layered Architecture

The backend follows a clean layered architecture:

```
Request → Middleware → Route → Controller → Service → Database
                                    ↓
                              Utilities/Types
```

#### 1. Middleware Layer

Processes requests before they reach controllers:

```typescript
// Middleware execution order
app.use(helmet());           // Security headers
app.use(cors());             // CORS handling
app.use(express.json());     // Body parsing
app.use(requestLogger);      // Request logging
app.use(rateLimiter);        // Rate limiting
app.use(authenticate);       // JWT verification
```

**Key Middleware:**

| File | Purpose |
|------|---------|
| `auth.middleware.ts` | JWT verification, role checking |
| `validate.middleware.ts` | Zod schema validation |
| `rateLimit.middleware.ts` | Request rate limiting |
| `security.middleware.ts` | Helmet, CORS |
| `errorHandler.middleware.ts` | Centralized error handling |

#### 2. Route Layer

Maps HTTP endpoints to controllers:

```typescript
// routes/ticket.routes.ts
router.get('/', requireAuth, ticketController.list);
router.post('/', requireAuth, validate(schema), ticketController.create);
router.get('/:id', optionalAuth, ticketController.get);
```

#### 3. Controller Layer

Handles HTTP request/response:

```typescript
// controllers/ticket.controller.ts
export const createTicket = asyncHandler(async (req, res) => {
  const data = req.body;
  const result = await ticketService.createTicket(data);
  
  if (!result.success) {
    throw Errors.badRequest(result.error);
  }
  
  res.status(201).json({ success: true, data: result.data });
});
```

**Responsibilities:**
- Extract request data
- Call service methods
- Format responses
- Handle HTTP-specific concerns

#### 4. Service Layer

Contains business logic:

```typescript
// services/ticket.service.ts
export async function createTicket(data: CreateTicketData): Promise<ServiceResult<TicketData>> {
  // Validate phone
  const normalizedPhone = normalizePhone(data.phone);
  if (!isValidGhanaPhone(normalizedPhone)) {
    return { success: false, error: 'Invalid phone number' };
  }
  
  // Generate IDs
  const ticketId = await generateUniqueTicketId();
  const accessCode = await generateUniqueAccessCode();
  
  // Create in database
  const ticket = await prisma.ticket.create({
    data: { ...data, ticketId, accessCode, phone: normalizedPhone }
  });
  
  return { success: true, data: toTicketData(ticket) };
}
```

**Responsibilities:**
- Business logic
- Data validation
- Database operations
- External service calls

#### 5. Utility Layer

Reusable helper functions:

| File | Purpose |
|------|---------|
| `prisma.ts` | Database client singleton |
| `jwt.ts` | Token generation/verification |
| `password.ts` | Bcrypt hashing |
| `phone.ts` | Ghana phone utilities |
| `generators.ts` | ID generation |
| `logger.ts` | Winston logging |

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │     │    Event    │     │ TicketType  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ email       │     │ name        │◄────│ eventId     │
│ passwordHash│     │ slug        │     │ name        │
│ name        │     │ venue       │     │ price       │
│ role        │     │ eventDate   │     │ quantity    │
│ isActive    │     │ isActive    │     │ sold        │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │   Ticket    │◄───────────┘
       │            ├─────────────┤
       └───────────►│ id          │
       (verifiedBy) │ ticketId    │
                    │ accessCode  │
                    │ eventId     │
                    │ ticketTypeId│
                    │ name        │
                    │ phone       │
                    │ status      │
                    │ amount      │
                    │ used        │
                    │ verifiedAt  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Payment   │
                    ├─────────────┤
                    │ id          │
                    │ ticketId    │
                    │ amount      │
                    │ status      │
                    │ provider    │
                    │ reference   │
                    │ channel     │
                    └─────────────┘
```

### Key Design Decisions

1. **Ticket ID Format**: `VBS-XXXXXX` (human-readable, unique)
2. **Access Code**: 5-character alphanumeric (quick lookup)
3. **Phone Numbers**: Stored in E.164 format (`233XXXXXXXXX`)
4. **Amounts**: Stored in pesewas (smallest currency unit)
5. **Soft Deletes**: Status changes instead of actual deletion
6. **Audit Trail**: `createdAt`, `updatedAt`, `verifiedAt` timestamps

### Indexes

```prisma
model Ticket {
  @@index([ticketId])
  @@index([accessCode])
  @@index([phone])
  @@index([eventId])
  @@index([status])
}
```

---

## Authentication & Authorization

### JWT Flow

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  Client  │                    │  Server  │                    │ Database │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                               │                               │
     │  POST /auth/login             │                               │
     │  {email, password}            │                               │
     ├──────────────────────────────►│                               │
     │                               │  Find user by email           │
     │                               ├──────────────────────────────►│
     │                               │◄──────────────────────────────┤
     │                               │  Verify password (bcrypt)     │
     │                               │  Generate JWT tokens          │
     │                               │  Store refresh token          │
     │                               ├──────────────────────────────►│
     │  {accessToken, refreshToken}  │                               │
     │◄──────────────────────────────┤                               │
     │                               │                               │
     │  GET /api/tickets             │                               │
     │  Authorization: Bearer xxx    │                               │
     ├──────────────────────────────►│                               │
     │                               │  Verify JWT                   │
     │                               │  Extract user info            │
     │  {tickets: [...]}             │                               │
     │◄──────────────────────────────┤                               │
```

### Token Structure

```typescript
// Access Token Payload
{
  userId: "clx123...",
  email: "admin@example.com",
  role: "ADMIN",
  iat: 1234567890,
  exp: 1234567890 + 7d
}

// Refresh Token - stored in database
// Longer expiry (30 days), used to get new access tokens
```

### Role-Based Access Control

```typescript
// Roles hierarchy
SUPER_ADMIN > ADMIN > STAFF > CHECKER

// Middleware usage
router.get('/stats', requireAuth, requireRole('STAFF', 'ADMIN', 'SUPER_ADMIN'));
router.delete('/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'));
```

---

## Payment Integration

### Hubtel Payment Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  Server  │     │  Hubtel  │     │  Mobile  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  Initiate      │                │                │
     │  Payment       │                │                │
     ├───────────────►│                │                │
     │                │  POST /receive │                │
     │                │  /mobilemoney  │                │
     │                ├───────────────►│                │
     │                │                │  USSD Prompt   │
     │                │                ├───────────────►│
     │                │  {reference}   │                │
     │                │◄───────────────┤                │
     │  Pending...    │                │                │
     │◄───────────────┤                │                │
     │                │                │  User Approves │
     │                │                │◄───────────────┤
     │                │  Webhook       │                │
     │                │  /api/webhooks │                │
     │                │  /hubtel       │                │
     │                │◄───────────────┤                │
     │                │  Update ticket │                │
     │                │  status        │                │
```

### Payment Status Flow

```
PENDING ──► SUCCESS ──► (REFUNDED)
    │
    └─────► FAILED
    │
    └─────► CANCELLED
```

---

## Frontend Architecture

### Component Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Alert.jsx
│   │   └── TicketCard.jsx   # Domain components
│   ├── hooks/
│   │   └── useTickets.js    # React Query hooks
│   ├── lib/
│   │   ├── api.js           # Axios client
│   │   └── queryClient.js   # TanStack Query config
│   ├── App.jsx
│   └── main.jsx
```

### Data Fetching Pattern

```jsx
// hooks/useTickets.js
export function useTicketLookup() {
  return useMutation({
    mutationFn: ({ phone, accessCode }) => 
      api.post('/tickets/lookup', { phone, accessCode }),
  });
}

// Component usage
function TicketForm() {
  const lookup = useTicketLookup();
  
  const handleSubmit = (data) => {
    lookup.mutate(data, {
      onSuccess: (ticket) => setTicket(ticket),
      onError: (error) => setError(error.message),
    });
  };
}
```

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Network                                             │
│ - HTTPS/TLS encryption                                       │
│ - Firewall rules (ports 80, 443, 22 only)                   │
│ - DDoS protection (Cloudflare/AWS Shield)                   │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: Application Gateway                                 │
│ - Nginx rate limiting                                        │
│ - Request size limits                                        │
│ - Header validation                                          │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: Express Middleware                                  │
│ - Helmet security headers                                    │
│ - CORS restrictions                                          │
│ - express-rate-limit                                         │
│ - JWT verification                                           │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: Input Validation                                    │
│ - Zod schema validation                                      │
│ - Phone number sanitization                                  │
│ - SQL injection protection (Prisma)                          │
├─────────────────────────────────────────────────────────────┤
│ Layer 5: Data Protection                                     │
│ - Bcrypt password hashing (12 rounds)                        │
│ - JWT token encryption                                       │
│ - Sensitive data not logged                                  │
└─────────────────────────────────────────────────────────────┘
```

### Security Headers (Helmet)

```typescript
// Applied headers
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000",
  "Content-Security-Policy": "default-src 'self'"
}
```

---

## API Design

### RESTful Conventions

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/api/tickets` | List all |
| GET | `/api/tickets/:id` | Get one |
| POST | `/api/tickets` | Create |
| PATCH | `/api/tickets/:id` | Update |
| DELETE | `/api/tickets/:id` | Delete |

### Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}

// Error
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}

// Paginated
{
  "success": true,
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

## Error Handling

### Error Flow

```typescript
// AppError class
class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
}

// Error handler middleware
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    // Operational error - send to client
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code
    });
  }
  
  // Programming error - log and send generic message
  logger.error('Unexpected error', { error: err });
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Auth required |
| `FORBIDDEN` | 403 | Permission denied |
| `RATE_LIMITED` | 429 | Too many requests |

---

## Logging & Monitoring

### Winston Logger Configuration

```typescript
// Log levels
{
  error: 0,   // Errors that need immediate attention
  warn: 1,    // Warnings
  info: 2,    // General information
  http: 3,    // HTTP requests
  debug: 4    // Debug information
}

// Log format (production)
{
  timestamp: "2025-01-01T12:00:00.000Z",
  level: "info",
  message: "Ticket created",
  ticketId: "VBS-123456",
  userId: "clx..."
}
```

### Key Log Points

```typescript
// Authentication
logger.info('User logged in', { userId, email });
logger.warn('Failed login attempt', { email, ip });

// Tickets
logger.info('Ticket created', { ticketId, phone });
logger.info('Ticket verified', { ticketId, verifiedBy });

// Payments
logger.info('Payment initiated', { reference, amount });
logger.info('Payment completed', { reference, status });

// Errors
logger.error('Database error', { error, query });
```

### Health Check Endpoint

```typescript
GET /api/health

{
  "status": "ok",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "uptime": 3600,
  "version": "2.0.0"
}
```

---

## Performance Considerations

### Database Optimization

- Connection pooling via Prisma
- Indexed columns for frequent queries
- Pagination for list endpoints
- Select only needed fields

### Caching Strategy

- Static assets: Long cache headers
- API responses: No cache (real-time data)
- Frontend: React Query cache (stale-while-revalidate)

### Scalability

- Stateless API (horizontal scaling)
- Database connection limits
- Rate limiting per IP
- PM2 cluster mode for multi-core

