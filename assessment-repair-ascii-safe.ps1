param(
  [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\package.json")) {
  throw "Run this script from the Medical Elites LMS project root."
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = ".\assessment-resolution-ascii-backup-$stamp"
New-Item -ItemType Directory -Path $backup -Force | Out-Null

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$utf8Strict = New-Object System.Text.UTF8Encoding($false, $true)
$cp1252 = [System.Text.Encoding]::GetEncoding(1252)

function Save-Utf8NoBom([string]$Path, [string]$Content) {
  $resolved = (Resolve-Path $Path).Path
  $Content = $Content.TrimStart([char]0xFEFF)
  [System.IO.File]::WriteAllText($resolved, $Content, $utf8NoBom)
}

function Backup-One([string]$Path) {
  if (-not (Test-Path $Path)) { return }

  $relative = $Path
  if ($relative.StartsWith(".\")) {
    $relative = $relative.Substring(2)
  }

  $target = Join-Path $backup $relative
  $dir = Split-Path $target -Parent

  if ($dir) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }

  Copy-Item $Path $target -Force
}

function Repair-MojibakeLine([string]$Line) {
  # Only touch lines showing common mojibake lead characters:
  # U+00E2 = "a with circumflex" and U+00C3 = "A with tilde".
  if (
    -not $Line.Contains([char]0x00E2) -and
    -not $Line.Contains([char]0x00C3)
  ) {
    return $Line
  }

  $current = $Line

  for ($i = 0; $i -lt 3; $i++) {
    try {
      $bytes = $cp1252.GetBytes($current)
      $candidate = $utf8Strict.GetString($bytes)

      if ($candidate -eq $current) {
        break
      }

      $current = $candidate
    }
    catch {
      break
    }
  }

  return $current
}

$functionPath = ".\functions\src\index.ts"
$entryPath = ".\src\pages\AssessmentEntryPage.tsx"

Backup-One $functionPath
Backup-One $entryPath

Write-Host "Backups created at $backup" -ForegroundColor Green

# ===========================================================================
# BACKEND: resilient assessment resolver
# ===========================================================================

$functions = Get-Content $functionPath -Raw

$functionAnchor = "export const getStudentAssessmentPackage = onCall("
$functionStart = $functions.IndexOf($functionAnchor)

if ($functionStart -lt 0) {
  throw "STOP: getStudentAssessmentPackage was not found."
}

$lookupStartA = '    let quizSnapshot = await db.collection("quizzes").doc(quizId).get();'
$lookupStartB = '    const quizSnapshot = await db.collection("quizzes").doc(quizId).get();'

$lookupStart = $functions.IndexOf($lookupStartA, $functionStart)
if ($lookupStart -lt 0) {
  $lookupStart = $functions.IndexOf($lookupStartB, $functionStart)
}

$publishedMarker = '    if (quizData.status !== "published") {'
$publishedIndex = $functions.IndexOf($publishedMarker, $lookupStart)

if ($lookupStart -lt 0 -or $publishedIndex -lt 0) {
  throw "STOP: assessment lookup section could not be located."
}

$resolver = @'
    let quizSnapshot = await db.collection("quizzes").doc(quizId).get();

    // Compatibility 1: historical records can store a public id that differs
    // from the Firestore document id.
    if (!quizSnapshot.exists) {
      const storedIdMatch = await db
        .collection("quizzes")
        .where("id", "==", quizId)
        .limit(1)
        .get();

      if (!storedIdMatch.empty) {
        quizSnapshot = storedIdMatch.docs[0];
      }
    }

    // Compatibility 2: a stale lesson quizId can be resolved through the
    // lesson document and the quiz.lessonId relationship.
    if (!quizSnapshot.exists) {
      const staleLessonLinks = await db
        .collection("lessons")
        .where("quizId", "==", quizId)
        .limit(10)
        .get();

      for (const lessonDoc of staleLessonLinks.docs) {
        const lessonQuizMatch = await db
          .collection("quizzes")
          .where("lessonId", "==", lessonDoc.id)
          .where("status", "==", "published")
          .limit(1)
          .get();

        if (!lessonQuizMatch.empty) {
          quizSnapshot = lessonQuizMatch.docs[0];

          try {
            await lessonDoc.ref.update({
              quizId: quizSnapshot.id,
              updatedAt: FieldValue.serverTimestamp(),
            });
          } catch (repairError) {
            console.warn("Could not repair stale lesson quizId.", repairError);
          }

          break;
        }
      }
    }

    // Compatibility 3: do the same for old module assessment references.
    if (!quizSnapshot.exists) {
      const staleModuleLinks = await db
        .collection("modules")
        .where("quizId", "==", quizId)
        .limit(10)
        .get();

      for (const moduleDoc of staleModuleLinks.docs) {
        const moduleQuizMatch = await db
          .collection("quizzes")
          .where("moduleId", "==", moduleDoc.id)
          .where("status", "==", "published")
          .limit(1)
          .get();

        if (!moduleQuizMatch.empty) {
          quizSnapshot = moduleQuizMatch.docs[0];

          try {
            await moduleDoc.ref.update({
              quizId: quizSnapshot.id,
              updatedAt: FieldValue.serverTimestamp(),
            });
          } catch (repairError) {
            console.warn("Could not repair stale module quizId.", repairError);
          }

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
        "Assessment not found. This lesson or module is linked to a quiz that no longer exists. Ask the tutor to select or regenerate the required quiz."
      );
    }

    const quizData = {
      ...(quizSnapshot.data() ?? {}),
      id: quizSnapshot.id,
    } as Record<string, any>;

'@

$functions = (
  $functions.Substring(0, $lookupStart) +
  $resolver +
  $functions.Substring($publishedIndex)
)

# Remove an older optional repair block if a prior patch inserted it.
$oldRepairMarker = "    // Best-effort canonical assessment reference repair."
$oldRepairIndex = $functions.IndexOf($oldRepairMarker, $functionStart)

if ($oldRepairIndex -ge 0) {
  $courseMarker = "    const courseUnitId = asText("
  $courseIndex = $functions.IndexOf($courseMarker, $oldRepairIndex)

  if ($courseIndex -gt $oldRepairIndex) {
    $functions = (
      $functions.Substring(0, $oldRepairIndex) +
      $functions.Substring($courseIndex)
    )
  }
}

Save-Utf8NoBom $functionPath $functions

# ===========================================================================
# FRONTEND: canonical attempt filtering + encoding repair on assessment rules
# ===========================================================================

$entry = Get-Content $entryPath -Raw

$entry = $entry.Replace(
  'studentAttempts.filter((attempt) => attempt.quizId === quizId)',
  'studentAttempts.filter((attempt) => attempt.quizId === quizData.id)'
)

$ruleSentences = @(
  "Answer all questions before submitting.",
  "Do not refresh the browser during the assessment.",
  "The timer starts immediately after you begin.",
  "Submit before the time expires.",
  "Your score will be recorded after submission."
)

$lines = $entry -split "`r?`n"

for ($i = 0; $i -lt $lines.Length; $i++) {
  foreach ($sentence in $ruleSentences) {
    if ($lines[$i].Contains($sentence)) {
      $lines[$i] = Repair-MojibakeLine $lines[$i]
      break
    }
  }
}

$entry = [string]::Join("`r`n", $lines)
Save-Utf8NoBom $entryPath $entry

Write-Host "`nAssessment resolver and rule encoding repair applied." -ForegroundColor Green

# ===========================================================================
# VALIDATION
# ===========================================================================

if (-not $SkipValidation) {
  Write-Host "`n===== FRONTEND TYPECHECK =====" -ForegroundColor Cyan
  npm run typecheck
  if ($LASTEXITCODE -ne 0) {
    throw "Frontend typecheck failed."
  }

  Write-Host "`n===== FRONTEND BUILD =====" -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) {
    throw "Frontend build failed."
  }

  Write-Host "`n===== FUNCTIONS BUILD =====" -ForegroundColor Cyan
  Push-Location ".\functions"
  try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
      throw "Functions build failed."
    }
  }
  finally {
    Pop-Location
  }
}

Write-Host "`n===== VERIFY RULE TEXT =====" -ForegroundColor Cyan
Select-String `
  -Path $entryPath `
  -Pattern "Answer all questions|Do not refresh|timer starts|Submit before|score will be recorded" `
  -Context 0,0

Write-Host "`n===== VERIFY RESOLVER =====" -ForegroundColor Cyan
Select-String `
  -Path $functionPath `
  -Pattern "storedIdMatch|staleLessonLinks|staleModuleLinks|Assessment resolution failed" `
  -Context 0,2

Write-Host "`nAll local checks completed." -ForegroundColor Green
Write-Host "`nDeploy with:" -ForegroundColor Yellow
Write-Host 'firebase deploy --only "functions:getStudentAssessmentPackage,hosting"' -ForegroundColor White
Write-Host "`nThen hard refresh the live page with Ctrl+Shift+R." -ForegroundColor Yellow
