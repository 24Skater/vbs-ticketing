# 🎟️ VBS Ticketing Platform

<div align="center">

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

**A modern, universal, and fully customizable event ticketing platform.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🌍 Universal Platform
- **Multi-currency** support with 30+ currencies
- **International phone numbers** with validation for any country
- **Multi-language** interface (English, Spanish, French)
- **Timezone aware** date/time handling

### 🎨 Fully Customizable
- **Custom branding**: logos, colors, fonts
- **Theme presets**: Dark, Light, Midnight, Forest, Ocean, Sunset
- **Custom CSS** for advanced styling
- **White-label ready** for your organization

### 💳 Flexible Payments
- **Multiple providers**: Stripe, PayPal, Hubtel (Ghana), Manual/Cash
- **Abstracted payment layer** - easy to add new providers
- **Webhook support** for real-time updates
- **Refund handling**

### 📱 Modern Experience
- **Responsive design** - works on all devices
- **QR code tickets** for easy check-in
- **PDF ticket downloads**
- **Real-time ticket lookup**

### 🔐 Secure & Robust
- **JWT authentication** with role-based access
- **Rate limiting** to prevent abuse
- **Input validation** with Zod
- **Secure password hashing** with bcrypt
- **Audit logging** for compliance

### 📊 Admin Dashboard
- **Event management** with ticket types
- **Sales analytics** and reporting
- **User management** with roles
- **Bulk operations** (import/export)
- **Check-in system** for events

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/vbs-ticketing.git
cd vbs-ticketing

# Copy environment file
cp .env.example .env

# Start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:5001
# Admin: http://localhost:5001/admin
```

### Option 2: Manual Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/vbs-ticketing.git
cd vbs-ticketing

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Setup database
npx prisma db push
npm run db:seed

# Build frontend
cd frontend && npm run build && cd ..

# Start the server
npm start

# Access at http://localhost:5001
```

### Default Admin Credentials

```
Email: admin@example.com
Password: admin123
```

⚠️ **Important**: Change these credentials immediately in production!

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Installation Guide](docs/INSTALL.md) | Detailed setup instructions |
| [Configuration Guide](docs/CONFIGURATION.md) | Environment variables and settings |
| [API Reference](docs/API.md) | REST API endpoints |
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment |
| [Contributing Guide](CONTRIBUTING.md) | How to contribute |

---

## 🏗️ Architecture

```
vbs-ticketing/
├── src/                    # Backend source (TypeScript)
│   ├── controllers/        # HTTP request handlers
│   ├── services/           # Business logic
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── payments/           # Payment adapters
│   ├── validators/         # Zod schemas
│   └── utils/              # Utilities
├── frontend/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities & API
│   │   └── locales/        # i18n translations
├── prisma/                 # Database schema
├── admin/                  # Admin dashboard
└── docs/                   # Documentation
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (access + refresh tokens)
- **Validation**: Zod

### Frontend
- **Framework**: React 18 + Vite
- **State**: TanStack Query + Zustand
- **Styling**: CSS Variables + Custom CSS
- **i18n**: react-i18next
- **Icons**: Inline SVG

### DevOps
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Vitest

---

## 🔧 Configuration

Key environment variables:

```bash
# Server
PORT=5001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/vbs_ticketing

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Payments (optional)
STRIPE_SECRET_KEY=sk_live_...
HUBTEL_CLIENT_ID=...
HUBTEL_CLIENT_SECRET=...
```

See [Configuration Guide](docs/CONFIGURATION.md) for all options.

---

## 🌐 Internationalization

Built-in support for:

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Complete |
| Spanish | `es` | ✅ Complete |
| French | `fr` | ✅ Complete |

Add more languages by creating translation files in `frontend/src/locales/`.

---

## 💳 Payment Providers

| Provider | Status | Regions |
|----------|--------|---------|
| Manual/Cash | ✅ Built-in | Worldwide |
| Stripe | ✅ Built-in | 40+ countries |
| PayPal | 🔧 Planned | Worldwide |
| Hubtel | ✅ Built-in | Ghana |

See [Payment Integration Guide](docs/PAYMENTS.md) for setup.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for the open source community
- Inspired by the need for flexible, self-hosted ticketing solutions
- Thanks to all contributors!

---

<div align="center">

**[⬆ Back to Top](#-vbs-ticketing-platform)**

Made with ❤️ by the VBS Ticketing Team

</div>
