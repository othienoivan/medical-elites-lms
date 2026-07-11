<<<<<<< HEAD
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";










import ProtectedRoute from "../components/ProtectedRoute";
import type { UserRole } from "../models/User";

const StudentTranscriptPage = lazy(() => import("../pages/StudentTranscriptPage"));
const HomePage = lazy(() => import("../pages/HomePage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const StudentDirectoryPage = lazy(() => import("../pages/StudentDirectoryPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const MyCoursesPage = lazy(() => import("../pages/MyCoursesPage"));
const RegisterStudentPage = lazy(() => import("../pages/RegisterStudentPage"));
const StudentAssessmentPage = lazy(() => import("../pages/StudentAssessmentPage"));
const AssessmentEntryPage = lazy(() => import("../pages/AssessmentEntryPage"));
const TakeQuizPage = lazy(() => import("../pages/TakeQuizPage"));
const AssessmentHistoryPage = lazy(() => import("../pages/AssessmentHistoryPage"));
const AssessmentAttemptReviewPage = lazy(() => import("../pages/AssessmentAttemptReviewPage"));
const ResultSlipPage = lazy(() => import("../pages/ResultSlipPage"));
const StudentProfilePage = lazy(() => import("../pages/StudentProfilePage"));
const CourseUnitPage = lazy(() => import("../pages/CourseUnitPage"));
const CourseUnitDetailsPage = lazy(() => import("../pages/CourseUnitDetailsPage"));
const LessonPage = lazy(() => import("../pages/LessonPage"));
const EnrollmentManagerPage = lazy(() => import("../pages/EnrollmentManagerPage"));
const TutorDashboardPage = lazy(() => import("../pages/TutorDashboardPage"));
const CurriculumExplorerPage = lazy(() => import("../pages/CurriculumExplorerPage"));
const ProgrammeManagerPage = lazy(() => import("../pages/ProgrammeManagerPage"));
const CreateProgrammePage = lazy(() => import("../pages/CreateProgrammePage"));
const CreateCourseUnitPage = lazy(() => import("../pages/CreateCourseUnitPage"));
const ModuleManagerPage = lazy(() => import("../pages/ModuleManagerPage"));
const CreateModulePage = lazy(() => import("../pages/CreateModulePage"));
const LessonManagerPage = lazy(() => import("../pages/LessonManagerPage"));
const CreateLessonPage = lazy(() => import("../pages/CreateLessonPage"));
const LessonBuilderPage = lazy(() => import("../pages/LessonBuilderPage"));
const LessonPreviewPage = lazy(() => import("../pages/LessonPreviewPage"));
const AssessmentWorkspacePage = lazy(() => import("../pages/AssessmentWorkspacePage"));
const QuestionBankPage = lazy(() => import("../pages/QuestionBankPage"));
const CreateQuestionPage = lazy(() => import("../pages/CreateQuestionPage"));
const QuizBankPage = lazy(() => import("../pages/QuizBankPage"));
const CreateQuizPage = lazy(() => import("../pages/CreateQuizPage"));
const QuizBuilderPage = lazy(() => import("../pages/QuizBuilderPage"));
const QuizAnalyticsPage = lazy(() => import("../pages/QuizAnalyticsPage"));
const QuizDetailsPage = lazy(() => import("../pages/QuizDetailsPage"));
const ExaminationBankPage = lazy(() => import("../pages/ExaminationBankPage"));
const ExaminationBuilderPage = lazy(() => import("../pages/ExaminationBuilderPage"));
const ExaminationDetailsPage = lazy(() => import("../pages/ExaminationDetailsPage"));
const SubmissionInboxPage = lazy(() => import("../pages/SubmissionInboxPage"));
const ManualMarkingPage = lazy(() => import("../pages/ManualMarkingPage"));
const TutorGradebookPage = lazy(() => import("../pages/TutorGradebookPage"));
const AutomaticGradebookPage = lazy(() => import("../pages/AutomaticGradebookPage"));
const StudentPerformancePage = lazy(() => import("../pages/StudentPerformancePage"));
const ClassAnalyticsPage = lazy(() => import("../pages/ClassAnalyticsPage"));
const UnauthorizedPage = lazy(() => import("../pages/UnauthorizedPage"));
const AttendanceManagerPage = lazy(() => import("../pages/AttendanceManagerPage"));
const StudentAttendancePage = lazy(() => import("../pages/StudentAttendancePage"));
const TimetableManagerPage = lazy(() => import("../pages/TimetableManagerPage"));
const StudentTimetablePage = lazy(() => import("../pages/StudentTimetablePage"));
const AnnouncementManagerPage = lazy(() => import("../pages/AnnouncementManagerPage"));
const AnnouncementsPage = lazy(() => import("../pages/AnnouncementsPage"));
const MessagesPage = lazy(() => import("../pages/MessagesPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));
const ClinicalLogbookPage = lazy(() => import("../pages/ClinicalLogbookPage"));
const NewClinicalEntryPage = lazy(() => import("../pages/NewClinicalEntryPage"));
const TutorClinicalLogbookPage = lazy(() => import("../pages/TutorClinicalLogbookPage"));
const ClinicalReviewPage = lazy(() => import("../pages/ClinicalReviewPage"));
const FinanceManagerPage = lazy(() => import("../pages/FinanceManagerPage"));
const StudentFinancePage = lazy(() => import("../pages/StudentFinancePage"));
const AiAssistantPage = lazy(() => import("../pages/AiAssistantPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

const TUTOR_ROLES: readonly UserRole[] = ["tutor", "admin"];
const LEARNER_ROLES: readonly UserRole[] = ["student", "tutor", "admin"];
=======
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

import DashboardPage from "../pages/DashboardPage";

import CourseUnitPage from "../pages/CourseUnitPage";
import CourseUnitDetailsPage from "../pages/CourseUnitDetailsPage";
import LessonPage from "../pages/LessonPage";

import TutorDashboardPage from "../pages/TutorDashboardPage";
import CurriculumExplorerPage from "../pages/CurriculumExplorerPage";

import ProgrammeManagerPage from "../pages/ProgrammeManagerPage";
import CreateProgrammePage from "../pages/CreateProgrammePage";

import CreateCourseUnitPage from "../pages/CreateCourseUnitPage";

import ModuleManagerPage from "../pages/ModuleManagerPage";
import CreateModulePage from "../pages/CreateModulePage";

import LessonManagerPage from "../pages/LessonManagerPage";
import CreateLessonPage from "../pages/CreateLessonPage";
import LessonBuilderPage from "../pages/LessonBuilderPage";
import LessonPreviewPage from "../pages/LessonPreviewPage";

import ProtectedRoute from "../components/ProtectedRoute";
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d

export default function AppRouter() {
  return (
    <BrowserRouter>
<<<<<<< HEAD
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="/courses" element={<CourseUnitPage />} />
        <Route path="/courses/:slug" element={<CourseUnitDetailsPage />} />

        {/* Student */}
=======
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/courses" element={<CourseUnitPage />} />
        <Route path="/courses/:slug" element={<CourseUnitDetailsPage />} />

>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
<<<<<<< HEAD
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <MyCoursesPage />
            </ProtectedRoute>
          }
        />
<Route
  path="/tutor/students"
  element={
    <ProtectedRoute allowedRoles={TUTOR_ROLES}>
      <StudentDirectoryPage />
    </ProtectedRoute>
  }

/>
<Route
  path="/tutor/student-profile/:studentId"
  element={
    <ProtectedRoute allowedRoles={TUTOR_ROLES}>
      <StudentProfilePage />
    </ProtectedRoute>
  }
/>
<Route
  path="/tutor/enrollments"
  element={
    <ProtectedRoute allowedRoles={TUTOR_ROLES}>
      <EnrollmentManagerPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/tutor/students/register"
  element={
    <ProtectedRoute allowedRoles={TUTOR_ROLES}>
      <RegisterStudentPage />
    </ProtectedRoute>
  }
/>
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <StudentAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timetable"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <StudentTimetablePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/finance"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <StudentFinancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <AiAssistantPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clinical-logbook"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <ClinicalLogbookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clinical-logbook/new"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <NewClinicalEntryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <StudentAssessmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments/quizzes/:quizId"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <AssessmentEntryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments/quizzes/:quizId/take"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <TakeQuizPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessment-history"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <AssessmentHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessment-history/:attemptId"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <AssessmentAttemptReviewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessment-history/:attemptId/result-slip"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <ResultSlipPage />
            </ProtectedRoute>
          }
        />
=======
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d

        <Route
          path="/lesson/:moduleId"
          element={
<<<<<<< HEAD
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
=======
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <LessonPage />
            </ProtectedRoute>
          }
        />

<<<<<<< HEAD
        {/* Tutor */}
        <Route
          path="/tutor"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
=======
        <Route
          path="/tutor"
          element={
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <TutorDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
<<<<<<< HEAD
          path="/tutor/finance"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <FinanceManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/clinical-logbook"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <TutorClinicalLogbookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/clinical-logbook/:entryId/review"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <ClinicalReviewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/curriculum"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
=======
          path="/tutor/curriculum"
          element={
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <CurriculumExplorerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/programmes"
          element={
<<<<<<< HEAD
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
=======
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <ProgrammeManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/programmes/new"
          element={
<<<<<<< HEAD
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
=======
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <CreateProgrammePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/course-units"
          element={
<<<<<<< HEAD
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
=======
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <CreateCourseUnitPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/course-units/new"
          element={
<<<<<<< HEAD
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
=======
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <CreateCourseUnitPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/modules"
          element={
<<<<<<< HEAD
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
=======
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <ModuleManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/modules/new"
          element={
<<<<<<< HEAD
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
=======
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <CreateModulePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/lessons"
          element={
<<<<<<< HEAD
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
=======
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <LessonManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/lessons/new"
          element={
<<<<<<< HEAD
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
=======
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <CreateLessonPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/lessons/builder"
          element={
<<<<<<< HEAD
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
=======
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <LessonBuilderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/lessons/:lessonId/builder"
          element={
<<<<<<< HEAD
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
=======
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <LessonBuilderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/lessons/:lessonId/preview"
          element={
<<<<<<< HEAD
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
=======
            <ProtectedRoute>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              <LessonPreviewPage />
            </ProtectedRoute>
          }
        />
<<<<<<< HEAD

        <Route
          path="/tutor/assessments"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <AssessmentWorkspacePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/questions"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <QuestionBankPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/questions/new"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <CreateQuestionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/quizzes"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <QuizBankPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/quizzes/new"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <CreateQuizPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/quizzes/builder"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <QuizBuilderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/quizzes/:quizId"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <QuizDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/quizzes/:quizId/builder"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <QuizBuilderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/quizzes/:quizId/analytics"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <QuizAnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/announcements"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <AnnouncementManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/messages"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/notifications"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/ai-assistant"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <AiAssistantPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/attendance"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <AttendanceManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/timetable"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <TimetableManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/submissions"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <SubmissionInboxPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/submissions/:attemptId/mark"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <ManualMarkingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/gradebook"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <TutorGradebookPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/automatic-gradebook"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <AutomaticGradebookPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/student-performance/:studentId"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <StudentPerformancePage />
            </ProtectedRoute>
          }
        />

<Route
  path="/tutor/student-transcript/:studentId"
  element={
    <ProtectedRoute allowedRoles={TUTOR_ROLES}>
      <StudentTranscriptPage />
    </ProtectedRoute>
  }
/>
        <Route
          path="/tutor/class-analytics"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <ClassAnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/exams"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <ExaminationBankPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/exams/:examId"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <ExaminationDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/exams/:examId/builder"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <ExaminationBuilderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/exams/builder"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <ExaminationBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function RouteLoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
        <p className="mt-3 font-semibold text-slate-700">Loading page...</p>
      </div>
    </main>
  );
}
=======
      </Routes>
    </BrowserRouter>
  );
}
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
