# Universal Platform - Implementation Checklist

## 🤖 AI Agent Rules

```
┌──────────────────────────────────────────────────────────────────┐
│                    MANDATORY RULES                                │
├──────────────────────────────────────────────────────────────────┤
│  1. NEVER commit to main branch                                   │
│  2. ALWAYS verify branch before starting: universal-platform      │
│  3. COMPLETE each step before marking done                        │
│  4. RUN tests after each phase                                    │
│  5. BUILD frontend after changes                                  │
│  6. COMMIT after each significant change                          │
│  7. UPDATE this checklist as you progress                         │
│  8. NEVER skip steps - do them in order                           │
│  9. ASK user before destructive operations                        │
│ 10. DOCUMENT all new features                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Progress Overview

| Phase | Description | Status | Progress |
|-------|-------------|--------|----------|
| 1 | Configuration System | ✅ | 100% |
| 2 | Universal Backend | ⬜ | 0% |
| 3 | Payment Abstraction | ⬜ | 0% |
| 4 | Admin Dashboard Core | ⬜ | 0% |
| 5 | Branding & Theming | ⬜ | 0% |
| 6 | Modern Frontend | ⬜ | 0% |
| 7 | Internationalization | ⬜ | 0% |
| 8 | Open Source Release | ⬜ | 0% |

---

## Phase 1: Configuration System ✅ COMPLETE

### 1.1 Database Schema
- [x] Add SiteConfig model to schema.prisma
- [x] Add PaymentProviderConfig model to schema.prisma
- [x] Add Upload model for file storage
- [x] Push schema: `npx prisma db push`
- [x] Generate client: `npm run db:generate`

### 1.2 Config Service
- [x] Create `src/services/config.service.ts`
- [x] Implement getSiteConfig()
- [x] Implement updateSiteConfig()
- [x] Implement getPublicSiteConfig() (no secrets)
- [x] Add config caching (5 min TTL)
- [x] Implement payment provider CRUD

### 1.3 Config API
- [x] Create `src/controllers/config.controller.ts`
- [x] Create `src/routes/config.routes.ts`
- [x] GET /api/config (public, no secrets)
- [x] GET /api/config/theme.css (CSS variables)
- [x] GET /api/config/payment-providers (public)
- [x] GET /api/admin/config (full config, admin only)
- [x] PATCH /api/admin/config (update, admin only)
- [x] Payment provider admin endpoints
- [x] Register routes in index.ts

### 1.4 Config Middleware
- [x] Create `src/middleware/config.middleware.ts`
- [x] Load config on app startup
- [x] Attach config to req object
- [x] Maintenance mode check

### 1.5 Seed Default Config
- [x] Update `scripts/seed.ts` to create default config
- [x] Seed default payment providers
- [x] Test seeding creates config

**Phase 1 Validation:**
- [x] `npm run typecheck` passes
- [x] API returns config
- [x] Theme CSS generates correctly
- [x] Config updates persist

---

## Phase 2: Universal Backend

### 2.1 Phone Utilities
- [ ] Install libphonenumber-js
- [ ] Rewrite `src/utils/phone.ts` for international
- [ ] Update phone validation to any country
- [ ] Add phone formatting helper
- [ ] Update validators to use new phone util

### 2.2 Currency Utilities
- [ ] Create `src/utils/currency.ts`
- [ ] formatCurrency(amount, currency, locale)
- [ ] parseCurrency(display) -> smallest unit
- [ ] getCurrencySymbol(currency)
- [ ] Update ticket service to use config currency

### 2.3 Remove Hardcoded Values
- [ ] Remove all "GHS" references
- [ ] Remove all "Ghana" references
- [ ] Remove all "233" phone prefixes
- [ ] Use config values instead

### 2.4 Update Validators
- [ ] Update `src/validators/ticket.validator.ts`
- [ ] Update `src/validators/payment.validator.ts`
- [ ] Make phone validation country-aware
- [ ] Make currency validation config-aware

**Phase 2 Validation:**
- [ ] Phone validation works for US numbers
- [ ] Phone validation works for UK numbers
- [ ] Currency formatting works for USD
- [ ] Currency formatting works for EUR
- [ ] No hardcoded Ghana references

---

## Phase 3: Payment Abstraction

### 3.1 Payment Types
- [ ] Create `src/payments/types.ts`
- [ ] Define PaymentAdapter interface
- [ ] Define InitPaymentParams
- [ ] Define PaymentResult types
- [ ] Define WebhookEvent types

### 3.2 Base Adapter
- [ ] Create `src/payments/base.adapter.ts`
- [ ] Common validation logic
- [ ] Common error handling
- [ ] Logging integration

### 3.3 Adapter Factory
- [ ] Create `src/payments/adapter.factory.ts`
- [ ] getAdapter(providerName)
- [ ] getEnabledAdapters()
- [ ] getDefaultAdapter()

### 3.4 Stripe Adapter
- [ ] Install stripe package
- [ ] Create `src/payments/adapters/stripe.adapter.ts`
- [ ] Implement initializePayment (checkout session)
- [ ] Implement verifyPayment
- [ ] Implement refundPayment
- [ ] Implement webhook parsing

### 3.5 Manual/Offline Adapter
- [ ] Create `src/payments/adapters/manual.adapter.ts`
- [ ] Support cash payments
- [ ] Support bank transfer
- [ ] Admin marks as paid

### 3.6 Migrate Hubtel Adapter
- [ ] Create `src/payments/adapters/hubtel.adapter.ts`
- [ ] Move existing Hubtel code
- [ ] Conform to PaymentAdapter interface

### 3.7 Update Payment Service
- [ ] Refactor `src/services/payment.service.ts`
- [ ] Use adapter factory
- [ ] Support multiple providers

### 3.8 Update Webhook Routes
- [ ] Generic webhook handler
- [ ] Route to correct adapter
- [ ] Signature verification

**Phase 3 Validation:**
- [ ] Stripe test payment works
- [ ] Manual payment works
- [ ] Hubtel still works
- [ ] Webhooks process correctly

---

## Phase 4: Admin Dashboard Core

### 4.1 Project Setup
- [ ] Create `admin/` directory (new React app)
- [ ] Initialize Vite + React + TypeScript
- [ ] Install dependencies (shadcn, tanstack, etc.)
- [ ] Configure Tailwind CSS
- [ ] Set up path aliases

### 4.2 Authentication
- [ ] Login page
- [ ] Auth context/store
- [ ] Protected route wrapper
- [ ] Token refresh logic
- [ ] Logout functionality

### 4.3 Layout
- [ ] Sidebar navigation
- [ ] Header with user menu
- [ ] Mobile responsive layout
- [ ] Dark/light mode toggle

### 4.4 Dashboard Page
- [ ] Stats cards (revenue, tickets, events)
- [ ] Revenue chart (last 30 days)
- [ ] Recent tickets table
- [ ] Quick actions

### 4.5 Events Management
- [ ] Events list page
- [ ] Create event form
- [ ] Edit event form
- [ ] Delete event (with confirmation)
- [ ] Ticket types management

### 4.6 Tickets Management
- [ ] Tickets list with search/filter
- [ ] Ticket details view
- [ ] Manual ticket creation
- [ ] Bulk import (CSV/Excel)
- [ ] Bulk export
- [ ] Check-in functionality

### 4.7 Payments Page
- [ ] Transaction history
- [ ] Filter by status/date
- [ ] Refund action
- [ ] Export transactions

### 4.8 Users Management
- [ ] Users list
- [ ] Create user
- [ ] Edit user roles
- [ ] Deactivate user
- [ ] Activity log

### 4.9 Settings Pages
- [ ] General settings (org info)
- [ ] Localization (currency, timezone)
- [ ] Feature toggles
- [ ] Payment provider config

**Phase 4 Validation:**
- [ ] Admin login works
- [ ] Dashboard loads data
- [ ] Events CRUD works
- [ ] Tickets CRUD works
- [ ] Settings save correctly

---

## Phase 5: Branding & Theming

### 5.1 File Upload
- [ ] Create `src/services/upload.service.ts`
- [ ] Configure multer for images
- [ ] Image processing with Sharp
- [ ] Storage: local or S3
- [ ] Upload API endpoints

### 5.2 Branding Editor UI
- [ ] Logo upload component
- [ ] Favicon upload component
- [ ] Hero image upload component
- [ ] Color picker components
- [ ] Live preview panel

### 5.3 Theme System
- [ ] Define theme schema
- [ ] CSS variable generation
- [ ] Theme provider component
- [ ] Font loading (Google Fonts)

### 5.4 Content Editor
- [ ] Home page content editor
- [ ] Footer text editor
- [ ] Custom pages (optional)

### 5.5 Email Templates
- [ ] Template editor UI
- [ ] Variables insertion
- [ ] Preview functionality
- [ ] Default templates

### 5.6 Advanced Options
- [ ] Custom CSS field
- [ ] Custom JS field (sanitized)
- [ ] Meta tags editor

**Phase 5 Validation:**
- [ ] Logo uploads and displays
- [ ] Colors apply to frontend
- [ ] Fonts load correctly
- [ ] Email templates work

---

## Phase 6: Modern Frontend

### 6.1 Theme Integration
- [ ] Create ThemeProvider
- [ ] Load theme from API
- [ ] Apply CSS variables
- [ ] Dynamic component styling

### 6.2 Layout Components
- [ ] Header (with logo)
- [ ] Footer (with custom text)
- [ ] Navigation
- [ ] Container/wrapper

### 6.3 Home Page
- [ ] Hero section (with uploaded image)
- [ ] Featured events
- [ ] Call to action
- [ ] Responsive design

### 6.4 Events Page
- [ ] Events grid/list
- [ ] Event card component
- [ ] Filter/search
- [ ] Pagination

### 6.5 Event Details
- [ ] Event info display
- [ ] Ticket type selection
- [ ] Quantity selector
- [ ] Add to cart

### 6.6 Checkout Flow
- [ ] Cart/order summary
- [ ] Customer info form
- [ ] Payment method selection
- [ ] Payment processing
- [ ] Success/confirmation page

### 6.7 Ticket Portal
- [ ] Ticket lookup form
- [ ] Ticket display
- [ ] QR code generation
- [ ] PDF download

### 6.8 Mobile Optimization
- [ ] All pages responsive
- [ ] Touch-friendly
- [ ] Performance optimization
- [ ] PWA basics (optional)

**Phase 6 Validation:**
- [ ] All pages work on mobile
- [ ] Theme applies correctly
- [ ] Checkout completes
- [ ] Tickets display properly

---

## Phase 7: Internationalization

### 7.1 i18n Setup
- [ ] Install react-i18next
- [ ] Configure i18n
- [ ] Set up language detection
- [ ] Create translation namespace structure

### 7.2 Extract Strings
- [ ] Extract all frontend text
- [ ] Create en.json (English)
- [ ] Create es.json (Spanish)
- [ ] Create fr.json (French)

### 7.3 Admin Translations
- [ ] Extract admin dashboard text
- [ ] Create admin translation files

### 7.4 Language Switcher
- [ ] Language selector component
- [ ] Persist language preference
- [ ] Add to header/footer

### 7.5 Date/Number Formatting
- [ ] Use Intl.DateTimeFormat
- [ ] Use Intl.NumberFormat
- [ ] Respect locale setting

### 7.6 RTL Support (Optional)
- [ ] RTL CSS styles
- [ ] Test with Arabic/Hebrew

**Phase 7 Validation:**
- [ ] Language switches correctly
- [ ] All text translated
- [ ] Dates format per locale
- [ ] Numbers format per locale

---

## Phase 8: Open Source Release

### 8.1 Documentation
- [ ] Update README.md
- [ ] Create INSTALL.md
- [ ] Create CONFIGURATION.md
- [ ] Create CONTRIBUTING.md
- [ ] Create CHANGELOG.md
- [ ] Add LICENSE (MIT)

### 8.2 Developer Experience
- [ ] One-command setup script
- [ ] Docker Compose dev environment
- [ ] Seed script for demo data
- [ ] Example .env file

### 8.3 Security Audit
- [ ] Check for exposed secrets
- [ ] Validate all inputs
- [ ] Test for XSS
- [ ] Test for SQL injection
- [ ] Rate limiting in place

### 8.4 GitHub Setup
- [ ] Repository settings
- [ ] Issue templates
- [ ] PR template
- [ ] GitHub Actions CI
- [ ] Branch protection

### 8.5 Release
- [ ] Tag version 3.0.0
- [ ] Create GitHub release
- [ ] Write release notes
- [ ] Announce (optional)

**Phase 8 Validation:**
- [ ] Fresh clone + setup works
- [ ] Documentation accurate
- [ ] No security issues
- [ ] CI/CD passing

---

## 🎯 Final Validation

- [ ] All 8 phases complete
- [ ] All tests passing
- [ ] Frontend builds
- [ ] Docker works
- [ ] Documentation complete
- [ ] Security reviewed
- [ ] Ready for release

---

**Last Updated:** December 2024  
**Target:** Universal Platform v3.0.0

