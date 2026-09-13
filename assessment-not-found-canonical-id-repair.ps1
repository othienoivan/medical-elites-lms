param(
  [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\package.json")) {
  throw "Run this script from the Medical Elites LMS project root."
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = ".\assessment-id-repair-backup-$stamp"
New-Item -ItemType Directory -Path $backup -Force | Out-Null

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Save-Utf8NoBom([string]$Path, [string]$Content) {
  $full = (Resolve-Path $Path).Path
  $Content = $Content.TrimStart([char]0xFEFF)
  [System.IO.File]::WriteAllText($full, $Content, $utf8NoBom)
}

function Backup-One([string]$Path) {
  if (-not (Test-Path $Path)) { return }
  $relative = $Path.TrimStart(".\")
  $target = Join-Path $backup $relative
  $dir = Split-Path $target -Parent
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  Copy-Item $Path $target -Force
}

$functionPath = ".\functions\src\index.ts"
$entryPath = ".\src\pages\AssessmentEntryPage.tsx"

Backup-One $functionPath
Backup-One $entryPath

Write-Host "Backups created at $backup" -ForegroundColor Green

# ---------------------------------------------------------------------------
# 1. Backend: resolve canonical Firestore quiz document IDs, while preserving
#    compatibility with older records whose stored `id` field is the route ID.
# ---------------------------------------------------------------------------

$functions = Get-Content $functionPath -Raw

if ($functions -notmatch "legacyQuizSnapshot") {
  $directLookupPattern = '(?s)\s*const quizSnapshot = await db\.collection\("quizzes"\)\.doc\(quizId\)\.get\(\);\s*if \(!quizSnapshot\.exists\) \{\s*throw new HttpsError\(\s*"not-found",\s*"Assessment not found\."\s*\);\s*\}\s*'

  $directLookupReplacement = @'

    let quizSnapshot = await db.collection("quizzes").doc(quizId).get();

    // Compatibility path for legacy assessment links where the public/stored
    // quiz `id` differs from the Firestore document ID.
    if (!quizSnapshot.exists) {
      const legacyQuizSnapshot = await db
        .collection("quizzes")
        .where("id", "==", quizId)
        .limit(1)
        .get();

      if (!legacyQuizSnapshot.empty) {
        quizSnapshot = legacyQuizSnapshot.docs[0];
      }
    }

    if (!quizSnapshot.exists) {
      throw new HttpsError(
        "not-found",
        "Assessment not found."
      );
    }

'@

  $newFunctions = [regex]::Replace(
    $functions,
    $directLookupPattern,
    $directLookupReplacement,
    1
  )

  if ($newFunctions -eq $functions) {
    throw "STOP: Could not patch the getStudentAssessmentPackage quiz lookup block."
  }

  $functions = $newFunctions
}

# Ensure returned quiz data always exposes the canonical Firestore document ID.
$quizDataPattern = 'const quizData = quizSnapshot\.data\(\) \?\? \{\};'
if ($functions -match $quizDataPattern) {
  $functions = [regex]::Replace(
    $functions,
    $quizDataPattern,
    'const quizData = { ...(quizSnapshot.data() ?? {}), id: quizSnapshot.id };',
    1
  )
}

# Opportunistically repair the stale lesson/module link when an old route ID
# successfully resolves to a different canonical Firestore document ID.
if ($functions -notmatch "canonical assessment reference repair") {
  $moduleDataNeedle = '    const moduleData = moduleSnapshot.data() ?? {};'
  $repairBlock = @'
    const moduleData = moduleSnapshot.data() ?? {};

    // Best-effort canonical assessment reference repair. This makes future
    // lesson/module navigation use the real Firestore quiz document ID.
    if (quizSnapshot.id !== quizId) {
      const assessmentType = asText(quizData.assessmentType, 80);
      const linkedLessonId = asText(quizData.lessonId, 200);

      const repairWrites: Array<Promise<FirebaseFirestore.WriteResult>> = [];

      if (assessmentType === "lesson-quiz" && linkedLessonId) {
        repairWrites.push(
          db.collection("lessons").doc(linkedLessonId).update({
            quizId: quizSnapshot.id,
            updatedAt: FieldValue.serverTimestamp(),
          })
        );
      } else if (moduleId) {
        repairWrites.push(
          db.collection("modules").doc(moduleId).update({
            quizId: quizSnapshot.id,
            updatedAt: FieldValue.serverTimestamp(),
          })
        );
      }

      if (repairWrites.length > 0) {
        void Promise.allSettled(repairWrites).then((results) => {
          results.forEach((result) => {
            if (result.status === "rejected") {
              console.warn(
                "Canonical assessment reference repair failed.",
                result.reason,
              );
            }
          });
        });
      }
    }
'@

  if (-not $functions.Contains($moduleDataNeedle)) {
    throw "STOP: moduleData anchor was not found in getStudentAssessmentPackage."
  }

  $functions = $functions.Replace($moduleDataNeedle, $repairBlock)
}

Save-Utf8NoBom $functionPath $functions

# ---------------------------------------------------------------------------
# 2. Assessment entry: count attempts using the canonical quiz ID returned by
#    the backend, not the possibly-legacy route parameter.
# ---------------------------------------------------------------------------

$entry = Get-Content $entryPath -Raw

$oldAttemptFilter = 'studentAttempts.filter((attempt) => attempt.quizId === quizId)'
$newAttemptFilter = 'studentAttempts.filter((attempt) => attempt.quizId === quizData.id)'

if ($entry.Contains($oldAttemptFilter)) {
  $entry = $entry.Replace($oldAttemptFilter, $newAttemptFilter)
}

# ---------------------------------------------------------------------------
# 3. Repair common UTF-8 mojibake in the assessment rules.
# ---------------------------------------------------------------------------

$entry = $entry.Replace("â€¢", "•")
$entry = $entry.Replace("â€“", "–")
$entry = $entry.Replace("â€”", "—")
$entry = $entry.Replace("â€™", "’")

Save-Utf8NoBom $entryPath $entry

Write-Host "`nAssessment ID compatibility repair applied." -ForegroundColor Green

# ---------------------------------------------------------------------------
# 4. Validation
# ---------------------------------------------------------------------------

if (-not $SkipValidation) {
  Write-Host "`n===== FRONTEND TYPECHECK =====" -ForegroundColor Cyan
  npm run typecheck
  if ($LASTEXITCODE -ne 0) { throw "Frontend typecheck failed." }

  Write-Host "`n===== FRONTEND BUILD =====" -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "Frontend build failed." }

  Write-Host "`n===== FUNCTIONS BUILD =====" -ForegroundColor Cyan
  Push-Location ".\functions"
  try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Functions build failed." }
  }
  finally {
    Pop-Location
  }

  Write-Host "`nAll validation checks passed." -ForegroundColor Green
}

Write-Host "`n===== PATCH SUMMARY =====" -ForegroundColor Cyan
Select-String `
  -Path $functionPath `
  -Pattern "legacyQuizSnapshot|quizSnapshot.id !== quizId|Canonical assessment reference repair" `
  -Context 1,4

Select-String `
  -Path $entryPath `
  -Pattern "quizData.id|Answer all questions before submitting" `
  -Context 1,3

Write-Host "`nNo deployment was performed." -ForegroundColor Yellow
Write-Host 'After validation passes, deploy with:' -ForegroundColor Yellow
Write-Host 'firebase deploy --only "functions:getStudentAssessmentPackage,hosting"' -ForegroundColor White
