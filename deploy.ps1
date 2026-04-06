# SmartStay India: One-Click Deployment Script

Write-Host "--- Starting Deployment for SmartStay India ---" -ForegroundColor Gold

# 1. Git Synchronization
Write-Host "Staging and Committing changes..." -ForegroundColor cyan
git add .
git commit -m "feat: final semantic theme migration and visibility optimization for dashboards"
Write-Host "Pushing to GitHub..." -ForegroundColor cyan
git push origin main

# 2. Production Build
Write-Host "Building production assets (Vite)..." -ForegroundColor cyan
npm run build

# 3. Firebase Deployment
Write-Host "Deploying to Firebase Hosting..." -ForegroundColor cyan
firebase deploy --only hosting

Write-Host "--- Deployment Complete! ---" -ForegroundColor Gold
