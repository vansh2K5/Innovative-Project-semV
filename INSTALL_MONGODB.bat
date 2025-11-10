@echo off
echo ========================================
echo MongoDB Installation Helper
echo ========================================
echo.
echo This will help you install MongoDB on your system.
echo.
echo IMPORTANT: You need Administrator privileges!
echo.
echo Press any key to continue...
pause >nul

echo.
echo Opening MongoDB download page in your browser...
echo.
start https://www.mongodb.com/try/download/community

echo.
echo ========================================
echo Installation Instructions
echo ========================================
echo.
echo 1. Download MongoDB Community Server (MSI)
echo    - Version: Latest (7.0+)
echo    - Platform: Windows
echo    - Package: MSI
echo.
echo 2. Run the downloaded installer
echo.
echo 3. Choose "Complete" installation
echo.
echo 4. IMPORTANT: Check the box:
echo    [X] Install MongoDB as a Service
echo.
echo 5. Click Install and wait for completion
echo.
echo 6. After installation, come back here and press any key
echo.
pause

echo.
echo ========================================
echo Verifying MongoDB Installation
echo ========================================
echo.

mongod --version >nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: MongoDB is installed!
    echo.
    mongod --version
    echo.
    echo ========================================
    echo Starting MongoDB Service
    echo ========================================
    echo.
    net start MongoDB
    if %errorlevel% equ 0 (
        echo.
        echo SUCCESS: MongoDB is running!
        echo.
        echo ========================================
        echo Next Steps
        echo ========================================
        echo.
        echo 1. Run: npm run setup
        echo 2. Run: npm run dev
        echo 3. Open: http://localhost:3000/login
        echo.
    ) else (
        echo.
        echo MongoDB service not found or already running.
        echo Try: net start MongoDB
        echo Or check Windows Services for MongoDB
        echo.
    )
) else (
    echo ERROR: MongoDB is not installed or not in PATH
    echo.
    echo Please make sure:
    echo 1. Installation completed successfully
    echo 2. Restart your terminal/command prompt
    echo 3. MongoDB is added to system PATH
    echo.
    echo If you just installed, close this window and open a new one.
    echo.
)

echo.
echo ========================================
pause
