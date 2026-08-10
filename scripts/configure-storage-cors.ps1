$ErrorActionPreference = "Stop"
$Bucket = "gs://medical-elites-lms.firebasestorage.app"
$CorsFile = Join-Path $PSScriptRoot "..\storage-cors.json"
Write-Host "Applying Medical Elites Storage CORS policy..." -ForegroundColor Cyan
gcloud storage buckets update $Bucket --cors-file=$CorsFile
if ($LASTEXITCODE -ne 0) { throw "Cloud Storage CORS update failed." }
Write-Host "Current CORS configuration:" -ForegroundColor Cyan
gcloud storage buckets describe $Bucket --format="default(cors_config)"
