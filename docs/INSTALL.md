# Installation Guide

This guide covers different ways to install and run VBS Ticketing.

## Table of Contents

- [Requirements](#requirements)
- [Docker Installation (Recommended)](#docker-installation-recommended)
- [Manual Installation](#manual-installation)
- [Development Setup](#development-setup)
- [Troubleshooting](#troubleshooting)

---

## Requirements

### Minimum Requirements

| Component | Version |
|-----------|---------|
| Node.js | 18.0+ |
| PostgreSQL | 14.0+ |
| npm | 9.0+ |

### Optional

- Docker & Docker Compose (for containerized deployment)
- Redis (for session storage in multi-instance deployments)

---

## Docker Installation (Recommended)

The easiest way to run VBS Ticketing is with Docker.

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/vbs-ticketing.git
cd vbs-ticketing
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings. At minimum, set:

```bash
JWT_SECRET=your-secure-random-string-here
DATABASE_URL=postgresql://postgres:postgres@db:5432/vbs_ticketing
```

### Step 3: Start Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- Node.js application server
- Serves frontend at http://localhost:5001

### Step 4: Initialize Database

```bash
docker-compose exec app npm run db:seed
```

### Step 5: Access the Application

- **Frontend**: http://localhost:5001
- **Admin Panel**: http://localhost:5001/admin

Default credentials:
```
Email: admin@example.com
Password: admin123
```

---

## Manual Installation

### Step 1: Clone and Install

```bash
git clone https://github.com/yourusername/vbs-ticketing.git
cd vbs-ticketing

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Step 2: Setup PostgreSQL

Create a database:

```sql
CREATE DATABASE vbs_ticketing;
CREATE USER vbs_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vbs_ticketing TO vbs_user;
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
DATABASE_URL=postgresql://vbs_user:your_password@localhost:5432/vbs_ticketing
JWT_SECRET=your-secure-random-string-here
PORT=5001
NODE_ENV=production
```

### Step 4: Initialize Database

```bash
# Push schema to database
npx prisma db push

# Seed initial data
npm run db:seed
```

### Step 5: Build Frontend

```bash
cd frontend
npm run build
cd ..
```

### Step 6: Start Server

```bash
npm start
```

The application is now running at http://localhost:5001

---

## Development Setup

For local development with hot reloading:

### Backend Development

```bash
# Start backend in development mode
npm run dev
```

This runs the TypeScript compiler in watch mode.

### Frontend Development

In a separate terminal:

```bash
cd frontend
npm run dev
```

The frontend dev server runs on http://localhost:5173 with hot module replacement.

### Run Both

You can run both simultaneously:

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## Environment Variables

See [Configuration Guide](CONFIGURATION.md) for all available options.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret for JWT tokens | Random 64+ character string |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment | `development` |
| `LOG_LEVEL` | Logging level | `info` |

---

## Troubleshooting

### Database Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure PostgreSQL is running and `DATABASE_URL` is correct.

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5001
```

**Solution**: Change the `PORT` in `.env` or stop the conflicting process.

### Prisma Schema Sync

```
Error: The database schema is not in sync
```

**Solution**: Run `npx prisma db push` to sync the schema.

### Build Errors

```
Error: Cannot find module
```

**Solution**: Delete `node_modules` and reinstall:

```bash
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install
```

---

## Next Steps

- [Configuration Guide](CONFIGURATION.md) - Configure your installation
- [Deployment Guide](DEPLOYMENT.md) - Deploy to production
- [API Reference](API.md) - Integrate with your systems

