$ErrorActionPreference = "Stop"

$functionsPath = Join-Path $PSScriptRoot "functions"
Set-Location $functionsPath

Write-Host "Stopping Node processes that may lock functions/node_modules..." -ForegroundColor Cyan
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

Write-Host "Removing the old partial installation and internal-registry lockfile..." -ForegroundColor Cyan
Remove-Item -Recurse -Force .\node_modules -ErrorAction SilentlyContinue
Remove-Item -Force .\package-lock.json -ErrorAction SilentlyContinue

Write-Host "Configuring the public npm registry..." -ForegroundColor Cyan
npm config set registry https://registry.npmjs.org/
npm config delete proxy
npm config delete https-proxy
npm cache clean --force

Write-Host "Installing Firebase Functions dependencies..." -ForegroundColor Cyan
npm install --registry=https://registry.npmjs.org/

Write-Host "Building Firebase Functions..." -ForegroundColor Cyan
npm run build

Write-Host "Functions package installed and built successfully." -ForegroundColor Green
Write-Host "Next: firebase deploy --only functions:medicalElitesAi" -ForegroundColor Yellow
