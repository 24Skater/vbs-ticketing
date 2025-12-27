# VBS Ticketing - Universal Platform Transformation

## 🎯 Vision

Transform VBS Ticketing from a Ghana-specific church ticketing system into a **universal, open-source event ticketing platform** that any organization worldwide can customize and deploy.

---

## 📋 Executive Summary

| Aspect | Current State | Target State |
|--------|--------------|--------------|
| **Geography** | Ghana-only (GHS, Ghana phones) | Worldwide (any currency, any phone) |
| **Branding** | Hardcoded VBS theme | Fully customizable |
| **Payments** | Hubtel only | Multi-provider (Stripe, PayPal, etc.) |
| **Language** | English only | Multi-language (i18n) |
| **Admin** | Basic ticket management | Full platform control |
| **Frontend** | Fixed design | Theme builder + customization |
| **License** | Private | MIT Open Source |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Settings │ │Branding │ │ Events  │ │Payments │ │ Users   │   │
│  │& Config │ │& Theme  │ │& Tickets│ │& Finance│ │& Roles  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLIC FRONTEND                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Dynamic Theme Engine (colors, fonts, logos, layouts)   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │  Home   │ │ Events  │ │ Tickets │ │ Checkout│              │
│  │  Page   │ │ Listing │ │ Portal  │ │  Flow   │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Multi-tenant Config │ i18n │ Payment Adapters │ Storage │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│  PostgreSQL │ Redis Cache │ S3/Storage │ Email Service         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📅 Implementation Phases

### Phase 1: Foundation & Configuration System (Week 1-2)
### Phase 2: Universal Backend (Week 2-3)
### Phase 3: Payment Provider Abstraction (Week 3-4)
### Phase 4: Admin Dashboard - Core (Week 4-5)
### Phase 5: Admin Dashboard - Branding & Theming (Week 5-6)
### Phase 6: Modern Public Frontend (Week 6-7)
### Phase 7: Internationalization (i18n) (Week 7-8)
### Phase 8: Open Source Preparation (Week 8)

---

## 🔒 AI Agent Guardrails

### CRITICAL RULES - NEVER VIOLATE

```
┌────────────────────────────────────────────────────────────────┐
│  1. NEVER commit to main branch                                 │
│  2. NEVER skip a phase or step                                  │
│  3. NEVER proceed without phase validation                      │
│  4. ALWAYS run tests before moving forward                      │
│  5. ALWAYS backup before destructive operations                 │
│  6. ALWAYS document changes                                     │
│  7. COMMIT after each significant change                        │
└────────────────────────────────────────────────────────────────┘
```

### Before Each Phase
- [ ] Confirm current branch is feature branch
- [ ] Review phase objectives
- [ ] List all files to be created/modified
- [ ] Identify potential breaking changes

### After Each Phase
- [ ] All TypeScript compiles without errors
- [ ] All tests pass
- [ ] Frontend builds successfully
- [ ] Documentation updated
- [ ] Changes committed with descriptive message

---

## 📝 Detailed Phase Breakdown

---

## Phase 1: Foundation & Configuration System

**Goal:** Create a centralized configuration system that stores all customizable settings in the database.

### 1.1 Database Schema for Configuration

```prisma
model SiteConfig {
  id        String   @id @default("default")
  
  // Organization Info
  orgName        String   @default("My Organization")
  orgSlug        String   @unique @default("my-org")
  orgDescription String?
  orgWebsite     String?
  orgEmail       String?
  orgPhone       String?
  
  // Localization
  timezone       String   @default("UTC")
  locale         String   @default("en-US")
  currency       String   @default("USD")
  currencySymbol String   @default("$")
  dateFormat     String   @default("MM/DD/YYYY")
  timeFormat     String   @default("12h")
  
  // Branding - Colors
  primaryColor   String   @default("#3b82f6")
  secondaryColor String   @default("#1e293b")
  accentColor    String   @default("#10b981")
  backgroundColor String  @default("#0f172a")
  textColor      String   @default("#f8fafc")
  
  // Branding - Assets
  logoUrl        String?
  faviconUrl     String?
  heroImageUrl   String?
  
  // Feature Flags
  enablePayments     Boolean @default(true)
  enableQrCodes      Boolean @default(true)
  enablePdfTickets   Boolean @default(true)
  enableEmailNotifications Boolean @default(false)
  enableSmsNotifications   Boolean @default(false)
  
  // Payment Settings
  paymentProviders   Json    @default("[]")  // [{provider, enabled, config}]
  
  // Custom Content
  homePageTitle      String  @default("Welcome")
  homePageSubtitle   String?
  footerText         String  @default("Powered by VBS Ticketing")
  
  // Metadata
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@map("site_config")
}

model PaymentProvider {
  id          String  @id @default(cuid())
  name        String  // stripe, paypal, hubtel, square, etc.
  displayName String
  enabled     Boolean @default(false)
  isDefault   Boolean @default(false)
  config      Json    // Encrypted credentials
  
  // Supported features
  supportsCreditCard  Boolean @default(false)
  supportsMobileMoney Boolean @default(false)
  supportsBankTransfer Boolean @default(false)
  
  currencies  String[] // Supported currency codes
  countries   String[] // Supported country codes
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("payment_providers")
}
```

### 1.2 Files to Create

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Add SiteConfig, PaymentProvider models |
| `src/services/config.service.ts` | Config CRUD operations |
| `src/controllers/config.controller.ts` | Config API endpoints |
| `src/routes/config.routes.ts` | Config routes |
| `src/middleware/config.middleware.ts` | Load config into request |

### 1.3 Validation Checklist

- [ ] SiteConfig model created
- [ ] PaymentProvider model created
- [ ] Config service with get/update methods
- [ ] Config loads on server startup
- [ ] Config cached for performance
- [ ] API endpoint to fetch public config
- [ ] Admin endpoint to update config

---

## Phase 2: Universal Backend

**Goal:** Remove all Ghana-specific code and make backend location-agnostic.

### 2.1 Changes Required

| Current | Universal |
|---------|-----------|
| Ghana phone validation only | International phone with libphonenumber |
| GHS currency hardcoded | Dynamic from config |
| Hubtel-specific code | Payment adapter pattern |
| Fixed ticket ID format | Configurable format |

### 2.2 Files to Modify/Create

| File | Changes |
|------|---------|
| `src/utils/phone.ts` | Use libphonenumber-js for any country |
| `src/utils/currency.ts` | NEW - Currency formatting utilities |
| `src/validators/*.ts` | Remove Ghana-specific validation |
| `src/services/ticket.service.ts` | Use config for currency |

### 2.3 Phone Validation Refactor

```typescript
// src/utils/phone.ts
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export function validatePhone(phone: string, country?: string): boolean {
  try {
    return isValidPhoneNumber(phone, country as any);
  } catch {
    // Fallback: at least 7 digits
    return /^\+?\d{7,15}$/.test(phone.replace(/\D/g, ''));
  }
}

export function formatPhone(phone: string, country?: string): string {
  try {
    const parsed = parsePhoneNumber(phone, country as any);
    return parsed?.formatInternational() || phone;
  } catch {
    return phone;
  }
}
```

### 2.4 Currency Utilities

```typescript
// src/utils/currency.ts
export function formatCurrency(
  amount: number, 
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount / 100); // Amount stored in smallest unit
}

export function parseCurrency(
  displayAmount: string,
  currency: string = 'USD'
): number {
  // Convert display amount to smallest unit (cents/pesewas/etc)
  const num = parseFloat(displayAmount.replace(/[^\d.]/g, ''));
  return Math.round(num * 100);
}
```

### 2.5 Validation Checklist

- [ ] libphonenumber-js installed
- [ ] Phone validation works for any country
- [ ] Currency formatting uses Intl.NumberFormat
- [ ] All hardcoded GHS references removed
- [ ] Config-driven currency display
- [ ] Tests updated for international phones

---

## Phase 3: Payment Provider Abstraction

**Goal:** Create a plugin-based payment system that supports multiple providers.

### 3.1 Payment Adapter Interface

```typescript
// src/payments/types.ts
export interface PaymentAdapter {
  name: string;
  displayName: string;
  
  // Capabilities
  supportedMethods: ('card' | 'mobile_money' | 'bank' | 'wallet')[];
  supportedCurrencies: string[];
  supportedCountries: string[];
  
  // Operations
  initializePayment(params: InitPaymentParams): Promise<InitPaymentResult>;
  verifyPayment(reference: string): Promise<VerifyPaymentResult>;
  refundPayment(reference: string, amount?: number): Promise<RefundResult>;
  
  // Webhooks
  parseWebhook(payload: unknown, signature?: string): WebhookEvent;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}

export interface InitPaymentParams {
  amount: number;        // In smallest currency unit
  currency: string;
  reference: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
}
```

### 3.2 Payment Adapters to Implement

| Provider | Priority | Markets |
|----------|----------|---------|
| Stripe | High | Worldwide |
| PayPal | High | Worldwide |
| Square | Medium | US, CA, UK, AU, JP |
| Hubtel | Medium | Ghana |
| Paystack | Medium | Africa |
| Flutterwave | Medium | Africa |
| Manual/Offline | High | Everywhere |

### 3.3 Files to Create

```
src/payments/
├── types.ts              # Interfaces
├── adapter.factory.ts    # Factory to get adapter by name
├── base.adapter.ts       # Base class with common logic
├── adapters/
│   ├── stripe.adapter.ts
│   ├── paypal.adapter.ts
│   ├── hubtel.adapter.ts
│   ├── manual.adapter.ts
│   └── index.ts
└── index.ts
```

### 3.4 Validation Checklist

- [ ] PaymentAdapter interface defined
- [ ] Base adapter class created
- [ ] Stripe adapter implemented
- [ ] Manual/offline adapter implemented
- [ ] Hubtel adapter migrated
- [ ] Factory selects adapter from config
- [ ] Webhook routes use adapter parser
- [ ] Tests for each adapter

---

## Phase 4: Admin Dashboard - Core

**Goal:** Build a comprehensive admin dashboard with full platform control.

### 4.1 Admin Dashboard Features

```
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 Dashboard                                                    │
│     - Revenue overview (charts)                                  │
│     - Ticket sales by event                                      │
│     - Recent activity feed                                       │
│     - Quick stats cards                                          │
│                                                                  │
│  🎫 Events                                                       │
│     - Create/Edit/Delete events                                  │
│     - Manage ticket types & pricing                              │
│     - Set capacity limits                                        │
│     - Event schedule/calendar                                    │
│                                                                  │
│  🎟️ Tickets                                                      │
│     - View all tickets                                           │
│     - Search/filter tickets                                      │
│     - Manual ticket creation                                     │
│     - Bulk operations (import/export)                            │
│     - Check-in management                                        │
│                                                                  │
│  💳 Payments                                                     │
│     - Transaction history                                        │
│     - Refund management                                          │
│     - Payment provider status                                    │
│     - Revenue reports                                            │
│                                                                  │
│  👥 Users                                                        │
│     - Admin/Staff accounts                                       │
│     - Role management                                            │
│     - Activity logs                                              │
│                                                                  │
│  ⚙️ Settings                                                     │
│     - Organization info                                          │
│     - Localization (timezone, currency, language)                │
│     - Payment providers                                          │
│     - Email/SMS settings                                         │
│     - Feature toggles                                            │
│                                                                  │
│  🎨 Branding (Phase 5)                                           │
│     - Logo & favicon                                             │
│     - Color scheme                                               │
│     - Typography                                                 │
│     - Custom CSS                                                 │
│     - Email templates                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Tech Stack for Admin

| Component | Technology |
|-----------|------------|
| Framework | React 18 + TypeScript |
| Routing | React Router v6 |
| State | Zustand + TanStack Query |
| UI Library | shadcn/ui + Tailwind |
| Charts | Recharts |
| Tables | TanStack Table |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

### 4.3 Admin Routes Structure

```
/admin
├── /                     # Dashboard
├── /events               # Events list
│   ├── /new              # Create event
│   └── /:id              # Edit event
├── /tickets              # Tickets list
│   └── /:id              # Ticket details
├── /payments             # Payment history
├── /users                # User management
├── /settings             # Settings
│   ├── /general          # Org info
│   ├── /localization     # Currency, timezone
│   ├── /payments         # Payment providers
│   └── /notifications    # Email/SMS
└── /branding             # Theme & branding
```

### 4.4 Validation Checklist

- [ ] Admin app scaffolded (Vite + React + TS)
- [ ] Authentication integrated
- [ ] Dashboard with stats
- [ ] Events CRUD working
- [ ] Tickets management working
- [ ] User management working
- [ ] Settings pages working
- [ ] Responsive design
- [ ] Dark/light mode

---

## Phase 5: Admin Dashboard - Branding & Theming

**Goal:** Allow admins to fully customize the look and feel.

### 5.1 Branding Editor Features

```
┌─────────────────────────────────────────────────────────────────┐
│  BRANDING EDITOR                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🖼️ Logo & Images                                                │
│     - Upload logo (light/dark versions)                          │
│     - Upload favicon                                             │
│     - Upload hero/background images                              │
│     - Image cropper tool                                         │
│                                                                  │
│  🎨 Colors                                                       │
│     - Primary color picker                                       │
│     - Secondary color picker                                     │
│     - Accent color picker                                        │
│     - Background colors                                          │
│     - Text colors                                                │
│     - Live preview                                               │
│                                                                  │
│  🔤 Typography                                                   │
│     - Heading font (Google Fonts)                                │
│     - Body font                                                  │
│     - Font sizes                                                 │
│                                                                  │
│  📄 Content                                                      │
│     - Home page title/subtitle                                   │
│     - Footer text                                                │
│     - Custom pages (About, Contact)                              │
│                                                                  │
│  📧 Email Templates                                              │
│     - Ticket confirmation                                        │
│     - Payment receipt                                            │
│     - Event reminder                                             │
│                                                                  │
│  🔧 Advanced                                                     │
│     - Custom CSS injection                                       │
│     - Custom JavaScript                                          │
│     - Meta tags (SEO)                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Theme System

```typescript
// Theme structure stored in database
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  spacing: 'compact' | 'normal' | 'relaxed';
}
```

### 5.3 File Upload System

| Feature | Implementation |
|---------|---------------|
| Storage | Local filesystem or S3-compatible |
| Processing | Sharp for image optimization |
| Formats | PNG, JPG, SVG, WebP |
| Size Limits | Logo: 2MB, Hero: 5MB |

### 5.4 Validation Checklist

- [ ] File upload API working
- [ ] Image processing with Sharp
- [ ] Color picker component
- [ ] Theme preview system
- [ ] Theme applies to public frontend
- [ ] Email template editor
- [ ] Custom CSS/JS injection (with sanitization)

---

## Phase 6: Modern Public Frontend

**Goal:** Rebuild the public frontend with modern design and full customization.

### 6.1 Public Pages

```
/                    # Landing/Home page
/events              # Events listing
/events/:slug        # Event details + ticket purchase
/tickets             # My tickets (lookup)
/ticket/:id          # Single ticket view
/checkout            # Payment flow
/success             # Purchase confirmation
```

### 6.2 Design System

| Component | Description |
|-----------|-------------|
| Layout | Responsive, mobile-first |
| Theme | CSS variables from config |
| Components | Reusable, themeable |
| Animations | Framer Motion |
| Accessibility | WCAG 2.1 AA |

### 6.3 Key Components

```
components/
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navigation.tsx
│   └── Container.tsx
├── events/
│   ├── EventCard.tsx
│   ├── EventList.tsx
│   ├── EventDetails.tsx
│   └── TicketSelector.tsx
├── tickets/
│   ├── TicketCard.tsx
│   ├── TicketQRCode.tsx
│   └── TicketPDF.tsx
├── checkout/
│   ├── CheckoutForm.tsx
│   ├── PaymentMethods.tsx
│   └── OrderSummary.tsx
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    ├── Card.tsx
    └── ...
```

### 6.4 Validation Checklist

- [ ] All pages responsive
- [ ] Theme system working
- [ ] Event listing page
- [ ] Event details with ticket selection
- [ ] Checkout flow complete
- [ ] Ticket lookup working
- [ ] PDF download working
- [ ] QR code display working
- [ ] Accessibility audit passed

---

## Phase 7: Internationalization (i18n)

**Goal:** Support multiple languages with easy translation.

### 7.1 Translation System

```typescript
// Using react-i18next
// translations/en.json
{
  "common": {
    "welcome": "Welcome",
    "signIn": "Sign In",
    "signOut": "Sign Out"
  },
  "events": {
    "title": "Upcoming Events",
    "noEvents": "No events available",
    "getTickets": "Get Tickets"
  },
  "tickets": {
    "yourTicket": "Your Ticket",
    "ticketId": "Ticket ID",
    "downloadPdf": "Download PDF"
  },
  "checkout": {
    "orderSummary": "Order Summary",
    "total": "Total",
    "pay": "Pay {{amount}}"
  }
}
```

### 7.2 Supported Languages (Initial)

| Language | Code | Priority |
|----------|------|----------|
| English | en | High |
| Spanish | es | High |
| French | fr | Medium |
| Portuguese | pt | Medium |
| German | de | Medium |

### 7.3 Validation Checklist

- [ ] i18n library integrated (react-i18next)
- [ ] All text extracted to translation files
- [ ] Language switcher component
- [ ] RTL support for Arabic/Hebrew
- [ ] Date/time formatting localized
- [ ] Number formatting localized
- [ ] Admin can add custom translations

---

## Phase 8: Open Source Preparation

**Goal:** Prepare the project for public open-source release.

### 8.1 Documentation

| Document | Purpose |
|----------|---------|
| README.md | Project overview, quick start |
| INSTALL.md | Detailed installation guide |
| CONFIGURATION.md | All config options |
| DEPLOYMENT.md | Production deployment |
| CONTRIBUTING.md | Contribution guidelines |
| CHANGELOG.md | Version history |
| LICENSE | MIT License |

### 8.2 Developer Experience

- [ ] One-command setup (`npm run setup`)
- [ ] Docker Compose for development
- [ ] Environment variable documentation
- [ ] Example .env file
- [ ] Database seeding script
- [ ] Comprehensive test suite

### 8.3 Security Audit

- [ ] No secrets in code
- [ ] Input validation everywhere
- [ ] SQL injection protection
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Security headers

### 8.4 Release Checklist

- [ ] All tests passing
- [ ] Documentation complete
- [ ] Example deployment working
- [ ] GitHub repo settings configured
- [ ] Issue templates created
- [ ] PR template created
- [ ] GitHub Actions CI/CD
- [ ] npm package (optional)
- [ ] Docker Hub image (optional)

---

## 📊 Progress Tracking

| Phase | Description | Status | Progress |
|-------|-------------|--------|----------|
| 1 | Configuration System | ⬜ | 0% |
| 2 | Universal Backend | ⬜ | 0% |
| 3 | Payment Abstraction | ⬜ | 0% |
| 4 | Admin Dashboard Core | ⬜ | 0% |
| 5 | Branding & Theming | ⬜ | 0% |
| 6 | Modern Frontend | ⬜ | 0% |
| 7 | Internationalization | ⬜ | 0% |
| 8 | Open Source Release | ⬜ | 0% |

---

## 🚀 Quick Start After Completion

```bash
# Clone
git clone https://github.com/your-org/vbs-ticketing.git
cd vbs-ticketing

# Setup
cp .env.example .env
npm install
npm run db:setup

# Configure
npm run setup:wizard  # Interactive setup

# Run
npm run dev

# Access
# Public: http://localhost:3000
# Admin:  http://localhost:3000/admin
```

---

## 📝 Notes

- Each phase builds on the previous
- Test thoroughly before moving to next phase
- Commit frequently with descriptive messages
- Update documentation as you go
- Consider backwards compatibility

---

**Created:** December 2024  
**Target Completion:** 8 weeks  
**Branch:** `universal-platform`

