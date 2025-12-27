# VBS Ticketing System - API Documentation

Base URL: `http://localhost:5000/api`

## Table of Contents

- [Authentication](#authentication)
- [Tickets](#tickets)
- [Events](#events)
- [Payments](#payments)
- [Analytics](#analytics)
- [Webhooks](#webhooks)
- [Error Handling](#error-handling)

---

## Authentication

### Login

Authenticate a user and receive access tokens.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123...",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

### Register

Create a new user account (Admin only).

```http
POST /api/auth/register
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "staff@example.com",
  "password": "SecurePass123!",
  "name": "Staff Member",
  "role": "STAFF"
}
```

### Refresh Token

Get a new access token using refresh token.

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbG..."
}
```

### Logout

Invalidate the current session.

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

---

## Tickets

### Lookup Ticket (Public)

Find a ticket by phone number and access code.

```http
POST /api/tickets/lookup
Content-Type: application/json

{
  "phone": "0241234567",
  "accessCode": "ABC12"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ticketId": "VBS-A1B2C3",
    "accessCode": "ABC12",
    "name": "John Doe",
    "phone": "233241234567",
    "status": "PAID",
    "eventDate": "2025-07-05",
    "eventTime": "09:00 AM"
  }
}
```

### Get Tickets by Phone (Public)

```http
GET /api/tickets/phone/0241234567
```

### Create Ticket

```http
POST /api/tickets
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "0241234567",
  "ticketType": "REGULAR",
  "amount": 5000,
  "eventId": "clx123..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ticketId": "VBS-X7Y8Z9",
    "accessCode": "XY789",
    "name": "John Doe",
    "phone": "233241234567",
    "status": "PENDING",
    "amount": 5000
  },
  "message": "Ticket created successfully"
}
```

### Search Tickets

```http
GET /api/tickets?search=john&status=PAID&page=1&limit=20
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name, phone, or ticket ID |
| `status` | string | Filter by status (PENDING, PAID, USED, CANCELLED) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 50, max: 100) |

### Get Single Ticket

```http
GET /api/tickets/VBS-X7Y8Z9
```

### Verify/Check-in Ticket

```http
POST /api/tickets/VBS-X7Y8Z9/verify
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket verified successfully",
  "data": {
    "ticketId": "VBS-X7Y8Z9",
    "status": "USED",
    "verifiedAt": "2025-07-05T10:30:00.000Z"
  }
}
```

### Update Ticket Status

```http
PATCH /api/tickets/VBS-X7Y8Z9/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "CANCELLED"
}
```

### Download Ticket PDF

```http
GET /api/tickets/VBS-X7Y8Z9/pdf
```

Returns a PDF file with the ticket information and QR code.

### Bulk Create Tickets

```http
POST /api/tickets/bulk
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "tickets": [
    { "name": "John Doe", "phone": "0241234567" },
    { "name": "Jane Doe", "phone": "0241234568" }
  ]
}
```

### Bulk Verify Tickets

```http
POST /api/tickets/bulk/verify
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "ticketIds": ["VBS-A1B2C3", "VBS-D4E5F6"]
}
```

### Bulk Cancel Tickets

```http
POST /api/tickets/bulk/cancel
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "ticketIds": ["VBS-A1B2C3", "VBS-D4E5F6"]
}
```

### Get Ticket Statistics

```http
GET /api/tickets/stats
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 500,
    "paid": 450,
    "pending": 30,
    "checkedIn": 200,
    "revenue": 2250000
  }
}
```

---

## Events

### List Events (Public)

```http
GET /api/events?activeOnly=true&upcoming=true
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `activeOnly` | boolean | Only active events (default: true) |
| `upcoming` | boolean | Only future events |
| `page` | number | Page number |
| `limit` | number | Items per page |

### Get Event (Public)

```http
GET /api/events/vbs-2025
```

Can use event ID or slug.

### Create Event

```http
POST /api/events
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "VBS 2025",
  "slug": "vbs-2025",
  "description": "Vacation Bible School 2025",
  "venue": "Main Auditorium",
  "eventDate": "2025-07-05",
  "eventTime": "09:00 AM"
}
```

### Update Event

```http
PATCH /api/events/clx123...
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "venue": "New Location",
  "eventTime": "10:00 AM"
}
```

### Delete Event

Soft deletes (deactivates) the event.

```http
DELETE /api/events/clx123...
Authorization: Bearer <access_token>
```

### Get Event Statistics

```http
GET /api/events/clx123.../stats
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTickets": 500,
    "soldTickets": 450,
    "usedTickets": 200,
    "revenue": 2250000,
    "byType": [
      { "name": "Regular", "quantity": 400, "sold": 380, "revenue": 1900000 },
      { "name": "VIP", "quantity": 100, "sold": 70, "revenue": 350000 }
    ]
  }
}
```

### Create Ticket Type

```http
POST /api/events/clx123.../ticket-types
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "VIP",
  "price": 10000,
  "quantity": 100,
  "description": "VIP seating with refreshments"
}
```

### Update Ticket Type

```http
PATCH /api/events/clx123.../ticket-types/clx456...
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "price": 12000,
  "quantity": 150
}
```

---

## Payments

### Initiate Payment

Start a mobile money payment via Hubtel.

```http
POST /api/payments/initiate
Content-Type: application/json

{
  "ticketId": "VBS-X7Y8Z9",
  "phone": "0241234567",
  "channel": "mtn-gh"
}
```

**Channels:**
- `mtn-gh` - MTN Mobile Money
- `vodafone-gh` - Vodafone Cash
- `tigo-gh` - AirtelTigo Money

**Response:**
```json
{
  "success": true,
  "data": {
    "reference": "VBS-PAY-123456",
    "status": "pending",
    "message": "Please approve the payment on your phone"
  }
}
```

### Check Payment Status

```http
GET /api/payments/status/VBS-PAY-123456
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reference": "VBS-PAY-123456",
    "status": "SUCCESS",
    "amount": 5000,
    "paidAt": "2025-07-05T10:30:00.000Z"
  }
}
```

---

## Analytics

All analytics endpoints require authentication with STAFF role or higher.

### Dashboard Statistics

```http
GET /api/analytics/dashboard
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": {
      "total": 500,
      "paid": 450,
      "used": 200,
      "pending": 30,
      "cancelled": 20
    },
    "revenue": {
      "total": 2250000,
      "today": 150000,
      "thisWeek": 500000,
      "thisMonth": 1500000
    },
    "events": {
      "total": 5,
      "active": 3,
      "upcoming": 2
    },
    "recentActivity": [...]
  }
}
```

### Sales Report

```http
GET /api/analytics/sales?startDate=2025-01-01&endDate=2025-12-31&eventId=clx123...
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSales": 450,
      "totalRevenue": 2250000,
      "averageTicketPrice": 5000
    },
    "byDate": [
      { "date": "2025-07-01", "count": 50, "revenue": 250000 },
      { "date": "2025-07-02", "count": 75, "revenue": 375000 }
    ],
    "byPaymentMethod": [
      { "method": "mtn-gh", "count": 300, "revenue": 1500000 },
      { "method": "vodafone-gh", "count": 150, "revenue": 750000 }
    ]
  }
}
```

### Check-in Statistics

```http
GET /api/analytics/check-ins?eventId=clx123...
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 450,
    "checkedIn": 200,
    "pending": 250,
    "percentage": 44,
    "byHour": [
      { "hour": "09:00", "count": 50 },
      { "hour": "10:00", "count": 80 }
    ]
  }
}
```

### Export Tickets

```http
GET /api/analytics/export/tickets?format=csv&eventId=clx123...
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | `json` or `csv` (default: json) |
| `eventId` | string | Filter by event |
| `status` | string | Filter by status |
| `startDate` | date | Filter by creation date |
| `endDate` | date | Filter by creation date |

---

## Webhooks

### Hubtel Payment Callback

```http
POST /api/webhooks/hubtel
Content-Type: application/json

{
  "ResponseCode": "0000",
  "Status": "Success",
  "Data": {
    "ClientReference": "VBS-PAY-123456",
    "TransactionId": "1234567890",
    "Amount": 50.00,
    "CustomerMsisdn": "233241234567"
  }
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Permission denied |
| `DUPLICATE` | Resource already exists |
| `RATE_LIMIT` | Too many requests |
| `PAYMENT_FAILED` | Payment processing failed |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/api/auth/login` | 5 requests per 15 minutes |
| `/api/tickets/lookup` | 10 requests per minute |
| `/api/payments/initiate` | 5 requests per minute |
| General API | 100 requests per 15 minutes |

---

## Authentication Headers

Include the access token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `SUPER_ADMIN` | System administrator | Full access |
| `ADMIN` | Event administrator | Manage events, tickets, users |
| `STAFF` | Event staff | View analytics, manage tickets |
| `CHECKER` | Check-in staff | Verify tickets only |

---

## Pagination

Paginated endpoints return:

```json
{
  "success": true,
  "data": [...],
  "total": 500,
  "page": 1,
  "limit": 20,
  "totalPages": 25
}
```

