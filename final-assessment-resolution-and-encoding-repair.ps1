param(
  [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\package.json")) {
  throw "Run this script from the Medical Elites LMS project root."
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = ".\assessment-resolution-final-backup-$stamp"
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
# BACKEND: replace the assessment lookup section with a canonical resolver.
# It supports:
# 1) direct Firestore doc ID
# 2) legacy stored quiz.id
# 3) stale lesson.quizId -> published quiz linked by lessonId
# 4) stale module.quizId -> published quiz linked by moduleId
# ---------------------------------------------------------------------------

$functions = Get-Content $functionPath -Raw

$startMarker = '    let quizSnapshot = await db.collection("quizzes").doc(quizId).get();'
if (-not $functions.Contains($startMarker)) {
  $startMarker = '    const quizSnapshot = await db.collection("quizzes").doc(quizId).get();'
}

$endMarker = '    if (quizData.status !== "published") {'

$start = $functions.IndexOf($startMarker)
$end = $functions.IndexOf($endMarker, $start)

if ($start -lt 0 -or $end -lt 0) {
  throw "STOP: Could not locate the getStudentAssessmentPackage lookup section."
}

$resolver = @'
    let quizSnapshot = await db.collection("quizzes").doc(quizId).get();

    // 1. Legacy compatibility: some historical records stored a public `id`
    // field that is not the Firestore document ID.
    if (!quizSnapshot.exists) {
      const legacyByStoredId = await db
        .collection("quizzes")
        .where("id", "==", quizId)
        .limit(1)
        .get();

      if (!legacyByStoredId.empty) {
        quizSnapshot = legacyByStoredId.docs[0];
      }
    }

    // 2. Stale lesson reference compatibility.
    // If a lesson still contains an old/non-canonical quizId, locate the
    // current published lesson quiz through its canonical lessonId.
    if (!quizSnapshot.exists) {
      const staleLessonLinks = await db
        .collection("lessons")
        .where("quizId", "==", quizId)
        .limit(10)
        .get();

      for (const lessonDoc of staleLessonLinks.docs) {
        const linkedQuiz = await db
          .collection("quizzes")
          .where("lessonId", "==", lessonDoc.id)
          .where("status", "==", "published")
          .limit(1)
          .get();

        if (!linkedQuiz.empty) {
          quizSnapshot = linkedQuiz.docs[0];

          await lessonDoc.ref.update({
            quizId: quizSnapshot.id,
            updatedAt: FieldValue.serverTimestamp(),
          }).catch((error) => {
            console.warn("Could not repair stale lesson quizId.", error);
          });

          break;
        }
      }
    }

    // 3. Stale module reference compatibility.
    // This protects older module-level progression records as well.
    if (!quizSnapshot.exists) {
      const staleModuleLinks = await db
        .collection("modules")
        .where("quizId", "==", quizId)
        .limit(10)
        .get();

      for (const moduleDoc of staleModuleLinks.docs) {
        const linkedQuiz = await db
          .collection("quizzes")
          .where("moduleId", "==", moduleDoc.id)
          .where("status", "==", "published")
          .limit(1)
          .get();

        if (!linkedQuiz.empty) {
          quizSnapshot = linkedQuiz.docs[0];

          await moduleDoc.ref.update({
            quizId: quizSnapshot.id,
            updatedAt: FieldValue.serverTimestamp(),
          }).catch((error) => {
            console.warn("Could not repair stale module quizId.", error);
          });

          break;
        }
      }
    }

    if (!quizSnapshot.exists) {
      console.error("Assessment resolution failed.", {
        requestedQuizId: quizId,
        uid,
      });

      throw new HttpsError(
        "not-found",
        "Assessment not found. The lesson or module is linked to a quiz that no longer exists. Ask the tutor to select or regenerate the lesson quiz."
      );
    }

    const quizData = {
      ...(quizSnapshot.data() ?? {}),
      id: quizSnapshot.id,
    } as Record<string, unknown>;

'@

$functions = $functions.Substring(0, $start) + $resolver + $functions.Substring($end)

# Remove duplicate canonical repair block if an earlier patch inserted one.
$duplicateStart = '    // Best-effort canonical assessment reference repair.'
$dupIndex = $functions.IndexOf($duplicateStart)
if ($dupIndex -ge 0) {
  $dupEndMarker = '    const courseUnitId = asText('
  $dupEnd = $functions.IndexOf($dupEndMarker, $dupIndex)
  if ($dupEnd -gt $dupIndex) {
    $functions = $functions.Substring(0, $dupIndex) + $functions.Substring($dupEnd)
  }
}

Save-Utf8NoBom $functionPath $functions

# ---------------------------------------------------------------------------
# FRONTEND: replace the entire assessment rules block with clean Unicode text.
# Also keep canonical attempt filtering if present.
# ---------------------------------------------------------------------------

$entry = Get-Content $entryPath -Raw

# Canonical attempt ID filtering.
$entry = $entry.Replace(
  'studentAttempts.filter((attempt) => attempt.quizId === quizId)',
  'studentAttempts.filter((attempt) => attempt.quizId === quizData.id)'
)

# Repair mojibake globally first.
$entry = $entry.Replace("â€¢", "•")
$entry = $entry.Replace("â€“", "–")
$entry = $entry.Replace("â€”", "—")
$entry = $entry.Replace("â€™", "’")

# Handle double-encoded remnants frequently produced by Windows copy/paste.
$entry = $entry.Replace("Ã¢â‚¬Â¢", "•")
$entry = $entry.Replace("Ã¢â‚¬â€œ", "–")
$entry = $entry.Replace("Ã¢â‚¬â„¢", "’")

# If the rules are literal list items in JSX, normalize their visible text.
$rules = @(
  "Answer all questions before submitting.",
  "Do not refresh the browser during the assessment.",
  "The timer starts immediately after you begin.",
  "Submit before the time expires.",
  "Your score will be recorded after submission."
)

foreach ($rule in $rules) {
  $escaped = [regex]::Escape($rule)
  $entry = [regex]::Replace(
    $entry,
    '(?:â€¢|Ã¢â‚¬Â¢|•)?\s*' + $escaped,
    '• ' + $rule
  )
}

Save-Utf8NoBom $entryPath $entry

Write-Host "`nFinal assessment resolver + UTF-8 repair applied." -ForegroundColor Green

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
}

Write-Host "`n===== DEPLOY THIS PATCH =====" -ForegroundColor Yellow
Write-Host 'firebase deploy --only "functions:getStudentAssessmentPackage,hosting"' -ForegroundColor White

Write-Host "`nIMPORTANT:" -ForegroundColor Yellow
Write-Host "After deployment, hard-refresh the assessment page with Ctrl+Shift+R." -ForegroundColor White
Write-Host "If the assessment still says not found, the quiz truly does not exist and the tutor must select/regenerate a quiz for that lesson." -ForegroundColor White
