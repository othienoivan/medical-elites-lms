param(
  [string]$ProjectId = "medical-elites-lms",
  [string]$Region = "us-central1",
  [string]$Bucket = "medical-elites-lms.firebasestorage.app"
)

$ErrorActionPreference = "Stop"
$ServiceName = "medical-elites-office-converter"
$ServiceAccountName = "me-office-converter"
$ServiceAccount = "$ServiceAccountName@$ProjectId.iam.gserviceaccount.com"
$TriggerName = "medical-elites-office-uploaded"

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
  throw "Google Cloud CLI is not installed. Run .\scripts\install-google-cloud-cli.ps1, reopen PowerShell, and then run this script again."
}

Write-Host "Authenticating and configuring Google Cloud..."
gcloud auth login
gcloud config set project $ProjectId

gcloud services enable run.googleapis.com eventarc.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com firestore.googleapis.com storage.googleapis.com

$existingAccount = gcloud iam service-accounts list --filter="email:$ServiceAccount" --format="value(email)"
if (-not $existingAccount) {
  gcloud iam service-accounts create $ServiceAccountName --display-name="Medical Elites Office Converter"
}

foreach ($role in @(
  "roles/storage.objectAdmin",
  "roles/datastore.user",
  "roles/eventarc.eventReceiver",
  "roles/run.invoker"
)) {
  gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$ServiceAccount" --role=$role --quiet
}

Push-Location "$PSScriptRoot\..\office-conversion-service"
try {
  gcloud run deploy $ServiceName `
    --source . `
    --region $Region `
    --service-account $ServiceAccount `
    --memory 2Gi `
    --cpu 2 `
    --timeout 900 `
    --concurrency 1 `
    --max-instances 3 `
    --no-allow-unauthenticated
}
finally {
  Pop-Location
}

$existingTrigger = gcloud eventarc triggers list --location=$TriggerRegion --filter="name:$TriggerName" --format="value(name)"
if ($existingTrigger) {
  gcloud eventarc triggers delete $TriggerName --location=$TriggerRegion --quiet
}

gcloud eventarc triggers create $TriggerName `
  --location=$TriggerRegion `
  --destination-run-service=$ServiceName `
  --destination-run-region=$Region `
  --event-filters="type=google.cloud.storage.object.v1.finalized" `
  --event-filters="bucket=$Bucket" `
  --service-account=$ServiceAccount

Write-Host "Office converter deployed successfully." -ForegroundColor Green
Write-Host "New .pptx and .docx files uploaded under powerpoints/ or documents/ will be converted automatically."



