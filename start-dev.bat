@echo off
title Smart HR System Launcher
echo ========================================================
echo        Starting Smart HR Management System
echo ========================================================
echo.
echo [1/2] Starting Backend API Server (Port 5000)...
start "Smart HR - Backend (Port 5000)" cmd /k "cd server && npm run dev"

timeout /t 2 /nobreak > nul

echo [2/2] Starting Frontend Vite App (Port 5173)...
start "Smart HR - Frontend (Port 5173)" cmd /k "cd client && npm run dev"

echo.
echo Both servers are launching in separate windows!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:5000
echo.
echo Keep those terminal windows open while using the application.
pause
