#!/usr/bin/env pwsh
# Start both frontend and backend servers concurrently for development

Write-Host "🚀 Starting G-Nexus Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Function to start backend
function Start-Backend {
    Write-Host "📦 Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
    Set-Location backend
    npm run dev
}

# Function to start frontend
function Start-Frontend {
    Write-Host "🎨 Starting Frontend Server (Port 8080)..." -ForegroundColor Green
    npm run dev
}

# Start both in background jobs
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend
    npm run dev
}

$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

Write-Host ""
Write-Host "✅ Both servers are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "📌 Frontend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "📌 Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "📌 API Proxy: http://localhost:8080/api/* → http://localhost:5000/api/*" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Red
Write-Host ""

# Monitor jobs
try {
    while ($true) {
        # Show backend output
        $backendOutput = Receive-Job -Job $backendJob
        if ($backendOutput) {
            Write-Host "[Backend] $backendOutput" -ForegroundColor Yellow
        }

        # Show frontend output
        $frontendOutput = Receive-Job -Job $frontendJob
        if ($frontendOutput) {
            Write-Host "[Frontend] $frontendOutput" -ForegroundColor Green
        }

        Start-Sleep -Milliseconds 100
    }
}
finally {
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor Red
    Stop-Job -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob
    Write-Host "✅ All servers stopped" -ForegroundColor Green
}
