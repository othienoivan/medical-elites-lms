param(
  [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\package.json")) {
  throw "Run this script from the Medical Elites LMS project root."
}

$ProjectRoot = (Get-Location).Path
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $ProjectRoot "lesson-quiz-progression-backup-$timestamp"
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Full-ProjectPath([string]$Path) {
  if ($Path.StartsWith(".\")) { $Path = $Path.Substring(2) }
  return Join-Path $ProjectRoot $Path
}

function Read-Text([string]$Path) {
  return [System.IO.File]::ReadAllText((Full-ProjectPath $Path))
}

function Write-Text([string]$Path, [string]$Content) {
  $full = Full-ProjectPath $Path
  $dir = Split-Path $full -Parent
  if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  $Content = $Content.TrimStart([char]0xFEFF)
  [System.IO.File]::WriteAllText($full, $Content, $utf8NoBom)
}

function Backup-File([string]$Path) {
  $full = Full-ProjectPath $Path
  if (-not (Test-Path $full)) { return }
  $relative = $Path.TrimStart('.','\')
  $target = Join-Path $backupRoot $relative
  $dir = Split-Path $target -Parent
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  Copy-Item $full $target -Force
}

$targets = @(
  ".\src\models\Lesson.tsx",
  ".\src\models\Quiz.tsx",
  ".\src\pages\LessonBuilderPage.tsx",
  ".\src\pages\LessonPage.tsx",
  ".\src\pages\TakeQuizPage.tsx",
  ".\functions\src\index.ts"
)
$targets | ForEach-Object { Backup-File $_ }
Write-Host "Backups created at $backupRoot" -ForegroundColor Green

# ---------------------------------------------------------------------------
# 1. Domain models
# ---------------------------------------------------------------------------
$lessonModelPath = ".\src\models\Lesson.tsx"
$lessonModel = Read-Text $lessonModelPath
if ($lessonModel -notmatch 'quizRequired\?: boolean;') {
  $lessonModel = $lessonModel.Replace(
    '  quizId?: string;',
    "  quizId?: string;`r`n  quizRequired?: boolean;`r`n  quizPassMark?: number;"
  )
}
Write-Text $lessonModelPath $lessonModel

$quizModelPath = ".\src\models\Quiz.tsx"
$quizModel = Read-Text $quizModelPath
if ($quizModel -notmatch 'lessonId\?: string;') {
  $quizModel = $quizModel.Replace(
    '  moduleTitle?: string;',
    "  moduleTitle?: string;`r`n  lessonId?: string;`r`n  lessonTitle?: string;"
  )
}
Write-Text $quizModelPath $quizModel

# ---------------------------------------------------------------------------
# 2. Trusted client API for lesson progression
# ---------------------------------------------------------------------------
$lessonProgressClient = @'
import { httpsCallable } from "firebase/functions";

import { functions } from "../config/firebase";

export type LessonModuleProgress = {
  moduleId: string;
  completedLessonIds: string[];
  unlockedLessonIds: string[];
};

export async function getLessonModuleProgress(
  moduleId: string,
): Promise<LessonModuleProgress> {
  const callable = httpsCallable<
    { moduleId: string },
    LessonModuleProgress
  >(functions, "getLessonModuleProgress");

  return (await callable({ moduleId })).data;
}

export type CompleteLessonLearningResult = {
  lessonId: string;
  completed: boolean;
  requiresQuiz: boolean;
  quizId?: string;
  passMark?: number;
};

export async function completeLessonLearning(
  lessonId: string,
): Promise<CompleteLessonLearningResult> {
  const callable = httpsCallable<
    { lessonId: string },
    CompleteLessonLearningResult
  >(functions, "completeLessonLearning");

  return (await callable({ lessonId })).data;
}
'@
Write-Text ".\src\firebase\lessonProgress.ts" $lessonProgressClient

# ---------------------------------------------------------------------------
# 3. Lesson Builder: require/select quiz + mandatory pass mark
# ---------------------------------------------------------------------------
$builderPath = ".\src\pages\LessonBuilderPage.tsx"
$builder = Read-Text $builderPath

if ($builder -notmatch 'useQuizzes from "../hooks/useQuizzes"') {
  $builder = $builder.Replace(
    'import { getLessonById, updateLesson } from "../firebase/lessons";',
    "import { getLessonById, updateLesson } from \"../firebase/lessons\";`r`nimport { updateQuiz } from \"../firebase/quizzes\";`r`nimport useQuizzes from \"../hooks/useQuizzes\";"
  )
}

if ($builder -notmatch 'const \{ quizzes \} = useQuizzes\(\);') {
  $builder = $builder.Replace(
    '  const { lessonId } = useParams();',
    "  const { lessonId } = useParams();`r`n  const { quizzes } = useQuizzes();"
  )
}

if ($builder -notmatch 'const \[quizRequired, setQuizRequired\]') {
  $builder = $builder.Replace(
    '  const [saving, setSaving] = useState(false);',
    @'
  const [saving, setSaving] = useState(false);
  const [quizRequired, setQuizRequired] = useState(false);
  const [quizId, setQuizId] = useState("");
  const [quizPassMark, setQuizPassMark] = useState(80);
'@
  )
}

if ($builder -notmatch 'setQuizRequired\(lesson\.quizRequired') {
  $builder = $builder.Replace(
    '        setBlocks(lesson.blocks || []);',
    @'
        setBlocks(lesson.blocks || []);
        setQuizRequired(lesson.quizRequired === true || lesson.completionCriteria?.passQuiz === true);
        setQuizId(lesson.quizId || "");
        setQuizPassMark(Math.max(0, Math.min(100, Number(lesson.quizPassMark ?? 80))));
'@
  )
}

# Replace both save calls with assessment-aware save sequence.
$oldSave = '      await updateLesson(lessonId, { blocks });'
$newSave = @'
      if (quizRequired && !quizId) {
        alert("Select a published quiz before requiring a lesson assessment.");
        return;
      }

      const normalizedPassMark = Math.max(0, Math.min(100, Number(quizPassMark || 0)));

      await updateLesson(lessonId, {
        blocks,
        quizRequired,
        quizId: quizRequired ? quizId : "",
        quizPassMark: quizRequired ? normalizedPassMark : undefined,
        completionCriteria: {
          passQuiz: quizRequired,
        },
      });

      if (quizRequired && quizId) {
        await updateQuiz(quizId, {
          assessmentType: "lesson-quiz",
          lessonId,
          lessonTitle,
          courseUnitId,
          passMark: normalizedPassMark,
          status: "published",
        });
      }
'@
if ($builder.Contains($oldSave)) {
  $builder = $builder.Replace($oldSave, $newSave)
}

if ($builder -notmatch 'Lesson progression assessment') {
  $assessmentCard = @'

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-bold text-amber-950">Lesson progression assessment</h3>
            <p className="mt-1 text-sm text-amber-800">
              Require the learner to pass a quiz before the next lesson unlocks.
            </p>

            <label className="mt-4 flex items-center gap-3 font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={quizRequired}
                onChange={(event) => setQuizRequired(event.target.checked)}
              />
              Require a quiz before progressing to the next lesson
            </label>

            {quizRequired && (
              <div className="mt-4 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Lesson Quiz
                  <select
                    value={quizId}
                    onChange={(event) => setQuizId(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
                  >
                    <option value="">Select a published quiz</option>
                    {quizzes
                      .filter((quiz) => quiz.status === "published")
                      .filter((quiz) => !courseUnitId || !quiz.courseUnitId || quiz.courseUnitId === courseUnitId)
                      .map((quiz) => (
                        <option key={quiz.id} value={quiz.id}>
                          {quiz.title} ({quiz.passMark}% current pass mark)
                        </option>
                      ))}
                  </select>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Mandatory Pass Mark (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quizPassMark}
                    onChange={(event) =>
                      setQuizPassMark(
                        Math.max(0, Math.min(100, Number(event.target.value))),
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
                  />
                </label>

                <p className="text-xs leading-5 text-amber-800">
                  The quiz's existing maximum-attempt setting remains authoritative. If the learner exhausts all attempts without reaching this pass mark, the next lesson stays locked.
                </p>
              </div>
            )}
          </div>
'@
  $anchor = @'
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">
              Lesson Blocks
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Total blocks: {blocks.length}
            </p>
          </div>
'@
  if (-not $builder.Contains($anchor)) { throw "Lesson Builder side-panel anchor not found." }
  $builder = $builder.Replace($anchor, $anchor + $assessmentCard)
}
Write-Text $builderPath $builder

# ---------------------------------------------------------------------------
# 4. Backend: lesson progression callables + lesson-aware quiz submission
# ---------------------------------------------------------------------------
$functionsPath = ".\functions\src\index.ts"
$functionsContent = Read-Text $functionsPath

# Add lessonId to persisted attempt and stop lesson quizzes auto-completing modules.
if ($functionsContent -notmatch 'const lessonId = asText\(quiz\.lessonId') {
  $functionsContent = $functionsContent.Replace(
    '      const moduleId = asText(quiz.moduleId ?? data.moduleId, 200);',
    @'
      const lessonId = asText(quiz.lessonId ?? data.lessonId, 200);
      const moduleId = asText(quiz.moduleId ?? data.moduleId, 200);
'@
  )
}

$functionsContent = $functionsContent.Replace(
  '      if (passed && moduleId) {',
  '      if (passed && (lessonId || moduleId)) {'
)

if ($functionsContent -notmatch 'lessonId: lessonId \|\| null') {
  $functionsContent = $functionsContent.Replace(
    '        moduleId: moduleId || null,',
    "        lessonId: lessonId || null,`r`n        lessonTitle: asText(quiz.lessonTitle ?? data.lessonTitle, 500) || null,`r`n        moduleId: moduleId || null,"
  )
}

$oldEnrollmentWrite = @'
      for (const enrollmentRef of enrollmentRefs.values()) {
        transaction.set(enrollmentRef, {
          completedModules: FieldValue.arrayUnion(moduleId),
          startedModules: FieldValue.arrayUnion(moduleId),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      }
'@
$newEnrollmentWrite = @'
      for (const enrollmentRef of enrollmentRefs.values()) {
        const progressionUpdate: Record<string, unknown> = {
          updatedAt: FieldValue.serverTimestamp(),
        };

        if (lessonId) {
          progressionUpdate.completedLessons = FieldValue.arrayUnion(lessonId);
          progressionUpdate.startedLessons = FieldValue.arrayUnion(lessonId);
          if (moduleId) progressionUpdate.startedModules = FieldValue.arrayUnion(moduleId);
        } else if (moduleId) {
          progressionUpdate.completedModules = FieldValue.arrayUnion(moduleId);
          progressionUpdate.startedModules = FieldValue.arrayUnion(moduleId);
        }

        transaction.set(enrollmentRef, progressionUpdate, { merge: true });
      }
'@
if ($functionsContent.Contains($oldEnrollmentWrite)) {
  $functionsContent = $functionsContent.Replace($oldEnrollmentWrite, $newEnrollmentWrite)
}

if ($functionsContent -notmatch 'export const getLessonModuleProgress = onCall') {
  $serverBlock = @'

/** Return authoritative lesson completion/unlock state for a student's module. */
export const getLessonModuleProgress = onCall(
  { region: "us-central1", timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Please sign in to view lesson progress.");
    }

    const uid = request.auth.uid;
    const moduleId = asText((request.data as { moduleId?: unknown } | undefined)?.moduleId, 200);
    if (!moduleId) throw new HttpsError("invalid-argument", "A module ID is required.");

    const profile = await db.doc(`users/${uid}`).get();
    if (!profile.exists || profile.get("role") !== "student" || profile.get("isActive") === false) {
      throw new HttpsError("permission-denied", "Only active students can access lesson progression.");
    }

    const lessonsSnapshot = await db.collection("lessons").where("moduleId", "==", moduleId).get();
    const lessons = lessonsSnapshot.docs
      .filter((item) => item.get("isPublished") === true || item.get("published") === true)
      .sort((a, b) => finiteNumber(a.get("order"), 0) - finiteNumber(b.get("order"), 0));

    const [byUser, byAuthUid, byStudentId] = await Promise.all([
      db.collection("enrollments").where("userId", "==", uid).get(),
      db.collection("enrollments").where("studentAuthUid", "==", uid).get(),
      db.collection("enrollments").where("studentId", "==", uid).get(),
    ]);

    const enrollmentDocs = [...byUser.docs, ...byAuthUid.docs, ...byStudentId.docs];
    const completed = new Set<string>();
    for (const enrollment of enrollmentDocs) {
      const values = enrollment.get("completedLessons");
      if (Array.isArray(values)) {
        for (const value of values) if (typeof value === "string") completed.add(value);
      }
    }

    const unlocked = new Set<string>();
    if (lessons.length > 0) unlocked.add(lessons[0].id);
    for (let index = 1; index < lessons.length; index += 1) {
      if (completed.has(lessons[index - 1].id)) unlocked.add(lessons[index].id);
    }

    return {
      moduleId,
      completedLessonIds: [...completed],
      unlockedLessonIds: [...unlocked],
    };
  },
);

/** Complete one lesson after validating its mandatory lesson quiz, if configured. */
export const completeLessonLearning = onCall(
  { region: "us-central1", timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Please sign in before completing this lesson.");
    }

    const uid = request.auth.uid;
    const lessonId = asText((request.data as { lessonId?: unknown } | undefined)?.lessonId, 200);
    if (!lessonId) throw new HttpsError("invalid-argument", "A lesson ID is required.");

    const profile = await db.doc(`users/${uid}`).get();
    if (!profile.exists || profile.get("role") !== "student" || profile.get("isActive") === false) {
      throw new HttpsError("permission-denied", "Only active students can complete lessons.");
    }

    const lessonSnapshot = await db.doc(`lessons/${lessonId}`).get();
    if (!lessonSnapshot.exists) throw new HttpsError("not-found", "Lesson not found.");
    const lesson = lessonSnapshot.data() ?? {};
    const moduleId = asText(lesson.moduleId, 200);
    const courseUnitId = asText(lesson.courseUnitId ?? lesson.courseId, 200);
    const quizRequired = lesson.quizRequired === true || lesson.completionCriteria?.passQuiz === true;
    const configuredQuizId = asText(lesson.quizId, 200);

    if (quizRequired) {
      if (!configuredQuizId) {
        throw new HttpsError("failed-precondition", "This lesson requires a quiz, but no quiz has been assigned. Contact your tutor.");
      }

      const quizSnapshot = await db.doc(`quizzes/${configuredQuizId}`).get();
      if (!quizSnapshot.exists || quizSnapshot.get("status") !== "published") {
        throw new HttpsError("failed-precondition", "The required lesson quiz is not currently available.");
      }

      const requiredPassMark = Math.max(
        0,
        Math.min(100, finiteNumber(lesson.quizPassMark, finiteNumber(quizSnapshot.get("passMark"), 50))),
      );

      const attempts = await db.collection("quizAttempts")
        .where("studentId", "==", uid)
        .where("quizId", "==", configuredQuizId)
        .get();

      const passed = attempts.docs.some((item) => {
        const attempt = item.data();
        return attempt.completed !== false
          && finiteNumber(attempt.finalPercentage ?? attempt.percentage, 0) >= requiredPassMark;
      });

      if (!passed) {
        return {
          lessonId,
          completed: false,
          requiresQuiz: true,
          quizId: configuredQuizId,
          passMark: requiredPassMark,
        };
      }
    }

    const [byUser, byAuthUid, byStudentId] = await Promise.all([
      db.collection("enrollments").where("userId", "==", uid).get(),
      db.collection("enrollments").where("studentAuthUid", "==", uid).get(),
      db.collection("enrollments").where("studentId", "==", uid).get(),
    ]);

    const refs = new Map<string, FirebaseFirestore.DocumentReference>();
    for (const snapshot of [byUser, byAuthUid, byStudentId]) {
      for (const item of snapshot.docs) {
        const enrollment = item.data();
        const belongs = !courseUnitId
          || enrollment.courseId === courseUnitId
          || enrollment.courseUnitId === courseUnitId
          || (Array.isArray(enrollment.courseUnitIds) && enrollment.courseUnitIds.includes(courseUnitId));
        if (belongs) refs.set(item.ref.path, item.ref);
      }
    }

    if (refs.size === 0) {
      throw new HttpsError("failed-precondition", "Active enrolment not found for this lesson.");
    }

    const batch = db.batch();
    for (const ref of refs.values()) {
      batch.set(ref, {
        completedLessons: FieldValue.arrayUnion(lessonId),
        startedLessons: FieldValue.arrayUnion(lessonId),
        ...(moduleId ? { startedModules: FieldValue.arrayUnion(moduleId) } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    await batch.commit();

    return {
      lessonId,
      completed: true,
      requiresQuiz: false,
    };
  },
);
'@

  $anchor = '/** Persist completion of a module after validating any required quiz. */'
  $index = $functionsContent.IndexOf($anchor)
  if ($index -lt 0) { throw "Could not locate completeModuleLearning anchor in functions/src/index.ts." }
  $functionsContent = $functionsContent.Insert($index, $serverBlock + "`r`n")
}
Write-Text $functionsPath $functionsContent

# ---------------------------------------------------------------------------
# 5. Student LessonPage: authoritative locking and lesson-completion buttons
# ---------------------------------------------------------------------------
$lessonPagePath = ".\src\pages\LessonPage.tsx"
$lessonPage = Read-Text $lessonPagePath

if ($lessonPage -notmatch 'getLessonModuleProgress') {
  $lessonPage = $lessonPage.Replace(
    'import { completeModuleLearning } from "../firebase/enrollments";',
    "import { completeModuleLearning } from \"../firebase/enrollments\";`r`nimport { completeLessonLearning, getLessonModuleProgress } from \"../firebase/lessonProgress\";"
  )
}

if ($lessonPage -notmatch 'completedLessonIds') {
  $lessonPage = $lessonPage.Replace(
    '  const [completingModule, setCompletingModule] = useState(false);',
    @'
  const [completingModule, setCompletingModule] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [unlockedLessonIds, setUnlockedLessonIds] = useState<string[]>([]);
'@
  )
}

if ($lessonPage -notmatch 'async function refreshLessonProgress') {
  $insertAfter = @'
  const moduleQuiz = quizzes.find(quiz => quiz.moduleId === moduleId && quiz.status === "published");
'@
  $progressHelpers = @'
  const activeLessonCompleted = Boolean(activeLesson && completedLessonIds.includes(activeLesson.id));
  const activeLessonQuizRequired = Boolean(
    activeLesson && (activeLesson.quizRequired === true || activeLesson.completionCriteria?.passQuiz === true),
  );

  async function refreshLessonProgress() {
    if (!moduleId || scope?.role !== "student") return;
    try {
      const progress = await getLessonModuleProgress(moduleId);
      setCompletedLessonIds(progress.completedLessonIds ?? []);
      setUnlockedLessonIds(progress.unlockedLessonIds ?? []);
    } catch (error) {
      console.error("Failed to load lesson progression:", error);
    }
  }

  async function handleCompleteLesson() {
    if (!activeLesson) return;
    try {
      setCompletingLesson(true);
      const result = await completeLessonLearning(activeLesson.id);
      if (!result.completed && result.requiresQuiz && result.quizId) {
        navigate(`/assessments/quizzes/${result.quizId}`);
        return;
      }
      await refreshLessonProgress();
      if (activeLessonIndex < lessons.length - 1) {
        setActiveLessonIndex((current) => Math.min(current + 1, lessons.length - 1));
      }
    } catch (error) {
      console.error("Failed to complete lesson:", error);
      window.alert(error instanceof Error ? error.message : "Unable to complete this lesson.");
    } finally {
      setCompletingLesson(false);
    }
  }
'@
  if (-not $lessonPage.Contains($insertAfter)) { throw "LessonPage moduleQuiz anchor not found." }
  $lessonPage = $lessonPage.Replace($insertAfter, $insertAfter + "`r`n" + $progressHelpers)
}

# Fetch progression after lessons load.
if ($lessonPage -notmatch 'void refreshLessonProgress\(\);') {
  $lessonPage = $lessonPage.Replace(
    '        setLessons(',
    '        setLessons('
  )
  $lessonPage = $lessonPage.Replace(
    '      } catch (error) {',
    @'
        if (scope.role === "student") {
          const progress = await getLessonModuleProgress(moduleId);
          setCompletedLessonIds(progress.completedLessonIds ?? []);
          setUnlockedLessonIds(progress.unlockedLessonIds ?? []);
        }
      } catch (error) {
'@
  )
}

# Gate sidebar click and show locks.
$oldSidebarButton = @'
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setActiveLessonIndex(index)}
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      index === activeLessonIndex
                        ? "bg-blue-700 text-white"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Lesson {lesson.order}: {lesson.title}
                  </button>
'@
$newSidebarButton = @'
                  <button
                    key={lesson.id}
                    type="button"
                    disabled={scope?.role === "student" && !unlockedLessonIds.includes(lesson.id)}
                    onClick={() => {
                      if (scope?.role !== "student" || unlockedLessonIds.includes(lesson.id)) {
                        setActiveLessonIndex(index);
                      }
                    }}
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      index === activeLessonIndex
                        ? "bg-blue-700 text-white"
                        : scope?.role === "student" && !unlockedLessonIds.includes(lesson.id)
                          ? "cursor-not-allowed bg-slate-100 text-slate-400"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Lesson {lesson.order}: {lesson.title}
                    {scope?.role === "student" && !unlockedLessonIds.includes(lesson.id) ? " · Locked" : ""}
                  </button>
'@
if ($lessonPage.Contains($oldSidebarButton)) {
  $lessonPage = $lessonPage.Replace($oldSidebarButton, $newSidebarButton)
}

# Replace bottom navigation block.
$oldNav = @'
                {activeLessonIndex < lessons.length - 1 ? (
                  <Button onClick={goToNextLesson}>Next Lesson</Button>
                ) : moduleQuiz ? (
                  <Button onClick={() => navigate(`/assessments/quizzes/${moduleQuiz.id}`)}>
                    Attempt Module Quiz ({moduleQuiz.passMark}% pass mark)
                  </Button>
                ) : (
                  <Button disabled={completingModule} onClick={() => void handleCompleteModule()}>
                    {completingModule ? "Completing..." : "Complete Module"}
                  </Button>
                )}
'@
$newNav = @'
                {!activeLessonCompleted ? (
                  activeLessonQuizRequired && activeLesson.quizId ? (
                    <Button onClick={() => navigate(`/assessments/quizzes/${activeLesson.quizId}`)}>
                      Take Lesson Quiz ({activeLesson.quizPassMark ?? "Required"}% pass mark)
                    </Button>
                  ) : (
                    <Button disabled={completingLesson} onClick={() => void handleCompleteLesson()}>
                      {completingLesson ? "Completing..." : "Complete Lesson"}
                    </Button>
                  )
                ) : activeLessonIndex < lessons.length - 1 ? (
                  <Button
                    disabled={scope?.role === "student" && !unlockedLessonIds.includes(lessons[activeLessonIndex + 1]?.id)}
                    onClick={goToNextLesson}
                  >
                    Continue to Next Lesson
                  </Button>
                ) : moduleQuiz && moduleQuiz.assessmentType !== "lesson-quiz" ? (
                  <Button onClick={() => navigate(`/assessments/quizzes/${moduleQuiz.id}`)}>
                    Attempt Module Quiz ({moduleQuiz.passMark}% pass mark)
                  </Button>
                ) : (
                  <Button disabled={completingModule} onClick={() => void handleCompleteModule()}>
                    {completingModule ? "Completing..." : "Complete Module"}
                  </Button>
                )}
'@
if ($lessonPage.Contains($oldNav)) {
  $lessonPage = $lessonPage.Replace($oldNav, $newNav)
} else {
  throw "LessonPage bottom navigation block not found."
}

Write-Text $lessonPagePath $lessonPage

# ---------------------------------------------------------------------------
# 6. Quiz result: lesson quiz returns learner to the module lesson player
# ---------------------------------------------------------------------------
$takeQuizPath = ".\src\pages\TakeQuizPage.tsx"
$takeQuiz = Read-Text $takeQuizPath

# Replace common result-page Back button if exact anchor exists.
$takeQuiz = $takeQuiz.Replace(
  '<Button onClick={() => navigate("/assessments")}>Back to Assessments</Button>',
  '<Button onClick={() => navigate(quiz?.assessmentType === "lesson-quiz" && quiz.moduleId ? `/lesson/${quiz.moduleId}` : "/assessments")}>{quiz?.assessmentType === "lesson-quiz" ? "Return to Lesson" : "Back to Assessments"}</Button>'
)
Write-Text $takeQuizPath $takeQuiz

# ---------------------------------------------------------------------------
# 7. Normalize and validate
# ---------------------------------------------------------------------------
$normalize = @(
  $lessonModelPath,
  $quizModelPath,
  ".\src\firebase\lessonProgress.ts",
  $builderPath,
  $lessonPagePath,
  $takeQuizPath,
  $functionsPath
)
foreach ($file in $normalize) {
  if (Test-Path (Full-ProjectPath $file)) { Write-Text $file (Read-Text $file) }
}

Write-Host "`nLesson quiz progression batch applied." -ForegroundColor Green

if (-not $SkipValidation) {
  Write-Host "`n===== TYPECHECK =====" -ForegroundColor Cyan
  npm run typecheck
  if ($LASTEXITCODE -ne 0) { throw "Typecheck failed." }

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

Write-Host "`nChanged files:" -ForegroundColor Cyan
git --no-pager status --short

Write-Host "`nNo deployment was performed." -ForegroundColor Yellow
Write-Host 'After all checks pass, deploy with:' -ForegroundColor Yellow
Write-Host 'firebase deploy --only "functions:getLessonModuleProgress,functions:completeLessonLearning,functions:submitQuizAttempt,hosting"' -ForegroundColor White
