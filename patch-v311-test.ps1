$ErrorActionPreference = "Stop"

$path = Join-Path (Get-Location) "tests\v311-to-v32-roadmap-completion.test.mjs"

if (-not (Test-Path $path)) {
  throw "Could not find: $path"
}

$content = Get-Content $path -Raw

$oldPatterns = @(
  '/listPurchases\\(currentUser\\.uid\\)/',
  '/listPurchases\\((?:currentUser|authenticatedUser)\\.uid\\)/'
)

$replacement = '/MarketplaceCommerceService\\.listPurchases\\(/'

$updated = $content
$replaced = $false

foreach ($old in $oldPatterns) {
  if ($updated.Contains($old)) {
    $updated = $updated.Replace($old, $replacement)
    $replaced = $true
  }
}

if (-not $replaced) {
  Write-Host "No obsolete listPurchases regex was found. The test may already be patched." -ForegroundColor Yellow
} else {
  Set-Content -Path $path -Value $updated -NoNewline -Encoding utf8
  Write-Host "Patched $path successfully." -ForegroundColor Green
}

Write-Host ""
Write-Host "Run:" -ForegroundColor Cyan
Write-Host "  npm run typecheck"
Write-Host "  npm test"
Write-Host "  npm run release:check"
