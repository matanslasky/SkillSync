# SkillSync Startup Script - Firebase Version
Write-Host "🚀 Starting SkillSync..." -ForegroundColor Green

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Check Node.js
Write-Host "`n✓ Checking Node.js..." -ForegroundColor Cyan
node --version
npm --version

# Check Firebase config
Write-Host "`n✓ Checking Firebase configuration..." -ForegroundColor Cyan
if (Test-Path "client\.env") {
    Write-Host "  Firebase config found" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  client\.env not found!" -ForegroundColor Yellow
    Write-Host "  Please create client\.env with your Firebase config." -ForegroundColor Yellow
    Write-Host "  See FIREBASE-SETUP.md for instructions." -ForegroundColor Yellow
}

# Start the application
Write-Host "`n🌟 Starting SkillSync frontend..." -ForegroundColor Cyan
Write-Host "  App will be at: http://localhost:5173" -ForegroundColor Green
Write-Host "`nPress Ctrl+C to stop`n" -ForegroundColor Yellow

Set-Location client
npm run dev
