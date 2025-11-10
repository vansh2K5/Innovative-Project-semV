@echo off
echo ========================================
echo MongoDB Setup and Start Script
echo ========================================
echo.

REM Check if MongoDB service exists
sc query MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo MongoDB service found!
    echo.
    echo Starting MongoDB service...
    net start MongoDB
    if %errorlevel% equ 0 (
        echo.
        echo ✓ MongoDB service started successfully!
    ) else (
        echo.
        echo MongoDB service is already running or failed to start.
    )
) else (
    echo MongoDB service not found.
    echo.
    echo Please install MongoDB from:
    echo https://www.mongodb.com/try/download/community
    echo.
    echo Or start MongoDB manually:
    echo mongod --dbpath "C:\data\db"
    pause
    exit /b 1
)

echo.
echo ========================================
echo Checking MongoDB connection...
echo ========================================
echo.

REM Wait a moment for MongoDB to fully start
timeout /t 2 /nobreak >nul

REM Test MongoDB connection
mongosh --eval "db.version()" --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MongoDB is running and accessible!
    echo.
    echo MongoDB Version:
    mongosh --eval "db.version()" --quiet
) else (
    echo × Could not connect to MongoDB
    echo.
    echo Make sure MongoDB is properly installed and running.
)

echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Run setup script: node scripts\setup-mongodb.js
echo 2. Start application: npm run dev
echo.
pause
