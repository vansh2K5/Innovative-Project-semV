@echo off
REM Quick Git Sync Script
REM Usage: sync.bat [pull|push|full]

setlocal

set ACTION=%1
if "%ACTION%"=="" set ACTION=full

echo === Git Sync Tool ===
echo.

if "%ACTION%"=="pull" goto PULL
if "%ACTION%"=="push" goto PUSH
if "%ACTION%"=="full" goto FULL
if "%ACTION%"=="status" goto STATUS

:FULL
echo [1/4] Pulling latest changes from GitHub...
git pull
if errorlevel 1 goto ERROR
echo Done!
echo.

echo [2/4] Checking for local changes...
git status --short
echo.

echo [3/4] Adding and committing changes...
git add .
git commit -m "Update: %date% %time%"
echo.

echo [4/4] Pushing to GitHub...
git push
if errorlevel 1 goto ERROR
echo.
echo === Sync Complete ===
goto END

:PULL
echo Pulling latest changes from GitHub...
git pull
if errorlevel 1 goto ERROR
echo Done!
goto END

:PUSH
echo Adding changes...
git add .
echo Committing changes...
git commit -m "Update: %date% %time%"
echo Pushing to GitHub...
git push
if errorlevel 1 goto ERROR
echo Done!
goto END

:STATUS
git status
echo.
echo Recent commits:
git log --oneline -5
goto END

:ERROR
echo.
echo ERROR: Git operation failed!
echo Please check the error message above.
exit /b 1

:END
endlocal
