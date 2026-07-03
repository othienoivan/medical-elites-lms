import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  Clock,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { logoutUser } from "../firebase/auth";
import { getDashboardData } from "../firebase/dashboard";
import useAuth from "../hooks/useAuth";
import type { Enrollment } from "../models/Enrollment";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

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
            <p className="text-sm text-slate-500">Student Dashboard</p>
          </div>

          <Button variant="outline" className="gap-2" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </Button>
        </Container>
      </header>

      <Container className="py-10">
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
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">
                          {enrollment.courseTitle}
                        </h4>

                        <p className="mt-1 text-sm text-slate-600">
                          Status:{" "}
                          <span className="font-semibold capitalize text-green-700">
                            {enrollment.status}
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          Progress: {enrollment.progress}%
                        </p>
                      </div>

                      <Button
                        onClick={() =>
                          navigate(`/courses/${enrollment.courseSlug}`)
                        }
                      >
                        Continue Learning
                      </Button>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-700"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-slate-950">Next Lesson</h3>

            <p className="mt-4 text-slate-600">
              Your next lesson will appear here once lessons are added to your
              enrolled course.
            </p>
          </Card>
        </section>
      </Container>
    </main>
  );
}