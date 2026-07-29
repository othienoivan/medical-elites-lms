import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";










import ProtectedRoute from "../components/ProtectedRoute";
import PageSkeleton from "../components/loading/PageSkeleton";
import type { UserRole } from "../models/User";
import StudentWorkspaceGate from "../components/layout/StudentWorkspaceGate";

const StudentTranscriptPage = lazy(() => import("../pages/StudentTranscriptPage"));
const MyProfilePage = lazy(() => import("../pages/MyProfilePage"));
const HomePage = lazy(() => import("../pages/HomePage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const JoinPage = lazy(() => import("../pages/JoinPage"));
const RegistrationLinksPage = lazy(() => import("../pages/RegistrationLinksPage"));
const StudentDirectoryPage = lazy(() => import("../pages/StudentDirectoryPage"));
const BulkImportStudentsPage = lazy(() => import("../pages/BulkImportStudentsPage"));
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
const EditStudentPage = lazy(() => import("../pages/EditStudentPage"));
const CourseUnitPage = lazy(() => import("../pages/CourseUnitPage"));
const CourseUnitDetailsPage = lazy(() => import("../pages/CourseUnitDetailsPage"));
const LessonPage = lazy(() => import("../pages/LessonPage"));
const EnrollmentManagerPage = lazy(() => import("../pages/EnrollmentManagerPage"));
const TutorDashboardPage = lazy(() => import("../pages/TutorDashboardPage"));
const CurriculumExplorerPage = lazy(() => import("../pages/CurriculumExplorerPage"));
const ProgrammeManagerPage = lazy(() => import("../pages/ProgrammeManagerPage"));
const CreateProgrammePage = lazy(() => import("../pages/CreateProgrammePage"));
const EditProgrammePage = lazy(() => import("../pages/EditProgrammePage"));
const CreateCourseUnitPage = lazy(() => import("../pages/CreateCourseUnitPage"));
const ModuleManagerPage = lazy(() => import("../pages/ModuleManagerPage"));
const CreateModulePage = lazy(() => import("../pages/CreateModulePage"));
const EditModulePage = lazy(() => import("../pages/EditModulePage"));
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
const AboutPage = lazy(() => import("../pages/AboutPage"));
const PrivacyPolicyPage = lazy(() => import("../pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("../pages/TermsPage"));
const TestimonialsPage = lazy(() => import("../pages/TestimonialsPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const FounderDashboardPage = lazy(() => import("../pages/FounderDashboardPage"));
const FounderDiagnosticsPage = lazy(() => import("../pages/FounderDiagnosticsPage"));
const AcademicAnalyticsPage = lazy(() => import("../pages/AcademicAnalyticsPage"));
const AdminSetupWizardPage = lazy(() => import("../pages/AdminSetupWizardPage"));
const AdminAcademicYearsPage = lazy(() => import("../pages/AdminAcademicYearsPage"));
const AdminSemestersPage = lazy(() => import("../pages/AdminSemestersPage"));
const AdminDepartmentsPage = lazy(() => import("../pages/AdminDepartmentsPage"));
const AdminTutorsPage = lazy(() => import("../pages/AdminTutorsPage"));
const AdminSettingsPage = lazy(() => import("../pages/AdminSettingsPage"));
const AdminSystemStatusPage = lazy(() => import("../pages/AdminSystemStatusPage"));
const AdminProgrammesPage = lazy(() => import("../pages/AdminProgrammesPage"));
const AdminCourseUnitsPage = lazy(() => import("../pages/AdminCourseUnitsPage"));
const AdminModulesPage = lazy(() => import("../pages/AdminModulesPage"));
const AdminCurriculumDesignerPage = lazy(() => import("../pages/AdminCurriculumDesignerPage"));
const AdminCurriculumPage = lazy(() => import("../pages/AdminCurriculumPage"));
const TutorCurriculumImportPage = lazy(() => import("../pages/TutorCurriculumImportPage"));
const LearningPackageBuilderPage = lazy(() => import("../pages/LearningPackageBuilderPage"));
const DonatePage = lazy(() => import("../pages/DonatePage"));
const ErpCommandCentrePage = lazy(() => import("../pages/ErpCommandCentrePage"));
const OsceManagerPage = lazy(() => import("../pages/OsceManagerPage"));
const QualityAssurancePage = lazy(() => import("../pages/QualityAssurancePage"));
const InstitutionalAnalyticsPage = lazy(() => import("../pages/InstitutionalAnalyticsPage"));

const TUTOR_ROLES: readonly UserRole[] = ["tutor", "admin"];
const ADMIN_ROLES: readonly UserRole[] = ["admin"];
const LEARNER_ROLES: readonly UserRole[] = ["student", "tutor", "admin"];

export default function AppRouter() {
  return (
    <BrowserRouter>
      <StudentWorkspaceGate>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/join/:code" element={<JoinPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/donate" element={<ProtectedRoute allowedRoles={LEARNER_ROLES}><DonatePage /></ProtectedRoute>} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/setup" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminSetupWizardPage /></ProtectedRoute>} />
        <Route path="/admin/academic-years" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminAcademicYearsPage /></ProtectedRoute>} />
        <Route path="/admin/semesters" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminSemestersPage /></ProtectedRoute>} />
        <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminDepartmentsPage /></ProtectedRoute>} />
        <Route path="/admin/programmes" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminProgrammesPage /></ProtectedRoute>} />
        <Route path="/admin/course-units" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminCourseUnitsPage /></ProtectedRoute>} />
        <Route path="/admin/modules" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminModulesPage /></ProtectedRoute>} />
        <Route path="/admin/curriculum-designer" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminCurriculumDesignerPage /></ProtectedRoute>} />
        <Route path="/admin/curriculum-import" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminCurriculumPage /></ProtectedRoute>} />
        <Route path="/admin/tutors" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminTutorsPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminSettingsPage /></ProtectedRoute>} />
        <Route path="/admin/system-status" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminSystemStatusPage /></ProtectedRoute>} />
        <Route
          path="/founder"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <FounderDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/founder/diagnostics"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <FounderDiagnosticsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/courses" element={<CourseUnitPage />} />
        <Route path="/courses/:slug" element={<CourseUnitDetailsPage />} />

        {/* Student */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <AcademicAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={["student"]}><MyProfilePage /></ProtectedRoute>} />
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MyCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/course-units"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
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
  path="/tutor/students/:studentId/edit"
  element={
    <ProtectedRoute allowedRoles={TUTOR_ROLES}>
      <EditStudentPage />
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
  path="/tutor/students/import"
  element={
    <ProtectedRoute allowedRoles={TUTOR_ROLES}>
      <BulkImportStudentsPage />
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

        <Route
          path="/lesson/:moduleId"
          element={
            <ProtectedRoute allowedRoles={LEARNER_ROLES}>
              <LessonPage />
            </ProtectedRoute>
          }
        />

        {/* Tutor */}
        <Route
          path="/tutor"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <TutorDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
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
              <CurriculumExplorerPage />
            </ProtectedRoute>
          }
        />
        <Route path="/tutor/curriculum-import" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><TutorCurriculumImportPage /></ProtectedRoute>} />
        <Route path="/tutor/registration-links" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><RegistrationLinksPage /></ProtectedRoute>} />

        <Route
          path="/tutor/programmes"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <ProgrammeManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/programmes/new"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <CreateProgrammePage />
            </ProtectedRoute>
          }
        />

        <Route path="/tutor/programmes/:programmeId/edit" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><EditProgrammePage /></ProtectedRoute>} />

        <Route
          path="/tutor/course-units"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <CurriculumExplorerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/course-units/new"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <CreateCourseUnitPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/modules"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <ModuleManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/modules/new"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <CreateModulePage />
            </ProtectedRoute>
          }
        />

        <Route path="/tutor/modules/:moduleId/edit" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><EditModulePage /></ProtectedRoute>} />

        <Route path="/tutor/learning-packages" element={<Navigate to="/tutor/lessons" replace />} />

        <Route
          path="/tutor/lessons"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <LessonManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/lessons/new"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <CreateLessonPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/lessons/builder"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <LessonBuilderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/lessons/:lessonId/builder"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <LessonBuilderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/learning-packages/:lessonId"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <LearningPackageBuilderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/lessons/:lessonId/preview"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <LessonPreviewPage />
            </ProtectedRoute>
          }
        />

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
          path="/tutor/questions/:questionId/edit"
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

        <Route path="/tutor/erp" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><ErpCommandCentrePage /></ProtectedRoute>} />
        <Route path="/tutor/osce" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><OsceManagerPage /></ProtectedRoute>} />
        <Route path="/tutor/quality-assurance" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><QualityAssurancePage /></ProtectedRoute>} />
        <Route path="/tutor/institutional-analytics" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><InstitutionalAnalyticsPage /></ProtectedRoute>} />

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
      </StudentWorkspaceGate>
    </BrowserRouter>
  );
}
