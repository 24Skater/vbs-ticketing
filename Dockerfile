# =============================================================================
# VBS Ticketing System - Production Dockerfile
# Multi-stage build for optimized image size
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

# Install production dependencies
RUN npm ci --only=production

# Install all dependencies for build
RUN cp -R node_modules prod_node_modules
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 2: Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Build frontend
RUN cd frontend && npm run build

# -----------------------------------------------------------------------------
# Stage 3: Production
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 vbs

# Copy production dependencies
COPY --from=deps /app/prod_node_modules ./node_modules

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy necessary files
COPY package.json ./
COPY prisma ./prisma

# Set ownership
RUN chown -R vbs:nodejs /app

# Switch to non-root user
USER vbs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start command
CMD ["node", "dist/server.js"]

