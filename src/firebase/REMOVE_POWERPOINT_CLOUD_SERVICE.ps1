$paths = @(
  "powerpoint-service",
  "scripts\deploy-powerpoint-processor.ps1",
  "scripts\backfill-powerpoints.ps1",
  "src\firebase\powerpointPreviews.ts"
)

foreach ($path in $paths) {
  if (Test-Path $path) {
    Remove-Item $path -Recurse -Force
    Write-Host "Removed $path"
  }
}

if ((Test-Path "scripts") -and -not (Get-ChildItem "scripts" -Force)) {
  Remove-Item "scripts" -Force
}

Write-Host "Cloud Run PowerPoint service cleanup completed."
