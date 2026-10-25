@echo off
echo ========================================================
echo        STARTING QUICKBITE FOOD DELIVERY PLATFORM
echo ========================================================
echo.

echo [1/2] Starting Django REST Backend on http://127.0.0.1:8000 ...
start "QuickBite Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React Vite Frontend on http://127.0.0.1:3000 ...
start "QuickBite Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 3000"

timeout /t 2 /nobreak >nul
start http://127.0.0.1:3000

echo.
echo ========================================================
echo   QuickBite is running!
echo   Frontend : http://127.0.0.1:3000
echo   API Docs : http://127.0.0.1:8000/api/docs/
echo ========================================================
