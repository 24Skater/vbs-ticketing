# API Reference

This document describes the REST API endpoints for VBS Ticketing.

## Base URL

```
http://localhost:5001/api
```

## Authentication

Most endpoints require authentication via JWT token.

### Headers

```
Authorization: Bearer <access_token>
```

### Obtaining Tokens

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 900,
    "user": {
      "id": "clx...",
      "email": "admin@example.com",
      "name": "Admin",
      "role": "ADMIN"
    }
  }
}
```

---

## Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login | No |
| POST | `/auth/register` | Register user | Admin |
| POST | `/auth/refresh` | Refresh token | No |
| POST | `/auth/logout` | Logout | Yes |
| GET | `/auth/me` | Get current user | Yes |

### Tickets

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/tickets` | List tickets | Yes |
| POST | `/tickets` | Create ticket | Yes |
| GET | `/tickets/:ticketId` | Get ticket | Yes |
| PATCH | `/tickets/:ticketId` | Update ticket | Yes |
| DELETE | `/tickets/:ticketId` | Delete ticket | Yes |
| POST | `/tickets/:ticketId/verify` | Check-in ticket | Yes |
| POST | `/tickets/bulk` | Bulk create | Yes |
| GET | `/tickets/lookup` | Public lookup | No |
| GET | `/tickets/:ticketId/pdf` | Download PDF | No |

### Events

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/events` | List events | No |
| POST | `/events` | Create event | Yes |
| GET | `/events/:id` | Get event | No |
| PATCH | `/events/:id` | Update event | Yes |
| DELETE | `/events/:id` | Delete event | Yes |

### Ticket Types

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/events/:eventId/ticket-types` | List types | No |
| POST | `/events/:eventId/ticket-types` | Create type | Yes |
| PATCH | `/events/:eventId/ticket-types/:typeId` | Update type | Yes |
| DELETE | `/events/:eventId/ticket-types/:typeId` | Delete type | Yes |

### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/initiate` | Start payment | No |
| GET | `/payments/status/:reference` | Check status | No |
| POST | `/payments/verify` | Verify payment | No |

### Configuration

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/config` | Get public config | No |
| GET | `/config/theme.css` | Get theme CSS | No |
| GET | `/config/payment-providers` | List providers | No |
| GET | `/config/admin` | Get full config | Admin |
| PATCH | `/config/admin` | Update config | Admin |

### Uploads

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/uploads` | Upload file | Yes |
| GET | `/uploads/:id` | Get file | No |
| DELETE | `/uploads/:id` | Delete file | Yes |

---

## Request/Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Pagination

List endpoints support pagination:

```http
GET /api/tickets?page=1&limit=20
```

Response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Detailed Endpoints

### POST /api/tickets

Create a new ticket.

**Request:**
```json
{
  "name": "John Doe",
  "phone": "+12125551234",
  "email": "john@example.com",
  "eventId": "clx...",
  "ticketTypeId": "clx...",
  "status": "PAID"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "ticketId": "VBS-ABC123",
    "accessCode": "XY7K2",
    "name": "John Doe",
    "phone": "+12125551234",
    "status": "PAID",
    "amount": 5000,
    "currency": "USD",
    "createdAt": "2024-12-28T10:00:00Z"
  }
}
```

### GET /api/tickets/lookup

Look up a ticket (public endpoint).

**Request:**
```http
GET /api/tickets/lookup?phone=+12125551234&accessCode=XY7K2
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ticketId": "VBS-ABC123",
    "name": "John Doe",
    "status": "PAID",
    "eventDate": "2024-12-30",
    "eventTime": "09:00 AM"
  }
}
```

### POST /api/tickets/:ticketId/verify

Check-in a ticket at the event.

**Request:**
```http
POST /api/tickets/VBS-ABC123/verify
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ticketId": "VBS-ABC123",
    "status": "USED",
    "verifiedAt": "2024-12-30T09:15:00Z"
  },
  "message": "Ticket verified successfully"
}
```

### PATCH /api/config/admin

Update site configuration.

**Request:**
```json
{
  "orgName": "My Church",
  "primaryColor": "#4f46e5",
  "currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "data": { ... }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `TOKEN_EXPIRED` | Token has expired |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input data |
| `TICKET_ALREADY_USED` | Ticket already checked in |
| `PAYMENT_FAILED` | Payment processing failed |
| `RATE_LIMIT` | Too many requests |

---

## Webhooks

### Stripe Webhook

```
POST /api/webhooks/stripe
```

Configure in Stripe Dashboard with signing secret.

### Hubtel Webhook

```
POST /api/webhooks/hubtel
```

Configure callback URL in Hubtel settings.

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/auth/login` | 5/minute |
| `/tickets/*` | 100/minute |
| General | 200/minute |

Exceeded limits return `429 Too Many Requests`.
