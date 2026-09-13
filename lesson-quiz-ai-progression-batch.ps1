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
  ".\src\firebase\quizAttempts.tsx",
  ".\src\models\QuizAttempt.tsx",
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
    @'
import { getLessonById, updateLesson } from "../firebase/lessons";
import { updateQuiz } from "../firebase/quizzes";
import useQuizzes from "../hooks/useQuizzes";
'@
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
    @'
import { completeModuleLearning } from "../firebase/enrollments";
import { completeLessonLearning, getLessonModuleProgress } from "../firebase/lessonProgress";
'@
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
# 7. AI lesson-question generation from lesson/uploaded textual content
# ---------------------------------------------------------------------------
$builder = Read-Text $builderPath

# Expand imports for AI generation and quiz creation.
$builder = $builder.Replace(
  'import { Eye, Plus, Save } from "lucide-react";',
  'import { Eye, Plus, Save, Sparkles } from "lucide-react";'
)
$builder = $builder.Replace(
  'import { updateQuiz } from "../firebase/quizzes";',
  'import { createQuiz, updateQuiz } from "../firebase/quizzes";'
)

if ($builder -notmatch 'generateAiResponse') {
  $builder = $builder.Replace(
    'import { getLessonById, updateLesson } from "../firebase/lessons";',
    @'
import { getLessonById, updateLesson } from "../firebase/lessons";
import { generateAiResponse } from "../firebase/aiAssistant";
import { bulkCreateQuestions } from "../firebase/questions";
'@
  )
}

if ($builder -notmatch 'import useAuth from') {
  $builder = $builder.Replace(
    'import useQuizzes from "../hooks/useQuizzes";',
    @'
import useQuizzes from "../hooks/useQuizzes";
import useAuth from "../hooks/useAuth";
import type { Question } from "../models/Question";
'@
  )
}

if ($builder -notmatch 'const \{ currentUser, userProfile \} = useAuth\(\);') {
  $builder = $builder.Replace(
    '  const { quizzes } = useQuizzes();',
    @'
  const { quizzes } = useQuizzes();
  const { currentUser, userProfile } = useAuth();
'@
  )
}

if ($builder -notmatch 'const \[moduleId, setModuleId\]') {
  $builder = $builder.Replace(
    '  const [courseUnitId, setCourseUnitId] = useState<string | undefined>();',
    @'
  const [courseUnitId, setCourseUnitId] = useState<string | undefined>();
  const [moduleId, setModuleId] = useState<string | undefined>();
  const [programmeId, setProgrammeId] = useState<string | undefined>();
'@
  )
}

if ($builder -notmatch 'const \[aiGenerating, setAiGenerating\]') {
  $builder = $builder.Replace(
    '  const [quizPassMark, setQuizPassMark] = useState(80);',
    @'
  const [quizPassMark, setQuizPassMark] = useState(80);
  const [aiGenerating, setAiGenerating] = useState(false);
'@
  )
}

if ($builder -notmatch 'setModuleId\(lesson\.moduleId') {
  $builder = $builder.Replace(
    '        setCourseUnitId(lesson.courseUnitId ?? lesson.courseId);',
    @'
        setCourseUnitId(lesson.courseUnitId ?? lesson.courseId);
        setModuleId(lesson.moduleId);
        setProgrammeId(lesson.programmeId);
'@
  )
}

if ($builder -notmatch 'async function generateLessonQuizWithAi') {
  $aiFunction = @'

  async function generateLessonQuizWithAi() {
    if (!lessonId || !currentUser) {
      alert("Save and reopen this lesson before generating assessment questions.");
      return;
    }

    const context = blocks
      .map((block) => {
        const metadata = block.metadata ?? {};
        const extracted = [
          metadata.extractedText,
          metadata.sourceText,
          metadata.textContent,
          metadata.transcript,
          metadata.notes,
          metadata.learningPoints,
          metadata.modelAnswer,
          metadata.markingGuide,
        ]
          .filter((value) => typeof value === "string" && value.trim().length > 0)
          .join("\n");

        return [
          block.title,
          block.content,
          extracted,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 44000);

    if (context.length < 120) {
      alert(
        "There is not enough readable lesson text yet. Add lesson text or extracted text from the uploaded content before generating questions.",
      );
      return;
    }

    try {
      setAiGenerating(true);

      await updateLesson(lessonId, { blocks });

      const response = await generateAiResponse({
        mode: "tutor_questions",
        prompt:
          "Generate exactly 10 assessment questions strictly from this lesson content: 6 single-best-answer MCQs, 2 short-answer questions and 2 essay questions. Return ONLY valid JSON as an array. Every item must contain type (mcq|short-answer|essay), questionText, options (4 strings for MCQ, empty array otherwise), correctIndex (0-3 for MCQ, 0 otherwise), modelAnswer, markingGuide, explanation, difficulty (easy|medium|hard), bloomLevel (remember|understand|apply|analyze|evaluate|create), topic and marks. Essay marking guides must be explicit point-based criteria whose allocated points add up exactly to marks.",
        context,
      });

      const cleaned = response.text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned) as Array<Record<string, unknown>>;
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("AI returned no usable lesson questions.");
      }

      const generated = parsed.slice(0, 20).map<Question>((item) => {
        const type = ["mcq", "short-answer", "essay"].includes(String(item.type))
          ? (String(item.type) as Question["type"])
          : "mcq";
        const optionTexts = type === "mcq" && Array.isArray(item.options)
          ? item.options.map(String).slice(0, 4)
          : [];
        if (type === "mcq" && optionTexts.length !== 4) {
          throw new Error("AI returned an MCQ without four options.");
        }
        const correctIndex = Math.max(0, Math.min(3, Number(item.correctIndex) || 0));
        const optionIds = optionTexts.map((_, index) => String.fromCharCode(65 + index));
        const marks = Math.max(1, Math.floor(Number(item.marks) || (type === "essay" ? 10 : type === "short-answer" ? 5 : 1)));
        const modelAnswer = String(item.modelAnswer || "").trim();
        const markingGuide = String(item.markingGuide || "").trim();

        return {
          id: "",
          programmeId,
          courseUnitId,
          moduleId,
          moduleTitle: lessonTitle,
          topic: String(item.topic || lessonTitle),
          type,
          difficulty: (["easy", "medium", "hard"].includes(String(item.difficulty))
            ? String(item.difficulty)
            : "medium") as Question["difficulty"],
          bloomLevel: (["remember", "understand", "apply", "analyze", "evaluate", "create"].includes(String(item.bloomLevel))
            ? String(item.bloomLevel)
            : "understand") as Question["bloomLevel"],
          questionText: String(item.questionText || "").trim(),
          options: optionTexts.map((text, index) => ({
            id: optionIds[index],
            label: optionIds[index],
            text,
          })),
          correctAnswer: type === "mcq" ? optionIds[correctIndex] : modelAnswer,
          explanation: markingGuide
            ? `${String(item.explanation || "")}\n\nMARKING GUIDE:\n${markingGuide}`.trim()
            : String(item.explanation || ""),
          marks,
          tags: [lessonTitle, "lesson-quiz", "AI-generated"],
          isPublished: true,
          ownerUserId: currentUser.uid,
          createdBy: currentUser.uid,
          createdByUid: currentUser.uid,
          institutionId: userProfile?.institutionId,
          assignedTutorIds: [currentUser.uid],
        };
      }).filter((question) => question.questionText.length > 10);

      if (generated.length === 0) {
        throw new Error("AI did not produce valid lesson questions.");
      }

      const questionIds = await bulkCreateQuestions(generated);
      const questionRefs = questionIds.map((questionId, index) => ({
        id: crypto.randomUUID(),
        questionId,
        order: index + 1,
        marks: generated[index]?.marks ?? 1,
      }));
      const totalMarks = questionRefs.reduce((sum, item) => sum + item.marks, 0);
      const normalizedPassMark = Math.max(0, Math.min(100, Number(quizPassMark || 80)));

      let targetQuizId = quizId;
      if (targetQuizId) {
        await updateQuiz(targetQuizId, {
          title: `${lessonTitle} - Lesson Quiz`,
          description: `AI-assisted lesson assessment for ${lessonTitle}. Tutor review recommended before learner use.`,
          assessmentType: "lesson-quiz",
          programmeId,
          courseUnitId,
          moduleId,
          lessonId,
          lessonTitle,
          questions: questionRefs,
          totalMarks,
          passMark: normalizedPassMark,
          status: "published",
        });
      } else {
        targetQuizId = await createQuiz({
          id: "",
          title: `${lessonTitle} - Lesson Quiz`,
          description: `AI-assisted lesson assessment for ${lessonTitle}. Tutor review recommended before learner use.`,
          assessmentType: "lesson-quiz",
          programmeId,
          courseUnitId,
          moduleId,
          lessonId,
          lessonTitle,
          questions: questionRefs,
          totalMarks,
          passMark: normalizedPassMark,
          attemptsAllowed: 3,
          randomizeQuestions: true,
          randomizeOptions: true,
          showFeedbackImmediately: false,
          status: "published",
          createdBy: currentUser.uid,
        });
      }

      setQuizId(targetQuizId);
      setQuizRequired(true);
      await updateLesson(lessonId, {
        blocks,
        quizId: targetQuizId,
        quizRequired: true,
        quizPassMark: normalizedPassMark,
        completionCriteria: { passQuiz: true },
      });

      alert(
        `${generated.length} AI-generated lesson questions were saved to the Question Bank and linked to this lesson quiz. Review them before teaching use.`,
      );
    } catch (error) {
      console.error("AI lesson question generation failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "AI could not generate lesson questions.",
      );
    } finally {
      setAiGenerating(false);
    }
  }
'@

  $insertBefore = '  async function handleSave() {'
  $position = $builder.IndexOf($insertBefore)
  if ($position -lt 0) { throw "Lesson Builder handleSave anchor not found for AI generation." }
  $builder = $builder.Insert($position, $aiFunction + "`r`n")
}

if ($builder -notmatch 'Generate Lesson Questions with AI') {
  $aiButton = @'

            <Button
              variant="outline"
              onClick={() => void generateLessonQuizWithAi()}
              disabled={aiGenerating || saving || loadingLesson || !lessonId}
            >
              <Sparkles size={18} />
              {aiGenerating ? "Generating Questions..." : "Generate Lesson Questions with AI"}
            </Button>
'@
  $saveButtonAnchor = @'
            <Button
              onClick={handleSave}
              disabled={saving || loadingLesson}
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
'@
  if (-not $builder.Contains($saveButtonAnchor)) {
    throw "Lesson Builder save-button anchor not found for AI button."
  }
  $builder = $builder.Replace($saveButtonAnchor, $aiButton + $saveButtonAnchor)
}

Write-Text $builderPath $builder

# ---------------------------------------------------------------------------
# 8. Quiz model: explicitly associate lesson quizzes with a lesson
# ---------------------------------------------------------------------------
$quizModel = Read-Text $quizModelPath
if ($quizModel -notmatch 'lessonId\?: string;') {
  $quizModel = $quizModel.Replace(
    '  moduleTitle?: string;',
    @'
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
'@
  )
}
Write-Text $quizModelPath $quizModel

# ---------------------------------------------------------------------------
# 9. AI essay/short-answer marking callable
#    AI marks are stored as reviewable manualMarks. Tutors can still override.
# ---------------------------------------------------------------------------
$functionsContent = Read-Text $functionsPath

if ($functionsContent -notmatch 'export const aiMarkEssayAttempt') {
  $aiMarkServer = @'

/**
 * AI-assisted marking for essay and short-answer questions.
 * The model is constrained by the tutor-authored model answer, marking guide
 * and maximum mark. Marks are saved as reviewable manualMarks so tutors can
 * still correct or override them before release.
 */
export const aiMarkEssayAttempt = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 120,
    memory: "512MiB",
    secrets: [OPENAI_API_KEY],
    enforceAppCheck: false,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Please sign in before AI marking.");
    }

    const attemptId = asText(
      (request.data as { attemptId?: unknown } | undefined)?.attemptId,
      200,
    );
    if (!attemptId) {
      throw new HttpsError("invalid-argument", "An attempt ID is required.");
    }

    const attemptRef = db.collection("quizAttempts").doc(attemptId);
    const attemptSnapshot = await attemptRef.get();
    if (!attemptSnapshot.exists) {
      throw new HttpsError("not-found", "Quiz attempt not found.");
    }

    const attempt = attemptSnapshot.data() ?? {};
    const profile = await db.collection("users").doc(request.auth.uid).get();
    const role = String(profile.get("role") ?? "");
    const isStudentOwner = role === "student" && String(attempt.studentId ?? "") === request.auth.uid;
    const isTutorOwner = ["tutor", "admin", "super_admin", "platform_admin"].includes(role)
      && [attempt.tutorUid, attempt.ownerUserId, attempt.createdByUid].some(
        (value) => String(value ?? "") === request.auth?.uid,
      );
    if (!isStudentOwner && !isTutorOwner) {
      throw new HttpsError("permission-denied", "You are not allowed to mark this attempt.");
    }

    const quizId = asText(attempt.quizId, 200);
    const quizSnapshot = await db.collection("quizzes").doc(quizId).get();
    if (!quizSnapshot.exists) {
      throw new HttpsError("not-found", "Quiz not found for this attempt.");
    }

    const quiz = quizSnapshot.data() ?? {};
    const refs = Array.isArray(quiz.questions) ? quiz.questions : [];
    const questionIds = refs
      .map((item) => asText((item as Record<string, unknown>).questionId, 200))
      .filter(Boolean);
    const questionSnapshots = await Promise.all(
      questionIds.map((id) => db.collection("questions").doc(id).get()),
    );
    const questions = new Map(
      questionSnapshots
        .filter((item) => item.exists)
        .map((item) => [item.id, item.data() ?? {}]),
    );

    const answers = Array.isArray(attempt.answers)
      ? attempt.answers as Array<Record<string, unknown>>
      : [];

    const subjective = refs.flatMap((rawRef) => {
      const ref = rawRef as Record<string, unknown>;
      const questionId = asText(ref.questionId, 200);
      const question = questions.get(questionId);
      if (!question || !["essay", "short-answer"].includes(String(question.type ?? ""))) return [];
      const answer = answers.find((item) => String(item.questionId ?? "") === questionId);
      const maxMarks = Math.max(1, finiteNumber(ref.marks, finiteNumber(question.marks, 1)));
      return [{
        questionId,
        type: String(question.type ?? "essay"),
        questionText: asText(question.questionText, 6000),
        modelAnswer: asText(question.correctAnswer, 10000),
        markingGuide: asText(question.explanation, 12000),
        maxMarks,
        studentAnswer: asText(answer?.textAnswer ?? answer?.selectedOptionId, 12000),
      }];
    });

    if (subjective.length === 0) {
      return {
        attemptId,
        aiMarked: false,
        finalScore: finiteNumber(attempt.finalScore ?? attempt.score),
        finalPercentage: finiteNumber(attempt.finalPercentage ?? attempt.percentage),
        passed: attempt.passed === true,
        manualMarks: [],
      };
    }

    const apiKey = OPENAI_API_KEY.value();
    if (!apiKey) {
      throw new HttpsError("failed-precondition", "The OPENAI_API_KEY Firebase secret is not configured.");
    }

    await consumeRateLimit(request.auth.uid, {
      scope: "ai_essay_marking",
      limit: 10,
      windowSeconds: 60,
    });

    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const schema = {
      type: "object",
      additionalProperties: false,
      required: ["marks"],
      properties: {
        marks: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["questionId", "marksAwarded", "feedback", "confidence", "needsTutorReview"],
            properties: {
              questionId: { type: "string" },
              marksAwarded: { type: "number", minimum: 0 },
              feedback: { type: "string" },
              confidence: { type: "integer", minimum: 0, maximum: 100 },
              needsTutorReview: { type: "boolean" },
            },
          },
        },
      },
    } as const;

    const completion = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: [
            "You are an assessment marker for health-sciences education.",
            "Mark only against the supplied tutor model answer and marking guide.",
            "Award partial credit when justified.",
            "Never award more than the maximum marks.",
            "Do not invent required facts that are absent from the marking guide.",
            "If the marking guide is ambiguous or the answer requires clinical judgement beyond it, set needsTutorReview true.",
            "Give concise constructive feedback.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify(subjective),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "medical_elites_ai_marking",
          strict: true,
          schema,
        },
      },
      max_completion_tokens: 8000,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("AI returned an empty marking response.");
    const parsed = JSON.parse(raw) as {
      marks?: Array<{
        questionId?: string;
        marksAwarded?: number;
        feedback?: string;
        confidence?: number;
        needsTutorReview?: boolean;
      }>;
    };

    const subjectiveIds = new Set(subjective.map((item) => item.questionId));
    const aiMarks = (parsed.marks ?? [])
      .filter((item) => item.questionId && subjectiveIds.has(item.questionId))
      .map((item) => {
        const source = subjective.find((question) => question.questionId === item.questionId)!;
        return {
          questionId: source.questionId,
          marksAwarded: Math.max(0, Math.min(source.maxMarks, finiteNumber(item.marksAwarded))),
          feedback: asText(item.feedback, 4000),
          markedBy: `ai:${completion.model}`,
          markedAt: new Date(),
          confidence: Math.max(0, Math.min(100, Math.floor(finiteNumber(item.confidence)))),
          needsTutorReview: item.needsTutorReview === true,
        };
      });

    const objectiveScore = refs.reduce((sum, rawRef) => {
      const ref = rawRef as Record<string, unknown>;
      const questionId = asText(ref.questionId, 200);
      const question = questions.get(questionId);
      if (!question || ["essay", "short-answer"].includes(String(question.type ?? ""))) return sum;
      const answer = answers.find((item) => String(item.questionId ?? "") === questionId);
      return sum + Math.max(0, finiteNumber(answer?.marksAwarded));
    }, 0);

    const manualScore = aiMarks.reduce((sum, item) => sum + item.marksAwarded, 0);
    const totalMarks = Math.max(1, finiteNumber(attempt.totalMarks, finiteNumber(quiz.totalMarks, 1)));
    const finalScore = Math.max(0, Math.min(totalMarks, objectiveScore + manualScore));
    const finalPercentage = Math.round((finalScore / totalMarks) * 10000) / 100;
    const passMark = Math.max(0, Math.min(100, finiteNumber(quiz.passMark, 50)));
    const passed = finalPercentage >= passMark;
    const needsTutorReview = aiMarks.some((item) => item.needsTutorReview);

    await attemptRef.set({
      manualMarks: aiMarks,
      manualScore,
      finalScore,
      finalPercentage,
      passed,
      aiMarked: true,
      aiMarkingModel: completion.model,
      aiMarkingRequestId: completion.id,
      aiNeedsTutorReview: needsTutorReview,
      aiMarkedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    await db.collection("aiUsageLogs").add({
      uid: request.auth.uid,
      role,
      mode: "essay_marking",
      model: completion.model,
      requestId: completion.id,
      attemptId,
      questionCount: subjective.length,
      createdAt: FieldValue.serverTimestamp(),
    });

    // For a module-level quiz, completion can occur only after the AI-adjusted
    // final percentage reaches the pass mark. Lesson quizzes are handled by
    // completeLessonLearning and therefore never auto-complete the full module.
    const lessonId = asText(quiz.lessonId ?? attempt.lessonId, 200);
    const moduleId = asText(quiz.moduleId ?? attempt.moduleId, 200);
    const courseUnitId = asText(quiz.courseUnitId ?? attempt.courseUnitId, 200);
    if (passed && moduleId && !lessonId) {
      const enrollmentSnapshots = await Promise.all([
        db.collection("enrollments").where("userId", "==", String(attempt.studentId ?? "")).get(),
        db.collection("enrollments").where("studentAuthUid", "==", String(attempt.studentId ?? "")).get(),
      ]);
      const batch = db.batch();
      enrollmentSnapshots.forEach((snapshot) => snapshot.docs.forEach((item) => {
        const enrollment = item.data();
        const belongs = !courseUnitId
          || enrollment.courseId === courseUnitId
          || enrollment.courseUnitId === courseUnitId
          || (Array.isArray(enrollment.courseUnitIds) && enrollment.courseUnitIds.includes(courseUnitId));
        if (belongs) {
          batch.set(item.ref, {
            completedModules: FieldValue.arrayUnion(moduleId),
            startedModules: FieldValue.arrayUnion(moduleId),
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
        }
      }));
      await batch.commit();
    }

    return {
      attemptId,
      aiMarked: true,
      finalScore,
      finalPercentage,
      passed,
      manualMarks: aiMarks,
      needsTutorReview,
    };
  },
);
'@

  $insertAnchor = '/** Persist completion of a module after validating any required quiz. */'
  $insertAt = $functionsContent.IndexOf($insertAnchor)
  if ($insertAt -lt 0) { throw "Could not locate backend insertion anchor for AI marking." }
  $functionsContent = $functionsContent.Insert($insertAt, $aiMarkServer + "`r`n")
}

Write-Text $functionsPath $functionsContent

# ---------------------------------------------------------------------------
# 10. Client automatically requests AI marking after a completed submission
# ---------------------------------------------------------------------------
$quizAttemptsPath = ".\src\firebase\quizAttempts.tsx"
$quizAttempts = Read-Text $quizAttemptsPath

if ($quizAttempts -notmatch 'AiMarkedAttemptResult') {
  $quizAttempts = $quizAttempts.Replace(
    'type SubmitQuizAttemptResponse = QuizAttemptUsage & { attemptId: string };',
    @'
type AiMarkedAttemptResult = {
  aiMarked: boolean;
  finalScore?: number;
  finalPercentage?: number;
  passed?: boolean;
  needsTutorReview?: boolean;
};

type SubmitQuizAttemptResponse = QuizAttemptUsage & {
  attemptId: string;
  aiMarking?: AiMarkedAttemptResult;
};
'@
  )
}

$oldCreateAttempt = @'
  const result = await callable(removeUndefinedValues(attempt));
  return result.data;
'@
$newCreateAttempt = @'
  const result = await callable(removeUndefinedValues(attempt));

  try {
    const aiMarker = httpsCallable<
      { attemptId: string },
      AiMarkedAttemptResult
    >(functions, "aiMarkEssayAttempt");
    const marking = await aiMarker({ attemptId: result.data.attemptId });
    return { ...result.data, aiMarking: marking.data };
  } catch (error) {
    console.warn(
      "Attempt was saved, but AI marking could not be completed automatically.",
      error,
    );
    return result.data;
  }
'@
if ($quizAttempts.Contains($oldCreateAttempt)) {
  $quizAttempts = $quizAttempts.Replace($oldCreateAttempt, $newCreateAttempt)
}
Write-Text $quizAttemptsPath $quizAttempts

# ---------------------------------------------------------------------------
# 11. Student results use AI-adjusted essay score when available
# ---------------------------------------------------------------------------
$takeQuiz = Read-Text $takeQuizPath

if ($takeQuiz -notmatch 'const \[aiFinalResult, setAiFinalResult\]') {
  $takeQuiz = $takeQuiz.Replace(
    '  const [savingAttempt, setSavingAttempt] = useState(false);',
    @'
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [aiFinalResult, setAiFinalResult] = useState<{
    finalScore?: number;
    finalPercentage?: number;
    passed?: boolean;
    needsTutorReview?: boolean;
  } | null>(null);
'@
  )
}

if ($takeQuiz -notmatch 'setAiFinalResult\(submissionResult\.aiMarking') {
  $takeQuiz = $takeQuiz.Replace(
    '      setAttemptUsage(submissionResult);',
    @'
      setAttemptUsage(submissionResult);
      if (submissionResult.aiMarking?.aiMarked) {
        setAiFinalResult(submissionResult.aiMarking);
      }
'@
  )
}

if ($takeQuiz -notmatch 'const displayedPercentage') {
  $anchor = '  if (submitted && !reviewMode) {'
  $replacement = @'
  const displayedScore = aiFinalResult?.finalScore ?? score;
  const displayedPercentage = aiFinalResult?.finalPercentage ?? percentage;
  const displayedPassed = aiFinalResult?.passed ?? passed;

  if (submitted && !reviewMode) {
'@
  if (-not $takeQuiz.Contains($anchor)) { throw "TakeQuiz result-page anchor not found." }
  $takeQuiz = $takeQuiz.Replace($anchor, $replacement)
}

$takeQuiz = $takeQuiz.Replace('{percentage}%', '{displayedPercentage}%')
$takeQuiz = $takeQuiz.Replace('Score: {score}/{totalMarks}', 'Score: {displayedScore}/{totalMarks}')
$takeQuiz = $takeQuiz.Replace('passed ? "text-green-700" : "text-red-700"', 'displayedPassed ? "text-green-700" : "text-red-700"')
$takeQuiz = $takeQuiz.Replace('{passed ? "Passed" : "Not Passed"}', '{displayedPassed ? "Passed" : "Not Passed"}')

if ($takeQuiz -notmatch 'AI-assisted marking was applied') {
  $reviewNoteAnchor = @'
            <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-5 text-left text-sm text-slate-700 md:grid-cols-2">
'@
  $reviewNote = @'
            {aiFinalResult && (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left text-sm text-blue-900">
                <strong>AI-assisted marking was applied to essay/short-answer responses.</strong>
                <p className="mt-1">
                  {aiFinalResult.needsTutorReview
                    ? "One or more answers were flagged for tutor review. The tutor can override AI marks before results are formally released."
                    : "The AI marks remain reviewable by the tutor before formal release."}
                </p>
              </div>
            )}

'@
  if ($takeQuiz.Contains($reviewNoteAnchor)) {
    $takeQuiz = $takeQuiz.Replace($reviewNoteAnchor, $reviewNote + $reviewNoteAnchor)
  }
}
Write-Text $takeQuizPath $takeQuiz

# ---------------------------------------------------------------------------
# 12. Extend QuizAttempt model with AI marking audit fields
# ---------------------------------------------------------------------------
$attemptModelPath = ".\src\models\QuizAttempt.tsx"
$attemptModel = Read-Text $attemptModelPath
if ($attemptModel -notmatch 'aiMarked\?: boolean;') {
  $attemptModel = $attemptModel.Replace(
    '  tutorRemarks?: string;',
    @'
  tutorRemarks?: string;

  aiMarked?: boolean;
  aiMarkingModel?: string;
  aiMarkingRequestId?: string;
  aiNeedsTutorReview?: boolean;
  aiMarkedAt?: Date;
'@
  )
}
Write-Text $attemptModelPath $attemptModel

# ---------------------------------------------------------------------------
# 13. Normalize and validate
# ---------------------------------------------------------------------------
$normalize = @(
  $lessonModelPath,
  $quizModelPath,
  ".\src\firebase\lessonProgress.ts",
  $builderPath,
  $lessonPagePath,
  $takeQuizPath,
  $quizAttemptsPath,
  $attemptModelPath,
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
Write-Host 'firebase deploy --only "functions:getLessonModuleProgress,functions:completeLessonLearning,functions:submitQuizAttempt,functions:aiMarkEssayAttempt,hosting"' -ForegroundColor White
