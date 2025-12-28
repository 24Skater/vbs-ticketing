# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2024-12-28

### 🎉 Major Release - Universal Platform

This release transforms VBS Ticketing from a Ghana-specific solution to a universal, open-source event ticketing platform.

### Added

#### Universal Platform
- Multi-currency support (30+ currencies)
- International phone number validation and formatting
- Multi-language interface (English, Spanish, French)
- Timezone-aware date/time handling
- Configurable locale and formatting

#### Branding & Customization
- Custom logos (light/dark mode)
- Configurable color themes
- Typography customization (fonts, sizes)
- Theme presets (Dark, Light, Midnight, Forest, Ocean, Sunset)
- Custom CSS support
- Hero image configuration

#### Payment System
- Abstracted payment adapter architecture
- Multiple provider support:
  - Manual/Cash payments (default)
  - Stripe integration
  - Hubtel integration (Ghana)
  - PayPal (planned)
- Provider-specific fee configuration
- Webhook support for all providers

#### Admin Dashboard
- Comprehensive settings panel
- User management with roles
- Event management with ticket types
- Sales analytics and reporting
- Bulk ticket operations
- Real-time check-in system

#### Modern Frontend
- Fully responsive design
- Dynamic theming from configuration
- Smooth page transitions
- Modern component library
- Accessibility improvements

#### Internationalization
- react-i18next integration
- English, Spanish, French translations
- Locale-aware date/number formatting
- Language switcher component

#### Developer Experience
- Full TypeScript backend
- Comprehensive documentation
- GitHub issue/PR templates
- CI/CD with GitHub Actions
- Setup scripts (bash + PowerShell)
- Docker support

### Changed

- Migrated backend to TypeScript
- Upgraded to Node.js 18+
- Replaced Ghana-specific phone handling with international support
- Restructured codebase for modularity
- Improved API response formats
- Enhanced security middleware

### Security

- JWT authentication with refresh tokens
- Role-based access control (SUPER_ADMIN, ADMIN, STAFF, CHECKER)
- Rate limiting on all endpoints
- Input validation with Zod
- Secure password hashing (bcrypt)
- CSRF protection
- Security headers (Helmet)

### Breaking Changes

- Environment variables restructured (see `.env.example`)
- API response format changed to `{ success, data, error }` pattern
- Phone numbers now stored in E.164 format
- Currency amounts in smallest unit (cents/pesewas)

---

## [2.0.0] - 2024-12-26

### Added
- Modern database schema with Prisma
- User authentication with JWT
- Event and ticket type management
- PDF ticket generation
- QR code support
- Bulk ticket import/export

### Changed
- Migrated from legacy schema to new normalized structure
- Improved admin interface

---

## [1.0.0] - 2024-12-20

### Initial Release
- Basic ticket management
- Hubtel mobile money integration
- Simple admin interface
- QR code tickets
- PDF download

---

## Upgrade Guide

### From 2.x to 3.0

1. **Backup your database** before upgrading
2. Update environment variables (see `.env.example`)
3. Run database migration:
   ```bash
   npx prisma db push
   npm run db:migrate
   ```
4. Update admin credentials if using defaults
5. Configure new settings in Admin Dashboard

### From 1.x to 2.x

See [Migration Guide](docs/MIGRATION.md) for detailed instructions.

