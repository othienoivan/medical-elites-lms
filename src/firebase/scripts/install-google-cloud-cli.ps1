$ErrorActionPreference = "Stop"

if (Get-Command gcloud -ErrorAction SilentlyContinue) {
  Write-Host "Google Cloud CLI is already installed."
  gcloud --version
  exit 0
}

Write-Host "Google Cloud CLI was not found."
Write-Host "Installing it with Windows Package Manager (winget)..."

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "winget is not available. Install Google Cloud CLI from:" -ForegroundColor Yellow
  Write-Host "https://cloud.google.com/sdk/docs/install" -ForegroundColor Cyan
  exit 1
}

winget install --id Google.CloudSDK --exact --accept-source-agreements --accept-package-agreements

Write-Host "Installation requested. Close and reopen PowerShell, then run:" -ForegroundColor Green
Write-Host "gcloud init"
