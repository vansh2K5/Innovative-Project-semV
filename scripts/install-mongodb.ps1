# MongoDB Installation Script for Windows
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MongoDB Installation Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Checking for MongoDB installation..." -ForegroundColor Yellow
Write-Host ""

# Check if MongoDB is already installed
$mongoPath = Get-Command mongod -ErrorAction SilentlyContinue

if ($mongoPath) {
    Write-Host "MongoDB is already installed!" -ForegroundColor Green
    Write-Host "Location: $($mongoPath.Source)" -ForegroundColor Green
    Write-Host ""
    
    # Check if service exists
    $mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    
    if ($mongoService) {
        Write-Host "MongoDB service found!" -ForegroundColor Green
        Write-Host "Status: $($mongoService.Status)" -ForegroundColor Green
        
        if ($mongoService.Status -ne "Running") {
            Write-Host ""
            Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
            Start-Service -Name MongoDB
            Write-Host "MongoDB service started!" -ForegroundColor Green
        }
    } else {
        Write-Host "MongoDB service not found. You may need to start it manually." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "MongoDB is ready to use!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: npm run setup" -ForegroundColor White
    Write-Host "2. Run: npm run dev" -ForegroundColor White
    pause
    exit 0
}

Write-Host "MongoDB not found. Checking for Chocolatey..." -ForegroundColor Yellow
Write-Host ""

# Check if Chocolatey is installed
$chocoPath = Get-Command choco -ErrorAction SilentlyContinue

if ($chocoPath) {
    Write-Host "Chocolatey found! Installing MongoDB..." -ForegroundColor Green
    Write-Host ""
    
    choco install mongodb -y
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "MongoDB installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
        Start-Service -Name MongoDB -ErrorAction SilentlyContinue
        Write-Host "MongoDB service started!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Installation complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Run: npm run setup" -ForegroundColor White
        Write-Host "2. Run: npm run dev" -ForegroundColor White
    } else {
        Write-Host "Failed to install MongoDB via Chocolatey." -ForegroundColor Red
        Write-Host "Please install manually from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    }
} else {
    Write-Host "Chocolatey not found." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Manual Installation Required" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Install Chocolatey (Package Manager)" -ForegroundColor Cyan
    Write-Host "1. Open PowerShell as Administrator" -ForegroundColor White
    Write-Host "2. Run this command:" -ForegroundColor White
    Write-Host '   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString("https://community.chocolatey.org/install.ps1"))' -ForegroundColor Gray
    Write-Host "3. Then run: choco install mongodb -y" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Download MongoDB Installer" -ForegroundColor Cyan
    Write-Host "1. Visit: https://www.mongodb.com/try/download/community" -ForegroundColor White
    Write-Host "2. Download MongoDB Community Server (MSI)" -ForegroundColor White
    Write-Host "3. Run the installer" -ForegroundColor White
    Write-Host "4. Choose 'Complete' installation" -ForegroundColor White
    Write-Host "5. Check 'Install MongoDB as a Service'" -ForegroundColor White
    Write-Host "6. Complete the installation" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, run this script again to verify." -ForegroundColor Yellow
    Write-Host ""
    
    # Ask if user wants to open download page
    $openBrowser = Read-Host "Open MongoDB download page in browser? (Y/N)"
    if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
        Start-Process "https://www.mongodb.com/try/download/community"
    }
}

Write-Host ""
pause
