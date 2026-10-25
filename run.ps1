Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       STARTING QUICKBITE FOOD DELIVERY PLATFORM" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n[1/2] Starting Django REST Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\backend'; .\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting React Vite Frontend on http://127.0.0.1:3000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\frontend'; cmd /c 'npm run dev -- --host 127.0.0.1 --port 3000'"

Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:3000"

Write-Host "`nQuickBite is running!" -ForegroundColor Green
Write-Host "Frontend : http://127.0.0.1:3000" -ForegroundColor Yellow
Write-Host "API Docs : http://127.0.0.1:8000/api/docs/" -ForegroundColor Yellow
