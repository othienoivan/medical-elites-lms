import type React from "react";

import {
  Award,
  BookOpen,
  Clock,
  GraduationCap,
  Star,
  Users,
} from "lucide-react";

import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { featuredCourses } from "../data/courses";
import { enrollInCourse } from "../firebase/enrollments";
import useAuth from "../hooks/useAuth";

export default function CourseDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const course = featuredCourses.find((item) => item.slug === slug);

  async function handleEnroll() {
    if (!course) return;

    if (!currentUser) {
      navigate("/login");
      return;
    }

    await enrollInCourse({
      userId: currentUser.uid,
      courseId: course.id,
      courseSlug: course.slug,
      courseTitle: course.title,
    });

    navigate("/dashboard");
  }

  if (!course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <Card className="max-w-lg text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Course Not Found
          </h1>

          <p className="mt-3 text-slate-600">
            The course you are looking for does not exist.
          </p>

          <Button className="mt-6" onClick={() => navigate("/courses")}>
            Back to Courses
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-blue-700 text-white">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-semibold uppercase tracking-wide text-blue-100">
              {course.category}
            </p>

            <h1 className="mt-4 text-5xl font-extrabold leading-tight">
              {course.title}
            </h1>

            <p className="mt-6 text-lg leading-8 text-blue-100">
              {course.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                onClick={handleEnroll}
                className="bg-white text-blue-700 hover:bg-slate-100"
              >
                Enroll Now
              </Button>

              <Link to="/courses">
                <Button
                  variant="outline"
                  className="border-white text-white hover:border-white hover:text-white"
                >
                  Back to Courses
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white/10 p-4">
            <img
              src={course.image}
              alt={course.title}
              onError={(event) => {
                event.currentTarget.src =
                  "https://placehold.co/900x600/1D4ED8/FFFFFF?text=Medical+Elites";
              }}
              className="h-80 w-full rounded-2xl object-cover"
            />
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-950">
              About this course
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              {course.description}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Info
                icon={<GraduationCap size={20} />}
                label="Tutor"
                value={course.tutor}
              />

              <Info
                icon={<Clock size={20} />}
                label="Duration"
                value={course.duration}
              />

              <Info
                icon={<BookOpen size={20} />}
                label="Modules"
                value={`${course.modules} modules`}
              />

              <Info
                icon={<BookOpen size={20} />}
                label="Lessons"
                value={`${course.lessons} lessons`}
              />

              <Info
                icon={<Star size={20} />}
                label="Rating"
                value={`${course.rating.toFixed(1)} / 5.0`}
              />

              <Info
                icon={<Users size={20} />}
                label="Students"
                value={course.students}
              />

              {course.certificate && (
                <Info
                  icon={<Award size={20} />}
                  label="Certificate"
                  value="Included"
                />
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              Course Progression
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Each module includes lessons, video support, notes, and a quiz.
              Learners must score at least 80% to unlock the next module.
            </p>

            <Button onClick={handleEnroll} className="mt-6 w-full">
              Enroll Now
            </Button>
          </Card>
        </div>
      </Container>
    </main>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-4">
      <div className="text-blue-700">{icon}</div>

      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}