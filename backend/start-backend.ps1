# Helper script to launch NexusIQ FastAPI Backend Server
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting NexusIQ Backend on http://localhost:8000..." -ForegroundColor Green
Write-Host " Swagger UI: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot
& ".\venv\Scripts\uvicorn.exe" app.main:app --reload --host 0.0.0.0 --port 8000

