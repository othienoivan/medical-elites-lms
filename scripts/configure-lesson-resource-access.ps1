$ErrorActionPreference = "Stop"
$ProjectId = "medical-elites-lms"
$ProjectNumber = (gcloud projects describe $ProjectId --format="value(projectNumber)").Trim()
if (-not $ProjectNumber) { throw "Unable to resolve Google Cloud project number." }
$RuntimeServiceAccount = "$ProjectNumber-compute@developer.gserviceaccount.com"

Write-Host "Enabling IAM Service Account Credentials API..." -ForegroundColor Cyan
gcloud services enable iamcredentials.googleapis.com --project=$ProjectId
if ($LASTEXITCODE -ne 0) { throw "Unable to enable IAM Service Account Credentials API." }

Write-Host "Allowing the Functions runtime service account to sign short-lived lesson resource URLs..." -ForegroundColor Cyan
gcloud iam service-accounts add-iam-policy-binding $RuntimeServiceAccount `
  --project=$ProjectId `
  --member="serviceAccount:$RuntimeServiceAccount" `
  --role="roles/iam.serviceAccountTokenCreator"
if ($LASTEXITCODE -ne 0) { throw "Unable to grant signed-URL permission." }

Write-Host "Lesson resource signed-URL permissions configured." -ForegroundColor Green
