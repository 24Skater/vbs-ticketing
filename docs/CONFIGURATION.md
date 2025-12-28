# Configuration Guide

This guide covers all configuration options for VBS Ticketing.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Site Configuration](#site-configuration)
- [Payment Providers](#payment-providers)
- [Branding & Theming](#branding--theming)
- [Security Settings](#security-settings)

---

## Environment Variables

### Core Settings

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | Environment mode | `development` |
| `PORT` | No | Server port | `5001` |
| `HOST` | No | Server host | `0.0.0.0` |

### Database

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection URL | `postgresql://user:pass@host:5432/db` |

### Authentication

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `JWT_SECRET` | Yes | Secret for signing JWTs | - |
| `JWT_EXPIRES_IN` | No | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token expiry | `7d` |

### Payment Providers

#### Stripe

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Conditional | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Conditional | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Conditional | Webhook signing secret |

#### Hubtel (Ghana)

| Variable | Required | Description |
|----------|----------|-------------|
| `HUBTEL_CLIENT_ID` | Conditional | Hubtel client ID |
| `HUBTEL_CLIENT_SECRET` | Conditional | Hubtel client secret |
| `HUBTEL_MERCHANT_ACCOUNT` | Conditional | Merchant account number |
| `HUBTEL_POS_SALES_ID` | Conditional | POS Sales ID |

### Logging

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `LOG_LEVEL` | No | Logging level | `info` |
| `LOG_FORMAT` | No | Log format | `json` |

---

## Site Configuration

Site settings are stored in the database and can be modified via the Admin Dashboard.

### Access Configuration

1. Log in to Admin Dashboard
2. Navigate to **Settings** → **General**
3. Or use the API: `PATCH /api/config/admin`

### Organization Settings

| Setting | Description | Example |
|---------|-------------|---------|
| `orgName` | Organization name | `My Church` |
| `orgSlug` | URL-friendly identifier | `my-church` |
| `orgDescription` | Short description | `Welcome to our events` |
| `orgWebsite` | Website URL | `https://mychurch.org` |
| `orgEmail` | Contact email | `info@mychurch.org` |
| `orgPhone` | Contact phone | `+1 234 567 8900` |

### Localization

| Setting | Description | Options |
|---------|-------------|---------|
| `timezone` | Server timezone | IANA timezone (e.g., `America/New_York`) |
| `locale` | Display locale | `en-US`, `es-ES`, `fr-FR` |
| `language` | UI language | `en`, `es`, `fr` |
| `currency` | Default currency | ISO 4217 code (e.g., `USD`, `EUR`) |
| `dateFormat` | Date display format | `MM/DD/YYYY`, `DD/MM/YYYY` |
| `timeFormat` | Time format | `12h`, `24h` |

### Features

| Setting | Description | Default |
|---------|-------------|---------|
| `enablePayments` | Enable online payments | `true` |
| `enableQrCodes` | Generate QR codes | `true` |
| `enablePdfTickets` | Allow PDF downloads | `true` |
| `enablePublicEventList` | Show events publicly | `true` |
| `enableTicketLookup` | Allow ticket lookup | `true` |
| `maintenanceMode` | Show maintenance page | `false` |

---

## Payment Providers

### Enabling Providers

1. Go to **Admin** → **Settings** → **Payments**
2. Click on a provider to configure
3. Enter credentials and enable

### Provider Configuration

#### Manual/Cash

No configuration needed. Enabled by default.

Use for:
- Cash payments at venue
- Bank transfers
- Check payments

#### Stripe

1. Create a [Stripe account](https://stripe.com)
2. Get API keys from Dashboard → Developers → API Keys
3. Configure webhook:
   - Endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`

```json
{
  "secretKey": "sk_live_...",
  "publishableKey": "pk_live_...",
  "webhookSecret": "whsec_..."
}
```

#### Hubtel (Ghana)

1. Create a [Hubtel merchant account](https://hubtel.com)
2. Get credentials from Hubtel Dashboard
3. Configure:

```json
{
  "clientId": "...",
  "clientSecret": "...",
  "merchantAccountNumber": "...",
  "posSalesId": "...",
  "callbackUrl": "https://yourdomain.com/api/webhooks/hubtel"
}
```

---

## Branding & Theming

### Colors

| Setting | Description | Default |
|---------|-------------|---------|
| `primaryColor` | Main brand color | `#3b82f6` |
| `secondaryColor` | Secondary color | `#1e293b` |
| `accentColor` | Accent/highlight | `#10b981` |
| `backgroundColor` | Page background | `#0f172a` |
| `surfaceColor` | Card backgrounds | `#1e293b` |
| `textColor` | Primary text | `#f8fafc` |
| `textMutedColor` | Secondary text | `#94a3b8` |

### Typography

| Setting | Description | Default |
|---------|-------------|---------|
| `headingFont` | Font for headings | `Inter` |
| `bodyFont` | Font for body text | `Inter` |
| `borderRadius` | Corner roundness | `md` |

Border radius options: `none`, `sm`, `md`, `lg`, `full`

### Logos & Images

| Setting | Description | Size |
|---------|-------------|------|
| `logoUrl` | Main logo | 200x50px recommended |
| `logoDarkUrl` | Logo for dark backgrounds | 200x50px |
| `faviconUrl` | Browser favicon | 32x32px |
| `heroImageUrl` | Homepage hero background | 1920x1080px |

### Theme Presets

Apply a preset via **Admin** → **Settings** → **Branding**:

- **Default Dark** - Blue primary, dark background
- **Light Mode** - Light backgrounds
- **Midnight** - Deep purple theme
- **Forest** - Green nature theme
- **Ocean** - Teal ocean theme
- **Sunset** - Warm orange theme

### Custom CSS

Add custom styles via `customCss` setting:

```css
/* Example: Custom button style */
.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

/* Example: Custom hero */
.hero-section {
  background-image: url('/custom-bg.jpg');
}
```

---

## Security Settings

### Rate Limiting

Default limits (configurable):

| Endpoint | Limit |
|----------|-------|
| `/api/auth/login` | 5 per minute |
| `/api/tickets/*` | 100 per minute |
| General API | 200 per minute |

### CORS

By default, CORS allows requests from the same origin. Configure additional origins:

```bash
CORS_ORIGINS=https://app.example.com,https://admin.example.com
```

### Content Security Policy

CSP is enabled by default. Customize in `src/middleware/security.middleware.ts`.

### Session Security

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens are invalidated on logout
- Passwords are hashed with bcrypt (12 rounds)

---

## API Reference

For API configuration and endpoints, see [API.md](API.md).

