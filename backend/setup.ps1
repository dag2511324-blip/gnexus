# G-Nexus Chat Backend - Automated Setup Script
# This script will configure your backend with the new Supabase database

Write-Host "🚀 G-Nexus Chat Backend Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Copy Supabase configuration to .env
Write-Host "📝 Step 1: Configuring environment variables..." -ForegroundColor Yellow
$sourcePath = ".\SUPABASE_CONFIG.txt"
$destPath = ".\.env"

if (Test-Path $sourcePath) {
    Copy-Item -Path $sourcePath -Destination $destPath -Force
    Write-Host "✅ Configuration copied to .env" -ForegroundColor Green
} else {
    Write-Host "❌ SUPABASE_CONFIG.txt not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Install dependencies (if needed)
Write-Host "📦 Step 2: Checking dependencies..." -ForegroundColor Yellow
if (!(Test-Path ".\node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""

# Step 3: Initialize database
Write-Host "🗄️  Step 3: Initializing Supabase database..." -ForegroundColor Yellow
Write-Host "This will create tables: users, sessions, conversations, messages, api_keys" -ForegroundColor Gray
npm run db:push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database initialized successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Database initialization failed!" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL in .env" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start backend:  npm run dev" -ForegroundColor White
Write-Host "  2. Visit frontend: http://localhost:5173/register" -ForegroundColor White
Write-Host "  3. Create account and start chatting!" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Database Info:" -ForegroundColor Cyan
Write-Host "  Project: gnexus-chat-backend" -ForegroundColor White
$dashboardUrl = "https://supabase.com/dashboard/project/kfkmxofvdywgcbjgqddo"
Write-Host "  Dashboard: $dashboardUrl" -ForegroundColor White
Write-Host ""
