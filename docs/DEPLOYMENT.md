# VBS Ticketing System - Deployment Guide

This guide covers deploying the VBS Ticketing System to production environments.

## Table of Contents

- [Deployment Options](#deployment-options)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Cloud Platforms](#cloud-platforms)
- [Database Setup](#database-setup)
- [SSL/HTTPS](#sslhttps)
- [Monitoring](#monitoring)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

---

## Deployment Options

| Option | Best For | Complexity |
|--------|----------|------------|
| Docker Compose | Single server, small-medium scale | Low |
| Kubernetes | Large scale, high availability | High |
| Railway/Render | Quick deployment, managed infra | Low |
| VPS (DigitalOcean, Linode) | Full control, cost-effective | Medium |
| AWS/GCP/Azure | Enterprise, complex requirements | High |

---

## Docker Deployment

### Prerequisites

- Docker 24+
- Docker Compose 2+
- Domain name (for production)
- SSL certificate

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/vbs-ticketing.git
cd vbs-ticketing

# Create production environment file
cp .env.example .env.production
nano .env.production  # Edit with production values

# Build and start
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f app
```

### Production docker-compose.yml

The default `docker-compose.yml` is production-ready:

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      # ... other env vars
    ports:
      - "5000:5000"
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
```

### Environment Variables for Production

```env
# .env.production
NODE_ENV=production
PORT=5000

# Database
DB_USER=vbs_prod
DB_PASSWORD=very-secure-password-here
DB_NAME=vbs_ticketing

# JWT - Use a strong, random secret
JWT_SECRET=generate-a-64-character-random-string-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Hubtel Production Credentials
HUBTEL_API_ID=prod-api-id
HUBTEL_API_KEY=prod-api-key
HUBTEL_POS_SALES_ID=prod-pos-sales-id
HUBTEL_CALLBACK_URL=https://your-domain.com/api/webhooks/hubtel

# CORS
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart app only
docker-compose restart app

# Rebuild after code changes
docker-compose up -d --build app

# Database backup
docker-compose exec db pg_dump -U $DB_USER $DB_NAME > backup.sql

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Shell into container
docker-compose exec app sh
```

---

## Manual Deployment

### Server Requirements

- Ubuntu 22.04+ / Debian 12+
- Node.js 20+ (via nvm)
- PostgreSQL 14+
- Nginx (reverse proxy)
- PM2 (process manager)
- Certbot (SSL)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y nginx postgresql postgresql-contrib

# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install PM2
npm install -g pm2
```

### Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE USER vbs_prod WITH PASSWORD 'secure-password';
CREATE DATABASE vbs_ticketing OWNER vbs_prod;
GRANT ALL PRIVILEGES ON DATABASE vbs_ticketing TO vbs_prod;
\q
```

### Step 3: Deploy Application

```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/vbs-ticketing.git
cd vbs-ticketing

# Install dependencies
npm ci --production

# Create environment file
cp .env.example .env
nano .env  # Configure for production

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Start with PM2
pm2 start dist/server.js --name vbs-ticketing
pm2 save
pm2 startup
```

### Step 4: Nginx Configuration

```nginx
# /etc/nginx/sites-available/vbs-ticketing
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:5000;
        # ... same proxy settings
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/vbs-ticketing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: SSL with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
```

---

## Cloud Platforms

### Railway

1. Connect GitHub repository
2. Add environment variables in Railway dashboard
3. Add PostgreSQL plugin
4. Deploy

**railway.toml:**
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npx prisma migrate deploy && npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
```

### Render

1. Create new Web Service
2. Connect repository
3. Set build command: `npm ci && npm run build && npx prisma migrate deploy`
4. Set start command: `npm start`
5. Add PostgreSQL database
6. Add environment variables

### DigitalOcean App Platform

1. Create new App
2. Connect GitHub repository
3. Add database component (PostgreSQL)
4. Configure environment variables
5. Set run command: `npm start`

---

## Database Setup

### Production PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Secure installation
sudo -u postgres psql

# Create production user with limited privileges
CREATE USER vbs_prod WITH PASSWORD 'secure-password';
CREATE DATABASE vbs_ticketing OWNER vbs_prod;

# Configure pg_hba.conf for security
sudo nano /etc/postgresql/16/main/pg_hba.conf
# Change: local all all peer -> local all all md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Database Backups

```bash
# Create backup
pg_dump -U vbs_prod -h localhost vbs_ticketing > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backup (cron)
0 2 * * * pg_dump -U vbs_prod vbs_ticketing | gzip > /backups/vbs_$(date +\%Y\%m\%d).sql.gz

# Restore from backup
psql -U vbs_prod -h localhost vbs_ticketing < backup.sql
```

### Connection Pooling (PgBouncer)

For high traffic, use PgBouncer:

```ini
# /etc/pgbouncer/pgbouncer.ini
[databases]
vbs_ticketing = host=localhost dbname=vbs_ticketing

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

---

## SSL/HTTPS

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Test renewal
sudo certbot renew --dry-run
```

### Using Cloudflare

1. Add domain to Cloudflare
2. Set SSL mode to "Full (Strict)"
3. Enable "Always Use HTTPS"
4. Configure origin certificate if needed

---

## Monitoring

### Application Health

```bash
# Check health endpoint
curl https://your-domain.com/api/health
```

### PM2 Monitoring

```bash
# View process status
pm2 status

# View logs
pm2 logs vbs-ticketing

# Monitor resources
pm2 monit

# Set up log rotation
pm2 install pm2-logrotate
```

### External Monitoring

**Recommended services:**
- UptimeRobot (free tier available)
- Better Uptime
- Datadog
- New Relic

**Health check endpoint:** `GET /api/health`

---

## Backup & Recovery

### Automated Backup Script

```bash
#!/bin/bash
# /opt/scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups
DB_NAME=vbs_ticketing
DB_USER=vbs_prod

# Create backup
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

# Optional: Upload to S3
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-bucket/backups/
```

```bash
# Add to crontab
0 3 * * * /opt/scripts/backup.sh
```

### Recovery Procedure

```bash
# 1. Stop application
pm2 stop vbs-ticketing

# 2. Restore database
gunzip -c backup.sql.gz | psql -U vbs_prod vbs_ticketing

# 3. Run any pending migrations
cd /var/www/vbs-ticketing
npx prisma migrate deploy

# 4. Start application
pm2 start vbs-ticketing
```

---

## Troubleshooting

### Common Issues

**Application won't start:**
```bash
# Check logs
pm2 logs vbs-ticketing --lines 100

# Check environment
pm2 env 0

# Verify database connection
npx prisma db pull
```

**Database connection errors:**
```bash
# Test connection
psql -U vbs_prod -h localhost vbs_ticketing

# Check PostgreSQL status
sudo systemctl status postgresql

# Check pg_hba.conf
sudo cat /etc/postgresql/16/main/pg_hba.conf
```

**High memory usage:**
```bash
# Check PM2 processes
pm2 monit

# Restart with memory limit
pm2 restart vbs-ticketing --max-memory-restart 500M
```

**SSL certificate issues:**
```bash
# Renew certificate
sudo certbot renew

# Check certificate
sudo certbot certificates
```

### Performance Optimization

```bash
# Enable gzip in Nginx
gzip on;
gzip_types text/plain application/json application/javascript text/css;

# Configure PM2 cluster mode
pm2 start dist/server.js -i max --name vbs-ticketing

# Database connection pool
# In .env:
DATABASE_URL="postgresql://...?connection_limit=10"
```

---

## Security Checklist

- [ ] Strong database passwords
- [ ] JWT secret is 64+ characters
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] CORS restricted to your domains
- [ ] Firewall configured (only 80, 443, 22)
- [ ] Regular security updates
- [ ] Database backups encrypted
- [ ] Hubtel callback URL uses HTTPS
- [ ] No sensitive data in logs

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrated
- [ ] SSL certificate installed
- [ ] Nginx configured
- [ ] PM2 process running
- [ ] Health check passing
- [ ] Monitoring set up
- [ ] Backups scheduled
- [ ] Firewall configured
- [ ] Hubtel webhook tested

