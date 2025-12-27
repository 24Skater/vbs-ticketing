# VBS Ticketing - Current State Documentation

**Generated:** December 2024  
**Purpose:** Document system state before modernization

---

## Environment

| Component | Version |
|-----------|---------|
| Node.js | v22.18.0 |
| npm | 11.7.0 |
| PostgreSQL | 15-alpine (Docker) |
| OS | Windows 10 |

---

## Project Structure Overview

The repository contains **multiple applications** (some may be abandoned/experimental):

```
vbs-ticketing/
├── server.js              # 🟢 MAIN BACKEND (1400+ lines, monolithic)
├── frontend/              # 🟢 MAIN FRONTEND (React + Vite)
├── prisma/                # 🟢 DATABASE SCHEMA
├── admin-panel/           # 🟡 SEPARATE ADMIN (TypeScript, not integrated)
├── admin-frontend/        # 🟡 ANOTHER ADMIN ATTEMPT
├── new-admin-panel/       # 🔴 ABANDONED
├── vbs-ticketing25/       # 🔴 NEXT.JS EXPERIMENT (abandoned)
├── controllers/           # 🔴 UNUSED (old structure)
├── routes/                # 🔴 UNUSED (old structure)
├── models/                # 🔴 UNUSED (MongoDB remnant)
└── Home.jsx               # 🔴 ORPHAN FILE
```

**Legend:** 🟢 Active | 🟡 Partially Used | 🔴 Unused/Abandoned

---

## Current Dependencies (package.json)

### Production Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| @prisma/client | ^5.20.0 | Database ORM |
| axios | ^1.13.2 | HTTP client |
| body-parser | ^1.20.3 | Request parsing (redundant with express) |
| cors | ^2.8.5 | CORS middleware |
| crypto | ^1.0.1 | ⚠️ Unnecessary (built into Node) |
| dotenv | ^16.4.5 | Environment variables |
| exceljs | ^4.4.0 | Excel file generation |
| express | ^4.21.1 | Web framework |
| jsonwebtoken | ^9.0.2 | JWT (installed but barely used) |
| mongoose | ^8.8.0 | ⚠️ UNUSED (MongoDB remnant) |
| multer | ^2.0.2 | File uploads |
| pdfkit | ^0.17.2 | PDF generation |
| qrcode | ^1.5.3 | QR code generation |
| twilio | ^5.3.3 | ⚠️ UNUSED (SMS remnant) |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| prisma | ^5.20.0 | Database toolkit |
| nodemon | ^3.1.7 | Auto-reload |
| autoprefixer | ^10.4.22 | CSS processing |
| postcss | ^8.5.6 | CSS processing |
| tailwindcss | ^4.1.17 | CSS framework |

---

## Database Schema (Current)

```prisma
model Payment {
  id         Int       @id @default(autoincrement())
  name       String
  phone      String
  amount     Int
  status     String    @default("Paid")
  reference  String?
  ticketType String    @default("Regular")
  ticketId   String    @unique
  eventDate  String    @default("Dec 27, 2025")
  eventTime  String    @default("09:00 AM")
  accessCode String?   @unique
  used       Boolean   @default(false)
  verifiedAt DateTime?
  verifiedBy String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}
```

**Issues:**
- Single model for everything (no separation of concerns)
- String dates instead of DateTime
- No events table
- No customers table
- No admin users table
- No activity logging
- No payment tracking separate from tickets

---

## API Endpoints (Current server.js)

### Public Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/health | Health check |
| GET | /api/tickets/:ticketId | Get ticket by ID |
| GET | /api/tickets/:ticketId/verify | Verify ticket (redirect) |
| GET | /api/tickets/by-phone/:phone | Lookup tickets by phone |
| POST | /api/tickets/lookup | Lookup by phone + access code |
| GET | /ticket-pdf/:id | Download ticket PDF |

### Payment Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/payments/initiate | Initiate Hubtel payment |
| POST | /api/verify-payment | Verify payment status |
| POST | /api/hubtel/checkout | Create checkout |
| POST | /api/hubtel/direct-receive | Direct mobile money |
| GET | /api/hubtel/txn-status | Check transaction status |
| GET | /api/hubtel/transactions/:ref/status | Manual status check |

### Webhook Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/hubtel/webhook | Hubtel payment webhook |
| POST | /api/hubtel/direct-receive/callback | Direct receive callback |

### Admin Endpoints (Protected by x-admin-key header)
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/admin/verify | Check-in ticket |
| GET | /api/admin/verify/logs | Get verification logs |
| POST | /api/admin/resolve-txn | Resolve transaction |
| GET | /api/admin/webhook-events | View webhook events |
| GET | /api/admin/manual-template | Export Excel template |
| POST | /api/admin/manual-import | Import tickets from Excel |
| POST | /api/admin/create | Create manual ticket |
| GET | /api/admin/payments | List all tickets |
| PUT | /api/admin/payments/:id | Update ticket |
| DELETE | /api/admin/payments/:id | Delete ticket |

---

## Security Issues Identified

1. **Static API Key Authentication**
   - Admin key in header (no JWT, no sessions)
   - Default key hardcoded: `VBSAdmin#8372`

2. **No Input Validation**
   - Direct use of req.body without sanitization
   - No schema validation

3. **CORS Wide Open**
   - `app.use(cors())` allows all origins

4. **No Rate Limiting**
   - Vulnerable to brute force attacks

5. **Secrets in Code**
   - Default admin key in source
   - No proper secret management

6. **No Security Headers**
   - Missing Helmet.js
   - No CSP, HSTS, etc.

---

## Files to Keep vs Remove

### Keep (Core Functionality)
- `server.js` → Will be refactored into `src/`
- `frontend/` → Main user interface
- `prisma/schema.prisma` → Database schema (will be upgraded)
- `package.json` → Dependencies (will be updated)

### Keep for Reference (May Borrow Code)
- `admin-panel/` → Has better TypeScript structure

### Remove After Migration
- `admin-frontend/` → Duplicate admin panel
- `new-admin-panel/` → Abandoned
- `vbs-ticketing25/` → Next.js experiment
- `controllers/` → Unused legacy
- `routes/` → Unused legacy
- `models/` → MongoDB remnant
- `Home.jsx` → Orphan file

---

## Current Working Features

✅ Ticket creation (manual + webhook)  
✅ Ticket lookup by phone  
✅ Ticket lookup by phone + access code  
✅ PDF ticket generation with QR code  
✅ Hubtel payment integration  
✅ Webhook handling  
✅ Admin ticket management  
✅ Bulk import from Excel  
✅ Check-in/verification  

## Features Missing

❌ Proper authentication (JWT)  
❌ User management  
❌ Role-based access control  
❌ Multi-event support  
❌ Email notifications  
❌ SMS notifications  
❌ Activity logging  
❌ Analytics dashboard  
❌ Rate limiting  
❌ Input validation  

---

## Migration Notes

1. **Database**: Current `Payment` model will be split into:
   - `Event` - Event information
   - `Customer` - Customer details
   - `Ticket` - Ticket records
   - `Payment` - Payment transactions
   - `AdminUser` - Admin accounts
   - `AdminSession` - Login sessions
   - `ActivityLog` - Audit trail

2. **Authentication**: Replace `x-admin-key` with JWT-based auth

3. **Code Structure**: Split 1400-line `server.js` into:
   - Controllers
   - Services
   - Routes
   - Middleware
   - Utilities

4. **TypeScript**: Migrate entire backend to TypeScript

---

**Document Status:** Complete  
**Next Step:** Create git backup (Step 0.1.2)

