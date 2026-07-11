<<<<<<< HEAD
import { useMemo } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LogOut,
  PlayCircle,
  TrendingUp,
  ClipboardList,
  CalendarCheck,
  CalendarDays,
  Megaphone,
  Bell,
  MessageCircle,
  Stethoscope,
  WalletCards,
  Sparkles,
=======
import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  Clock,
  LogOut,
  TrendingUp,
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { logoutUser } from "../firebase/auth";
<<<<<<< HEAD
import useAuth from "../hooks/useAuth";
import useQuizzes from "../hooks/useQuizzes";
import useCourseUnits from "../hooks/useCourseUnits";
import useStudentLearningAccess from "../hooks/useStudentLearningAccess";
import useQuizAttempts from "../hooks/useQuizAttempts";
import NotificationBell from "../components/NotificationBell";
=======
import { getDashboardData } from "../firebase/dashboard";
import useAuth from "../hooks/useAuth";
import type { Enrollment } from "../models/Enrollment";
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

<<<<<<< HEAD
  const { quizzes, loading: quizzesLoading } = useQuizzes();
  const { courseUnits, loading: courseUnitsLoading } = useCourseUnits();
  const { attempts, loading: attemptsLoading } = useQuizAttempts();
  const {
    enrollments,
    courseUnitIds,
    programmeIds,
    loading: accessLoading,
    canAccessQuiz,
  } = useStudentLearningAccess();

  const assignedCourseUnits = useMemo(
    () =>
      courseUnits.filter(
        (courseUnit) =>
          courseUnitIds.has(courseUnit.id) ||
          programmeIds.has(courseUnit.programmeId)
      ),
    [courseUnitIds, courseUnits, programmeIds]
  );

  const completedAssessmentKeys = useMemo(() => {
    const keys = new Set<string>();

    attempts.forEach((attempt) => {
      if (attempt.quizId) keys.add(`id:${attempt.quizId}`);

      const normalizedTitle = attempt.quizTitle?.trim().toLowerCase();
      if (normalizedTitle) keys.add(`title:${normalizedTitle}`);
    });

    return keys;
  }, [attempts]);

  const availableQuizzes = useMemo(
    () =>
      quizzes.filter((quiz) => {
        const normalizedTitle = quiz.title.trim().toLowerCase();
        const completed =
          completedAssessmentKeys.has(`id:${quiz.id}`) ||
          completedAssessmentKeys.has(`title:${normalizedTitle}`);

        return (
          quiz.status === "published" &&
          canAccessQuiz(quiz) &&
          !quiz.isArchived &&
          !completed
        );
      }),
    [canAccessQuiz, completedAssessmentKeys, quizzes]
  );

  const overallProgress = useMemo(() => {
    if (enrollments.length === 0) return 0;

    return Math.round(
      enrollments.reduce((sum, item) => sum + (item.progress ?? 0), 0) /
        enrollments.length
    );
  }, [enrollments]);

  const loading =
    accessLoading || courseUnitsLoading || quizzesLoading || attemptsLoading;
=======
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!currentUser) return;

      try {
        const data = await getDashboardData(currentUser.uid);

        setEnrollments(data.enrollments);
        setOverallProgress(data.overallProgress);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [currentUser]);
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d

  async function handleLogout() {
    await logoutUser();
    navigate("/login");
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <Container className="flex items-center justify-between py-5">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              Medical Elites LMS
            </h1>
<<<<<<< HEAD
            <p className="text-sm text-slate-500">Student Learning Portal</p>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
              <LogOut size={18} />
              Logout
            </Button>
          </div>
=======
            <p className="text-sm text-slate-500">Student Dashboard</p>
          </div>

          <Button variant="outline" className="gap-2" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </Button>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
        </Container>
      </header>

      <Container className="py-10">
<<<<<<< HEAD
        <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
          <h2 className="text-3xl font-bold">Welcome back 👋</h2>

          <p className="mt-2 text-blue-100">
            Signed in as{" "}
            <span className="font-semibold text-white">
              {currentUser?.email}
            </span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/assessments")}
            >
              <ClipboardCheck size={18} />
              My Assessments
            </Button>

            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/my-courses")}
            >
              <BookOpen size={18} />
              My Course Units
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-4">
          <StatCard
            title="Assigned Course Units"
            value={loading ? "..." : assignedCourseUnits.length}
            icon={BookOpen}
          />

          <StatCard
            title="Overall Progress"
            value={loading ? "..." : `${overallProgress}%`}
            icon={TrendingUp}
          />

          <StatCard
            title="Available Assessments"
            value={availableQuizzes.length}
            icon={ClipboardCheck}
          />

          <StatCard title="Certificates" value="0" icon={Award} />
        </section>
<section className="mt-8">
  <h2 className="mb-5 text-2xl font-bold text-slate-900">
    Quick Actions
  </h2>

  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

    <Card
      className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => navigate("/my-courses")}
    >
      <BookOpen className="text-blue-700" size={34} />

      <h3 className="mt-4 text-lg font-bold">
        My Course Units
      </h3>

      <p className="mt-2 text-slate-600">
        Open course units assigned through your enrolment.
      </p>
    </Card>

    <Card
      className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => navigate("/assessments")}
    >
      <ClipboardCheck className="text-green-700" size={34} />

      <h3 className="mt-4 text-lg font-bold">
        Assessments
      </h3>

      <p className="mt-2 text-slate-600">
        Take quizzes, CATs and examinations.
      </p>
    </Card>

    <Card
      className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => navigate("/assessment-history")}
    >
      <ClipboardList className="text-purple-700" size={34} />

      <h3 className="mt-4 text-lg font-bold">
        Assessment History
      </h3>

      <p className="mt-2 text-slate-600">
        Review previous scores and attempts.
      </p>
    </Card>

    <Card
      className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => navigate("/ai-assistant")}
    >
      <Sparkles className="text-indigo-700" size={34} />
      <h3 className="mt-4 text-lg font-bold">AI Study Assistant</h3>
      <p className="mt-2 text-slate-600">
        Explain topics, summarize notes, generate revision questions and review answers.
      </p>
    </Card>

    <Card
      className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => navigate("/finance")}
    >
      <WalletCards className="text-emerald-700" size={34} />
      <h3 className="mt-4 text-lg font-bold">My Fees</h3>
      <p className="mt-2 text-slate-600">View your fees statement, payment receipts and financial clearance.</p>
    </Card>

    <Card
      className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => navigate("/clinical-logbook")}
    >
      <Stethoscope className="text-teal-700" size={34} />
      <h3 className="mt-4 text-lg font-bold">Clinical Logbook</h3>
      <p className="mt-2 text-slate-600">Record procedures and monitor supervisor verification.</p>
    </Card>

    <Card
      className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => navigate("/attendance")}
    >
      <CalendarCheck className="text-amber-700" size={34} />
      <h3 className="mt-4 text-lg font-bold">My Attendance</h3>
      <p className="mt-2 text-slate-600">Review attendance records and participation percentage.</p>
    </Card>

    <Card
      className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => navigate("/timetable")}
    >
      <CalendarDays className="text-indigo-700" size={34} />
      <h3 className="mt-4 text-lg font-bold">My Timetable</h3>
      <p className="mt-2 text-slate-600">View your weekly classes, venues and teaching times.</p>
    </Card>

    <Card
      className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => navigate("/announcements")}
    >
      <Megaphone className="text-amber-700" size={34} />
      <h3 className="mt-4 text-lg font-bold">Announcements</h3>
      <p className="mt-2 text-slate-600">
        Read institutional notices and academic updates.
      </p>
    </Card>

    <Card
      className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => navigate("/messages")}
    >
      <MessageCircle className="text-indigo-700" size={34} />
      <h3 className="mt-4 text-lg font-bold">Messages</h3>
      <p className="mt-2 text-slate-600">Contact your tutors securely inside the LMS.</p>
    </Card>

    <Card
      className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => navigate("/notifications")}
    >
      <Bell className="text-amber-700" size={34} />
      <h3 className="mt-4 text-lg font-bold">Notifications</h3>
      <p className="mt-2 text-slate-600">Review messages, results and academic updates.</p>
    </Card>

  </div>
</section>
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h3 className="text-xl font-bold text-slate-950">
              Continue Learning
            </h3>

            {loading ? (
              <p className="mt-6 text-slate-600">Loading your courses...</p>
            ) : assignedCourseUnits.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No course units assigned"
                description="Ask your tutor or administrator to assign course units to your active enrolment."
                actionLabel="View My Course Units"
                onAction={() => navigate("/my-courses")}
              />
            ) : (
              <div className="mt-6 space-y-4">
                {assignedCourseUnits.slice(0, 4).map((courseUnit) => (
                  <div
                    key={courseUnit.id}
=======
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-slate-950">
            Welcome back 👋
          </h2>

          <p className="mt-2 text-slate-600">
            Signed in as{" "}
            <span className="font-semibold text-blue-700">
              {currentUser?.email}
            </span>
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-4">
          <Card>
            <BookOpen className="text-blue-700" size={30} />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Enrolled Courses
            </p>
            <h3 className="mt-2 text-3xl font-bold">
              {loading ? "..." : enrollments.length}
            </h3>
          </Card>

          <Card>
            <TrendingUp className="text-green-700" size={30} />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Overall Progress
            </p>
            <h3 className="mt-2 text-3xl font-bold">
              {loading ? "..." : `${overallProgress}%`}
            </h3>
          </Card>

          <Card>
            <Clock className="text-amber-600" size={30} />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Study Time
            </p>
            <h3 className="mt-2 text-3xl font-bold">0h</h3>
          </Card>

          <Card>
            <Award className="text-purple-700" size={30} />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Certificates
            </p>
            <h3 className="mt-2 text-3xl font-bold">0</h3>
          </Card>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h3 className="text-xl font-bold text-slate-950">My Courses</h3>

            {loading ? (
              <p className="mt-6 text-slate-600">Loading your courses...</p>
            ) : enrollments.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                <BookOpen className="mx-auto text-slate-400" size={40} />

                <h4 className="mt-4 text-lg font-bold text-slate-800">
                  No courses enrolled yet
                </h4>

                <p className="mt-2 text-slate-600">
                  Browse the academy and enroll in your first course.
                </p>

                <Button className="mt-5" onClick={() => navigate("/courses")}>
                  Browse Courses
                </Button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">
<<<<<<< HEAD
                          {courseUnit.title}
                        </h4>

                        <p className="mt-1 text-sm text-slate-600">
                          Programme:{" "}
                          <span className="font-semibold text-blue-700">
                            {courseUnit.programmeTitle}
=======
                          {enrollment.courseTitle}
                        </h4>

                        <p className="mt-1 text-sm text-slate-600">
                          Status:{" "}
                          <span className="font-semibold capitalize text-green-700">
                            {enrollment.status}
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
<<<<<<< HEAD
                          Code: {courseUnit.code || "Not assigned"}
=======
                          Progress: {enrollment.progress}%
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
                        </p>
                      </div>

                      <Button
                        onClick={() =>
<<<<<<< HEAD
                          navigate(`/courses/${courseUnit.slug}`)
                        }
                      >
                        <PlayCircle size={18} />
                        Continue
=======
                          navigate(`/courses/${enrollment.courseSlug}`)
                        }
                      >
                        Continue Learning
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
                      </Button>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-700"
<<<<<<< HEAD
                        style={{ width: "0%" }}
=======
                        style={{ width: `${enrollment.progress}%` }}
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

<<<<<<< HEAD
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-bold text-slate-950">
                Upcoming Assessments
              </h3>

              {availableQuizzes.length === 0 ? (
                <p className="mt-4 text-slate-600">
                  No published assessments yet.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {availableQuizzes.slice(0, 3).map((quiz) => (
                    <div
                      key={quiz.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="font-bold text-slate-900">{quiz.title}</p>

                      <p className="mt-1 text-sm text-slate-600">
                        {quiz.questions.length} questions · {quiz.totalMarks}{" "}
                        marks
                      </p>

                      <Button
                        className="mt-4 w-full"
                        onClick={() =>
                          navigate(`/assessments/quizzes/${quiz.id}/take`)
                        }
                      >
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                className="mt-5 w-full"
                onClick={() => navigate("/assessments")}
              >
                View All Assessments
              </Button>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-slate-950">
                Quick Links
              </h3>

              <div className="mt-5 grid gap-3">
                <QuickLink
                  icon={ClipboardCheck}
                  label="My Assessments"
                  onClick={() => navigate("/assessments")}
                />

                <QuickLink
                  icon={BarChart3}
                  label="My Results"
                  onClick={() => alert("Results page coming next.")}
                />

                <QuickLink
                  icon={FileText}
                  label="My Notes"
                  onClick={() => alert("Notes page coming next.")}
                />

                <QuickLink
                  icon={GraduationCap}
                  label="Certificates"
                  onClick={() => alert("Certificates coming next.")}
                />
              </div>
            </Card>
          </div>
=======
          <Card>
            <h3 className="text-xl font-bold text-slate-950">Next Lesson</h3>

            <p className="mt-4 text-slate-600">
              Your next lesson will appear here once lessons are added to your
              enrolled course.
            </p>
          </Card>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
        </section>
      </Container>
    </main>
  );
<<<<<<< HEAD
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-950">{value}</h3>
        </div>

        <Icon size={34} className="text-blue-700" />
      </div>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
      <Icon className="mx-auto text-slate-400" size={42} />

      <h4 className="mt-4 text-lg font-bold text-slate-800">{title}</h4>

      <p className="mt-2 text-slate-600">{description}</p>

      <Button className="mt-5" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

function QuickLink({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700 hover:bg-white"
    >
      <Icon size={18} className="text-blue-700" />
      {label}
    </button>
  );
=======
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
}