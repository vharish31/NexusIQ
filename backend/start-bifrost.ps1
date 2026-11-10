# Helper script to launch Maxim Bifrost AI Gateway with setup token
$env:BIFROST_SETUP_TOKEN = "nexus-setup-token-2026"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Bifrost AI Gateway..." -ForegroundColor Green
Write-Host " Setup Token set to: $env:BIFROST_SETUP_TOKEN" -ForegroundColor Yellow
Write-Host " Enter this token in the browser when prompted." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

npx -y @maximhq/bifrost

