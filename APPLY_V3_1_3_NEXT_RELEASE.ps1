$ErrorActionPreference = "Stop"
$root = (Get-Location).Path
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$payload = Join-Path $scriptRoot "payload"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = Join-Path $root "backups\v3.1.3-next-release-$stamp"

if (-not (Test-Path (Join-Path $root "package.json"))) { throw "Run this script from the Medical Elites LMS project root." }
New-Item -ItemType Directory -Force -Path $backup | Out-Null

$files = Get-ChildItem $payload -Recurse -File
foreach ($file in $files) {
  $relative = $file.FullName.Substring($payload.Length).TrimStart('\','/')
  $target = Join-Path $root $relative
  if (Test-Path $target) {
    $backupTarget = Join-Path $backup $relative
    New-Item -ItemType Directory -Force -Path (Split-Path $backupTarget -Parent) | Out-Null
    Copy-Item $target $backupTarget -Force
  }
  New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
  Copy-Item $file.FullName $target -Force
  Write-Host "Applied $relative" -ForegroundColor Green
}

Write-Host "`nBackup created at: $backup" -ForegroundColor Cyan
Write-Host "`nRun validation:" -ForegroundColor Yellow
Write-Host "  node --test tests\v313-next-release-regressions.test.mjs"
Write-Host "  npm run typecheck"
Write-Host "  npm test"
Write-Host "  npm run build"
Write-Host "`nIf all pass, deploy Firestore rules + Hosting:" -ForegroundColor Yellow
Write-Host "  firebase deploy --only firestore:rules,hosting"
