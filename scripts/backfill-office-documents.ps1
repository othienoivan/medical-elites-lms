param(
  [string]$ProjectId = "medical-elites-lms",
  [string]$Region = "us-central1",
  [string]$Bucket = "medical-elites-lms.firebasestorage.app"
)

$ErrorActionPreference = "Stop"
$ServiceName = "medical-elites-office-converter"

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
  throw "Google Cloud CLI is not installed. Run .\scripts\install-google-cloud-cli.ps1 first."
}

$ServiceUrl = gcloud run services describe $ServiceName --region=$Region --project=$ProjectId --format="value(status.url)"
$IdentityToken = gcloud auth print-identity-token

$folders = @("powerpoints", "documents")
foreach ($folder in $folders) {
  $objects = gcloud storage ls "gs://$Bucket/$folder/**" | Where-Object {
    $_.ToLower().EndsWith(".pptx") -or $_.ToLower().EndsWith(".docx")
  }

  foreach ($object in $objects) {
    $name = $object.Replace("gs://$Bucket/", "")
    Write-Host "Processing $name"
    $payload = @{ bucket = $Bucket; name = $name } | ConvertTo-Json -Compress
    Invoke-RestMethod `
      -Method Post `
      -Uri "$ServiceUrl/process" `
      -Headers @{ Authorization = "Bearer $IdentityToken" } `
      -ContentType "application/json" `
      -Body $payload
  }
}

Write-Host "Office document backfill complete." -ForegroundColor Green
