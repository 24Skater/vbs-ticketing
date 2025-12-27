# VBS Ticketing System

A modern, secure ticketing platform for events with mobile money payment integration (Hubtel) for Ghana. Built with TypeScript, Express, React, and PostgreSQL.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **🎫 Ticket Management** - Create, verify, and manage event tickets
- **💳 Mobile Money Payments** - Hubtel integration (MTN, Vodafone, AirtelTigo)
- **📱 QR Code Tickets** - Generate scannable QR codes for check-in
- **📄 PDF Tickets** - Download printable PDF tickets
- **🔐 Secure Authentication** - JWT-based auth with role-based access
- **📊 Analytics Dashboard** - Real-time sales and check-in statistics
- **🎪 Multi-Event Support** - Manage multiple events with ticket types
- **📦 Bulk Operations** - Import/export tickets, bulk check-in
- **🐳 Docker Ready** - One-command deployment with Docker Compose

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                │
│                   Port 5173 (dev) / 5000 (prod)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express + TypeScript)            │
│                          Port 5000                          │
├─────────────────────────────────────────────────────────────┤
│  Middleware: Auth │ Validation │ Rate Limit │ Security     │
├─────────────────────────────────────────────────────────────┤
│  Routes: /api/auth │ /api/tickets │ /api/events │ /api/...  │
├─────────────────────────────────────────────────────────────┤
│  Services: Auth │ Ticket │ Event │ Payment │ Analytics     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │PostgreSQL│   │  Hubtel  │   │  PDFKit  │
        │ (Prisma) │   │   API    │   │  QRCode  │
        └──────────┘   └──────────┘   └──────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or Docker)
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vbs-ticketing.git
cd vbs-ticketing

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Using Docker

```bash
# Start development database
npm run docker:dev

# Or start full production stack
npm run docker:up
```

## 📁 Project Structure

```
vbs-ticketing/
├── src/                      # Backend source code
│   ├── config/               # Configuration (env validation)
│   ├── controllers/          # HTTP request handlers
│   ├── middleware/           # Express middleware
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic
│   ├── utils/                # Utility functions
│   ├── validators/           # Zod validation schemas
│   ├── types/                # TypeScript types
│   └── server.ts             # Application entry point
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # API client, utilities
│   │   └── App.jsx           # Main app component
│   └── package.json
├── prisma/                   # Database schema & migrations
├── scripts/                  # Utility scripts
├── docs/                     # Documentation
├── .github/workflows/        # CI/CD pipelines
├── docker-compose.yml        # Production Docker config
├── docker-compose.dev.yml    # Development Docker config
├── Dockerfile                # Production image
└── package.json
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret for JWT signing | ✅ |
| `JWT_EXPIRES_IN` | Access token expiry (default: 7d) | ❌ |
| `HUBTEL_API_ID` | Hubtel API ID | ✅ |
| `HUBTEL_API_KEY` | Hubtel API Key | ✅ |
| `HUBTEL_POS_SALES_ID` | Hubtel POS Sales ID | ✅ |
| `HUBTEL_CALLBACK_URL` | Payment callback URL | ✅ |
| `PORT` | Server port (default: 5000) | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |

See `.env.example` for all available options.

## 📚 Documentation

- [API Documentation](docs/API.md) - Complete API reference
- [Development Guide](docs/DEVELOPMENT.md) - Setup and development workflow
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [Architecture](docs/ARCHITECTURE.md) - System design and patterns

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests (requires running server)
npm run test:e2e
```

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run typecheck` | TypeScript type checking |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run docker:dev` | Start dev database in Docker |
| `npm run docker:up` | Start production stack |

## 🔒 Security

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)
- Rate limiting on sensitive endpoints
- Input validation with Zod schemas
- Security headers with Helmet.js
- CORS configuration
- SQL injection protection via Prisma

## 🤝 Contributing

1. Create a feature branch from `modernization-v2`
2. Make your changes
3. Run tests: `npm test`
4. Run type check: `npm run typecheck`
5. Submit a pull request

**Note:** Never commit directly to `main` branch.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👥 Credits

- Original concept by Osei Bonsu Aboagye (OxTech Studio)
- Modernization and improvements by the development team

---

**VBS Ticketing System v2.0.0** - Built with ❤️ for Ghana

