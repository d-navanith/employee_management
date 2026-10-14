@echo off
title Smart HR - Automated Setup Wizard
echo ================================================================
echo         SMART HR EMPLOYEE MANAGEMENT - PC SETUP WIZARD
echo ================================================================
echo.
echo Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH!
    echo Please install Node.js (v18 or higher) from https://nodejs.org/
    echo and run this setup script again.
    pause
    exit /b 1
)

echo [OK] Node.js is detected!
echo.

echo ================================================================
echo [Step 1 of 4] Installing Backend Dependencies...
echo ================================================================
cd server
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env >nul
)
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend npm install failed.
    pause
    exit /b 1
)

echo.
echo ================================================================
echo [Step 2 of 4] Initializing Database & Prisma Client...
echo ================================================================
call npx prisma db push --force-reset
call npx prisma generate
call node prisma/seed.js
if %errorlevel% neq 0 (
    echo [ERROR] Database seeding failed.
    pause
    exit /b 1
)

echo.
echo ================================================================
echo [Step 3 of 4] Installing Frontend Dependencies...
echo ================================================================
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend npm install failed.
    pause
    exit /b 1
)

cd ..
echo.
echo ================================================================
echo [Step 4 of 4] Setup Completed Successfully!
echo ================================================================
echo.
echo Default Credentials:
echo   Super Admin (HR): hr@smarthr.local     / Admin@123  (2FA Secret: HR7788)
echo   Viewer:           viewer@smarthr.local / Viewer@123
echo.
echo You can now start the application by double-clicking 'start-dev.bat'.
echo.
set /p START_NOW="Do you want to launch Smart HR right now? (Y/N): "
if /i "%START_NOW%"=="Y" (
    call start-dev.bat
)
