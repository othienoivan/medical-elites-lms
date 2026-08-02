import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";










import ProtectedRoute from "../components/ProtectedRoute";
import PageSkeleton from "../components/loading/PageSkeleton";
import type { UserRole } from "../models/User";
import StudentWorkspaceGate from "../components/layout/StudentWorkspaceGate";
import PlatformAccessGate from "../components/platform/PlatformAccessGate";

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
const QuestionDetailsPage = lazy(() => import("../pages/QuestionDetailsPage"));
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
const TutorWalletPage = lazy(() => import("../pages/TutorWalletPage"));
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


const MarketplaceHomePage = lazy(() => import("../pages/marketplace/MarketplaceHomePage"));
const MarketplaceProductPage = lazy(() => import("../pages/marketplace/MarketplaceProductPage"));
const MarketplaceSellerPage = lazy(() => import("../pages/marketplace/MarketplaceSellerPage"));
const MarketplaceSellPage = lazy(() => import("../pages/marketplace/MarketplaceSellPage"));
const MarketplaceCartPage = lazy(() => import("../pages/marketplace/MarketplaceCartPage"));
const MarketplaceWishlistPage = lazy(() => import("../pages/marketplace/MarketplaceWishlistPage"));
const MarketplaceOrdersPage = lazy(() => import("../pages/marketplace/MarketplaceOrdersPage"));
const MarketplaceCheckoutPage = lazy(() => import("../pages/marketplace/MarketplaceCheckoutPage"));
const PlatformMarketplacePage = lazy(() => import("../pages/platform/PlatformMarketplacePage"));
const MarketplaceSellerAnalyticsPage = lazy(() => import("../pages/marketplace/MarketplaceSellerAnalyticsPage"));
const MarketplaceBuyerInsightsPage = lazy(() => import("../pages/marketplace/MarketplaceBuyerInsightsPage"));
const MarketplaceIntelligencePage = lazy(() => import("../pages/platform/marketplace/MarketplaceIntelligencePage"));
const MarketplaceOperationsPage = lazy(() => import("../pages/platform/marketplace/MarketplaceOperationsPage"));

const PlatformDashboardPage = lazy(() => import("../pages/platform/PlatformDashboardPage"));
const PlatformTenantsPage = lazy(() => import("../pages/platform/PlatformTenantsPage"));
const PlatformTenantDetailsPage = lazy(() => import("../pages/platform/PlatformTenantDetailsPage"));
const PlatformTutorsPage = lazy(() => import("../pages/platform/PlatformTutorsPage"));
const PlatformPlansPage = lazy(() => import("../pages/platform/PlatformPlansPage"));
const PlatformFeatureFlagsPage = lazy(() => import("../pages/platform/PlatformFeatureFlagsPage"));
const PlatformAuditPage = lazy(() => import("../pages/platform/PlatformAuditPage"));
const PlatformSupportPage = lazy(() => import("../pages/platform/PlatformSupportPage"));
const PlatformUsagePage = lazy(() => import("../pages/platform/PlatformUsagePage"));
const PlatformOperationsPage = lazy(() => import("../pages/platform/PlatformOperationsPage"));
const PlatformSettingsPage = lazy(() => import("../pages/platform/PlatformSettingsPage"));
const PlatformAnnouncementsPage = lazy(() => import("../pages/platform/PlatformAnnouncementsPage"));
const PlatformRoadmapPage = lazy(() => import("../pages/platform/PlatformRoadmapPage"));
const PlatformLicensesPage = lazy(() => import("../pages/platform/PlatformLicensesPage"));
const PlatformBrandingPage = lazy(() => import("../pages/platform/PlatformBrandingPage"));
const FinanceDashboardPage = lazy(() => import("../pages/platform/finance/FinanceDashboardPage"));
const CommerceOperationsPage = lazy(() => import("../pages/platform/finance/CommerceOperationsPage"));
const FinancePlansPage = lazy(() => import("../pages/platform/finance/FinancePlansPage"));
const SubscriptionsPage = lazy(() => import("../pages/platform/finance/SubscriptionsPage"));
const WalletsPage = lazy(() => import("../pages/platform/finance/WalletsPage"));
const InvoicesPage = lazy(() => import("../pages/platform/finance/InvoicesPage"));
const PaymentsPage = lazy(() => import("../pages/platform/finance/PaymentsPage"));
const CouponsPage = lazy(() => import("../pages/platform/finance/CouponsPage"));
const CommissionRulesPage = lazy(() => import("../pages/platform/finance/CommissionRulesPage"));
const WithdrawalsPage = lazy(() => import("../pages/platform/finance/WithdrawalsPage"));
const RevenueSharingPage = lazy(() => import("../pages/platform/finance/RevenueSharingPage"));
const FinanceOperationsPage = lazy(() => import("../pages/platform/finance/FinanceOperationsPage"));

const TUTOR_ROLES: readonly UserRole[] = ["tutor", "admin"];
const ADMIN_ROLES: readonly UserRole[] = ["admin"];
const LEARNER_ROLES: readonly UserRole[] = ["student", "tutor", "admin"];

export default function AppRouter() {
  return (
    <BrowserRouter>
      <StudentWorkspaceGate>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>

        {/* Platform Console — additive SaaS layer, isolated from academic LMS routes. */}
        <Route path="/platform" element={<PlatformAccessGate><PlatformDashboardPage /></PlatformAccessGate>} />
        <Route path="/platform/tenants" element={<PlatformAccessGate><PlatformTenantsPage /></PlatformAccessGate>} />
        <Route path="/platform/tenants/:tenantId" element={<PlatformAccessGate><PlatformTenantDetailsPage /></PlatformAccessGate>} />
        <Route path="/platform/tutors" element={<PlatformAccessGate><PlatformTutorsPage /></PlatformAccessGate>} />
        <Route path="/platform/plans" element={<PlatformAccessGate><PlatformPlansPage /></PlatformAccessGate>} />
        <Route path="/platform/feature-flags" element={<PlatformAccessGate><PlatformFeatureFlagsPage /></PlatformAccessGate>} />
        <Route path="/platform/audit" element={<PlatformAccessGate><PlatformAuditPage /></PlatformAccessGate>} />
        <Route path="/platform/support" element={<PlatformAccessGate><PlatformSupportPage /></PlatformAccessGate>} />
        <Route path="/platform/usage" element={<PlatformAccessGate><PlatformUsagePage /></PlatformAccessGate>} />
        <Route path="/platform/operations" element={<PlatformAccessGate><PlatformOperationsPage /></PlatformAccessGate>} />
        <Route path="/platform/settings" element={<PlatformAccessGate><PlatformSettingsPage /></PlatformAccessGate>} />
        <Route path="/platform/announcements" element={<PlatformAccessGate><PlatformAnnouncementsPage /></PlatformAccessGate>} />
        <Route path="/platform/roadmap" element={<PlatformAccessGate><PlatformRoadmapPage /></PlatformAccessGate>} />
        <Route path="/platform/licenses" element={<PlatformAccessGate><PlatformLicensesPage /></PlatformAccessGate>} />
        <Route path="/platform/branding" element={<PlatformAccessGate><PlatformBrandingPage /></PlatformAccessGate>} />
        <Route path="/platform/finance" element={<PlatformAccessGate><FinanceDashboardPage /></PlatformAccessGate>} />
        <Route path="/platform/finance/commerce" element={<PlatformAccessGate><CommerceOperationsPage /></PlatformAccessGate>} />
        <Route path="/platform/finance/plans" element={<PlatformAccessGate><FinancePlansPage /></PlatformAccessGate>} />
        <Route path="/platform/finance/subscriptions" element={<PlatformAccessGate><SubscriptionsPage /></PlatformAccessGate>} />
        <Route path="/platform/finance/wallets" element={<PlatformAccessGate><WalletsPage /></PlatformAccessGate>} />
        <Route path="/platform/finance/invoices" element={<PlatformAccessGate><InvoicesPage /></PlatformAccessGate>} />
        <Route path="/platform/finance/payments" element={<PlatformAccessGate><PaymentsPage /></PlatformAccessGate>} />
        <Route path="/platform/finance/coupons" element={<PlatformAccessGate><CouponsPage /></PlatformAccessGate>} />
        <Route path="/platform/finance/commission-rules" element={<PlatformAccessGate><CommissionRulesPage /></PlatformAccessGate>} />
        <Route path="/platform/finance/withdrawals" element={<PlatformAccessGate><WithdrawalsPage /></PlatformAccessGate>} />
        <Route path="/platform/finance/revenue-sharing" element={<PlatformAccessGate><RevenueSharingPage /></PlatformAccessGate>} />
        <Route path="/platform/finance/operations" element={<PlatformAccessGate><FinanceOperationsPage /></PlatformAccessGate>} />


        {/* RC5 Marketplace Foundation */}
        <Route path="/marketplace" element={<MarketplaceHomePage />} />
        <Route path="/marketplace/products/:productId" element={<MarketplaceProductPage />} />
        <Route path="/marketplace/sellers/:sellerId" element={<MarketplaceSellerPage />} />
        <Route path="/marketplace/sell" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><MarketplaceSellPage /></ProtectedRoute>} />
        <Route path="/marketplace/cart" element={<ProtectedRoute allowedRoles={LEARNER_ROLES}><MarketplaceCartPage /></ProtectedRoute>} />
        <Route path="/marketplace/wishlist" element={<ProtectedRoute allowedRoles={LEARNER_ROLES}><MarketplaceWishlistPage /></ProtectedRoute>} />
        <Route path="/marketplace/orders" element={<ProtectedRoute allowedRoles={LEARNER_ROLES}><MarketplaceOrdersPage /></ProtectedRoute>} />
        <Route path="/marketplace/checkout" element={<ProtectedRoute allowedRoles={LEARNER_ROLES}><MarketplaceCheckoutPage /></ProtectedRoute>} />
        <Route path="/marketplace/insights" element={<ProtectedRoute allowedRoles={LEARNER_ROLES}><MarketplaceBuyerInsightsPage /></ProtectedRoute>} />
        <Route path="/marketplace/seller-analytics" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><MarketplaceSellerAnalyticsPage /></ProtectedRoute>} />
        <Route path="/platform/marketplace" element={<PlatformAccessGate><PlatformMarketplacePage /></PlatformAccessGate>} />
        <Route path="/platform/marketplace/intelligence" element={<PlatformAccessGate><MarketplaceIntelligencePage /></PlatformAccessGate>} />
        <Route path="/platform/marketplace/operations" element={<PlatformAccessGate><MarketplaceOperationsPage /></PlatformAccessGate>} />

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
        <Route path="/admin/finance" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><FinanceManagerPage /></ProtectedRoute>} />
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

        <Route path="/tutor/erp" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><ErpCommandCentrePage /></ProtectedRoute>} />
        <Route path="/tutor/osce" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><OsceManagerPage /></ProtectedRoute>} />
        <Route path="/tutor/quality-assurance" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><QualityAssurancePage /></ProtectedRoute>} />
        <Route path="/tutor/institutional-analytics" element={<ProtectedRoute allowedRoles={TUTOR_ROLES}><InstitutionalAnalyticsPage /></ProtectedRoute>} />

        <Route
          path="/tutor/finance"
          element={
            <ProtectedRoute allowedRoles={["tutor"]}>
              <TutorWalletPage />
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
              <Navigate to="/tutor/lessons" replace />
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
          path="/tutor/questions/:questionId"
          element={
            <ProtectedRoute allowedRoles={TUTOR_ROLES}>
              <QuestionDetailsPage />
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
