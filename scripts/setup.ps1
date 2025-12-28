# =============================================================================
# VBS Ticketing - Setup Script (PowerShell)
# =============================================================================
# This script sets up the development environment on Windows

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🎟️  VBS Ticketing Setup" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..."
try {
    $nodeVersion = node -v
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 18) {
        Write-Host "❌ Node.js version must be 18 or higher. Found: $nodeVersion" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed." -ForegroundColor Red
    Write-Host "   Please install Node.js 18+ from https://nodejs.org"
    exit 1
}

# Check npm
Write-Host "Checking npm..."
try {
    $npmVersion = npm -v
    Write-Host "✓ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host ""
Write-Host "Installing backend dependencies..."
npm install
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..."
Set-Location frontend
npm install
Set-Location ..
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

# Check for .env file
Write-Host ""
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file from template..."
    Copy-Item .env.example .env
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env and configure your settings" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

# Check database connection
Write-Host ""
Write-Host "Checking database..."
try {
    npx prisma db push --accept-data-loss 2>$null
    Write-Host "✓ Database schema synced" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not connect to database" -ForegroundColor Yellow
    Write-Host "   Make sure PostgreSQL is running and DATABASE_URL is correct in .env"
}

# Seed database
Write-Host ""
$response = Read-Host "Would you like to seed the database with sample data? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    npm run db:seed
    Write-Host "✓ Database seeded" -ForegroundColor Green
}

# Build frontend
Write-Host ""
$response = Read-Host "Would you like to build the frontend for production? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Set-Location frontend
    npm run build
    Set-Location ..
    Write-Host "✓ Frontend built" -ForegroundColor Green
}

# Done
Write-Host ""
Write-Host "========================" -ForegroundColor Cyan
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development server:"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "To start in production mode:"
Write-Host "  npm start"
Write-Host ""
Write-Host "Default admin credentials:"
Write-Host "  Email: admin@example.com"
Write-Host "  Password: admin123"
Write-Host ""
Write-Host "Access the application at: http://localhost:5001"
Write-Host ""

