$ErrorActionPreference = "Stop"

$obsoletePaths = @(
  "powerpoint-service",
  "scripts\deploy-powerpoint-processor.ps1",
  "scripts\backfill-powerpoints.ps1",
  "src\components\lesson\PowerPointViewer.tsx",
  "src\firebase\powerpointPreviews.ts"
)

foreach ($path in $obsoletePaths) {
  if (Test-Path $path) {
    Remove-Item $path -Recurse -Force
    Write-Host "Removed obsolete path: $path"
  }
}

Write-Host "RC2.5 cleanup complete." -ForegroundColor Green
