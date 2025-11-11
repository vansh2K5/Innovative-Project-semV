# Git Sync Script for Windows PowerShell
# Usage: .\sync.ps1 [pull|push|full] ["commit message"]

param(
    [Parameter(Position=0)]
    [ValidateSet("pull", "push", "full", "status")]
    [string]$Action = "full",
    
    [Parameter(Position=1)]
    [string]$CommitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Git Sync Tool ===" -ForegroundColor Cyan
Write-Host ""

switch ($Action) {
    "pull" {
        Write-Host "Pulling latest changes from GitHub..." -ForegroundColor Yellow
        git pull
        Write-Host "✓ Pull complete!" -ForegroundColor Green
    }
    
    "push" {
        Write-Host "Pushing changes to GitHub..." -ForegroundColor Yellow
        git add .
        git commit -m $CommitMessage
        git push
        Write-Host "✓ Push complete!" -ForegroundColor Green
    }
    
    "full" {
        Write-Host "Step 1: Pulling latest changes..." -ForegroundColor Yellow
        git pull
        Write-Host "✓ Pull complete!" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "Step 2: Checking for local changes..." -ForegroundColor Yellow
        $status = git status --porcelain
        
        if ($status) {
            Write-Host "Found changes to commit:" -ForegroundColor Yellow
            git status --short
            Write-Host ""
            
            Write-Host "Step 3: Adding and committing changes..." -ForegroundColor Yellow
            git add .
            git commit -m $CommitMessage
            Write-Host "✓ Commit complete!" -ForegroundColor Green
            Write-Host ""
            
            Write-Host "Step 4: Pushing to GitHub..." -ForegroundColor Yellow
            git push
            Write-Host "✓ Push complete!" -ForegroundColor Green
        } else {
            Write-Host "No local changes to commit." -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "=== Sync Complete ===" -ForegroundColor Cyan
    }
    
    "status" {
        Write-Host "Repository Status:" -ForegroundColor Yellow
        git status
        Write-Host ""
        Write-Host "Recent Commits:" -ForegroundColor Yellow
        git log --oneline -5
    }
}
