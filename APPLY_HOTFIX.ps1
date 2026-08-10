$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$sourceRoot = Join-Path $PSScriptRoot "files"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $root ".hotfix-backups\paid-plan-authoritative-override-$timestamp"

$targets = @(
  "src\components\TenantProvider.tsx",
  "tests\v312-paid-plan-authoritative-override.test.mjs"
)

Write-Host "Medical Elites paid-plan authoritative override" -ForegroundColor Cyan
Write-Host "Project: $root"

if (-not (Test-Path (Join-Path $root "package.json"))) {
  throw "Run this script from the Medical Elites LMS project root (the folder containing package.json)."
}

New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null

foreach ($relative in $targets) {
  $destination = Join-Path $root $relative
  $source = Join-Path $sourceRoot $relative

  if (-not (Test-Path $source)) {
    throw "Hotfix source file missing: $source"
  }

  if (Test-Path $destination) {
    $backup = Join-Path $backupRoot $relative
    New-Item -ItemType Directory -Force -Path (Split-Path $backup -Parent) | Out-Null
    Copy-Item $destination $backup -Force
  }

  New-Item -ItemType Directory -Force -Path (Split-Path $destination -Parent) | Out-Null
  Copy-Item $source $destination -Force
  Write-Host "Updated $relative" -ForegroundColor Green
}

Write-Host ""
Write-Host "Backup saved to: $backupRoot" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "Next run:" -ForegroundColor Yellow
Write-Host "  node --test tests\v312-paid-plan-authoritative-override.test.mjs"
Write-Host "  npm run typecheck"
Write-Host "  npm test"
Write-Host "  npm run build"
Write-Host "  firebase deploy --only hosting"
