$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$payload = Join-Path $PSScriptRoot "payload"

$files = @(
  "src\components\editor\LessonBlockRenderer.tsx",
  "src\firebase\storage.tsx",
  "storage.rules",
  "src\firebase\storage.rules"
)

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = Join-Path $root "backups\html5-upload-$stamp"
New-Item -ItemType Directory -Force -Path $backup | Out-Null

foreach ($relative in $files) {
  $source = Join-Path $payload $relative
  $destination = Join-Path $root $relative
  if (-not (Test-Path $source)) { throw "Patch payload missing: $relative" }
  if (Test-Path $destination) {
    $backupFile = Join-Path $backup $relative
    New-Item -ItemType Directory -Force -Path (Split-Path $backupFile -Parent) | Out-Null
    Copy-Item $destination $backupFile -Force
  }
  New-Item -ItemType Directory -Force -Path (Split-Path $destination -Parent) | Out-Null
  Copy-Item $source $destination -Force
  Write-Host "Patched $relative" -ForegroundColor Green
}

Write-Host "" 
Write-Host "HTML5 upload patch applied successfully." -ForegroundColor Cyan
Write-Host "Backup: $backup" -ForegroundColor Yellow
Write-Host "Next run: npm run typecheck; npm run build; npm test" -ForegroundColor Cyan
