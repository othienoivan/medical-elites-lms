param(
  [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\package.json")) {
  throw "Run this script from the Medical Elites LMS project root."
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = ".\quiz-timer-fix-backup-$stamp"
New-Item -ItemType Directory -Path $backup -Force | Out-Null

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Save-NoBom([string]$Path, [string]$Content) {
  $resolved = (Resolve-Path $Path).Path
  $Content = $Content.TrimStart([char]0xFEFF)
  [System.IO.File]::WriteAllText($resolved, $Content, $utf8NoBom)
}

function Backup-One([string]$Path) {
  if (-not (Test-Path $Path)) { return }
  $relative = $Path
  if ($relative.StartsWith(".\")) { $relative = $relative.Substring(2) }
  $target = Join-Path $backup $relative
  $dir = Split-Path $target -Parent
  if ($dir) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  Copy-Item $Path $target -Force
}

$takeQuizPath = ".\src\pages\TakeQuizPage.tsx"
$lessonBuilderPath = ".\src\pages\LessonBuilderPage.tsx"

Backup-One $takeQuizPath
Backup-One $lessonBuilderPath

Write-Host "Backups created at $backup" -ForegroundColor Green

# ===========================================================================
# 1. TAKE QUIZ PAGE
#    Make timer initialize for current and legacy quizzes.
# ===========================================================================

$take = Get-Content $takeQuizPath -Raw

$oldTimerInit = @'
        if (data?.timeLimitMinutes) {
          setSecondsRemaining(data.timeLimitMinutes * 60);
        }
'@

$newTimerInit = @'
        if (data) {
          const resolvedTimeLimitMinutes = Math.max(
            1,
            Math.floor(
              Number(
                data.timeLimitMinutes ??
                  (data as Quiz & { durationMinutes?: number }).durationMinutes ??
                  30,
              ),
            ),
          );

          setSecondsRemaining(resolvedTimeLimitMinutes * 60);
        }
'@

if ($take.Contains($oldTimerInit)) {
  $take = $take.Replace($oldTimerInit, $newTimerInit)
} elseif ($take -notmatch "resolvedTimeLimitMinutes") {
  throw "STOP: TakeQuizPage timer initialization block was not found."
}

# Make timer effect stable: one interval per running attempt, not recreated each second.
$oldTimerEffect = @'
  useEffect(() => {
    if (!quiz || submitted || secondsRemaining <= 0) return;

    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          submitHandlerRef.current(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [quiz, submitted, secondsRemaining]);
'@

$newTimerEffect = @'
  useEffect(() => {
    if (!quiz || submitted) return;

    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          void submitHandlerRef.current(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [quiz, submitted]);
'@

if ($take.Contains($oldTimerEffect)) {
  $take = $take.Replace($oldTimerEffect, $newTimerEffect)
} else {
  # Older variants may call handleSubmit directly. Replace those too.
  $oldTimerEffect2 = @'
  useEffect(() => {
    if (!quiz || submitted || secondsRemaining <= 0) return;

    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          handleSubmit(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [quiz, submitted, secondsRemaining]);
'@

  $newTimerEffect2 = @'
  useEffect(() => {
    if (!quiz || submitted) return;

    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          void submitHandlerRef.current(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [quiz, submitted]);
'@

  if ($take.Contains($oldTimerEffect2)) {
    $take = $take.Replace($oldTimerEffect2, $newTimerEffect2)
  }
}

Save-NoBom $takeQuizPath $take

# ===========================================================================
# 2. LESSON BUILDER
#    Add configurable timer for lesson quizzes and ensure AI-created quizzes
#    persist a real timeLimitMinutes value.
# ===========================================================================

$builder = Get-Content $lessonBuilderPath -Raw

if ($builder -notmatch "quizTimeLimitMinutes") {
  $stateNeedle = '  const [quizPassMark, setQuizPassMark] = useState(80);'
  $stateReplacement = @'
  const [quizPassMark, setQuizPassMark] = useState(80);
  const [quizTimeLimitMinutes, setQuizTimeLimitMinutes] = useState(30);
'@

  if (-not $builder.Contains($stateNeedle)) {
    throw "STOP: LessonBuilder quizPassMark state was not found."
  }

  $builder = $builder.Replace($stateNeedle, $stateReplacement)
}

# When loading a lesson, derive timer from its linked quiz where possible.
# We avoid adding new async reads here; selected quiz data is already available through useQuizzes.
# The dropdown selection will update the time field below.

# Add timeLimitMinutes to AI quiz update payload.
$updatePayloadNeedle = @'
          passMark: normalizedPassMark,
          status: "published",
'@

$updatePayloadReplacement = @'
          passMark: normalizedPassMark,
          timeLimitMinutes: Math.max(1, Math.floor(quizTimeLimitMinutes || 30)),
          status: "published",
'@

if ($builder.Contains($updatePayloadNeedle)) {
  $builder = $builder.Replace($updatePayloadNeedle, $updatePayloadReplacement)
}

# Add timeLimitMinutes to AI quiz creation payload near attemptsAllowed.
$createPayloadNeedle = @'
          passMark: normalizedPassMark,
          attemptsAllowed: 3,
'@

$createPayloadReplacement = @'
          passMark: normalizedPassMark,
          timeLimitMinutes: Math.max(1, Math.floor(quizTimeLimitMinutes || 30)),
          attemptsAllowed: 3,
'@

if ($builder.Contains($createPayloadNeedle)) {
  $builder = $builder.Replace($createPayloadNeedle, $createPayloadReplacement)
}

# Add timeLimitMinutes when saving lesson-linked existing quiz.
$saveExistingNeedle = @'
          passMark: normalizedPassMark,
          status: "published",
'@

$saveExistingReplacement = @'
          passMark: normalizedPassMark,
          timeLimitMinutes: Math.max(1, Math.floor(quizTimeLimitMinutes || 30)),
          status: "published",
'@

# This may already have been globally replaced above; safe if not.
if ($builder.Contains($saveExistingNeedle)) {
  $builder = $builder.Replace($saveExistingNeedle, $saveExistingReplacement)
}

# Enhance quiz selection so the time limit follows the selected quiz.
$selectNeedle = '                    onChange={(event) => setQuizId(event.target.value)}'
$selectReplacement = @'
                    onChange={(event) => {
                      const selectedQuizId = event.target.value;
                      setQuizId(selectedQuizId);

                      const selectedQuiz = quizzes.find(
                        (quiz) => quiz.id === selectedQuizId,
                      );

                      if (selectedQuiz?.timeLimitMinutes) {
                        setQuizTimeLimitMinutes(
                          Math.max(
                            1,
                            Math.floor(Number(selectedQuiz.timeLimitMinutes)),
                          ),
                        );
                      }
                    }}
'@

if ($builder.Contains($selectNeedle)) {
  $builder = $builder.Replace($selectNeedle, $selectReplacement)
}

# Add tutor-visible time limit field after the lesson pass mark field by
# locating the quizPassMark input section and inserting before the next action area.
if ($builder -notmatch "Lesson Quiz Time Limit") {
  $passMarkPattern = '(?s)(<label className="block text-sm font-semibold text-slate-700">\s*(?:Required )?Pass Mark.*?</label>)'
  $m = [regex]::Match($builder, $passMarkPattern)

  if ($m.Success) {
    $timeField = @'

                <label className="block text-sm font-semibold text-slate-700">
                  Lesson Quiz Time Limit (minutes)
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={quizTimeLimitMinutes}
                    onChange={(event) =>
                      setQuizTimeLimitMinutes(
                        Math.max(1, Number(event.target.value) || 1),
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
                  />
                </label>
'@
    $builder = (
      $builder.Substring(0, $m.Index + $m.Length) +
      $timeField +
      $builder.Substring($m.Index + $m.Length)
    )
  } else {
    Write-Host "WARNING: Could not insert visible lesson quiz time-limit field automatically." -ForegroundColor Yellow
  }
}

Save-NoBom $lessonBuilderPath $builder

Write-Host "`nQuiz timer fix applied." -ForegroundColor Green

# ===========================================================================
# VALIDATION
# ===========================================================================

if (-not $SkipValidation) {
  Write-Host "`n===== TYPECHECK =====" -ForegroundColor Cyan
  npm run typecheck
  if ($LASTEXITCODE -ne 0) { throw "Typecheck failed." }

  Write-Host "`n===== BUILD =====" -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "Build failed." }
}

Write-Host "`n===== TIMER CHECK =====" -ForegroundColor Cyan
Select-String `
  -Path $takeQuizPath `
  -Pattern "resolvedTimeLimitMinutes|setInterval|submitHandlerRef.current" `
  -Context 1,3

Write-Host "`n===== LESSON QUIZ TIMER CHECK =====" -ForegroundColor Cyan
Select-String `
  -Path $lessonBuilderPath `
  -Pattern "quizTimeLimitMinutes|Lesson Quiz Time Limit|timeLimitMinutes" `
  -Context 1,3

Write-Host "`nDeploy with:" -ForegroundColor Yellow
Write-Host 'firebase deploy --only hosting' -ForegroundColor White
