# Launch NexusIQ Full-Stack Development Servers (Backend :8000 + Frontend :3000)
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting NexusIQ Backend (http://localhost:8000) and Frontend (http://localhost:3000)..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\backend'; .\venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\frontend'; npm run dev"

