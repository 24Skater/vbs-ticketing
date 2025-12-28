#!/bin/bash

# =============================================================================
# VBS Ticketing - Setup Script
# =============================================================================
# This script sets up the development environment

set -e

echo ""
echo "🎟️  VBS Ticketing Setup"
echo "========================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed.${NC}"
    echo "   Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher. Found: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Install backend dependencies
echo ""
echo "Installing backend dependencies..."
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Check for .env file
echo ""
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and configure your settings${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Check database connection
echo ""
echo "Checking database..."
if npx prisma db push --accept-data-loss 2>/dev/null; then
    echo -e "${GREEN}✓ Database schema synced${NC}"
else
    echo -e "${YELLOW}⚠️  Could not connect to database${NC}"
    echo "   Make sure PostgreSQL is running and DATABASE_URL is correct in .env"
fi

# Seed database
echo ""
read -p "Would you like to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:seed
    echo -e "${GREEN}✓ Database seeded${NC}"
fi

# Build frontend
echo ""
read -p "Would you like to build the frontend for production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd frontend && npm run build && cd ..
    echo -e "${GREEN}✓ Frontend built${NC}"
fi

# Done
echo ""
echo "========================"
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To start in production mode:"
echo "  npm start"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
echo "Access the application at: http://localhost:5001"
echo ""

