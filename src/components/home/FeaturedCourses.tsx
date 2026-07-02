import { BookOpen } from "lucide-react";

const courses = [
  "General Pathology",
  "Pharmacology",
  "Medical Microbiology",
  "Internal Medicine",
];

export default function FeaturedCourses() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-semibold text-blue-700">Featured Courses</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-950">Start with core medical sciences</h3>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-4">
        {courses.map((course) => (
          <div key={course} className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <BookOpen className="text-blue-700" size={32} />
            <h4 className="mt-4 text-lg font-bold">{course}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Structured modules, quizzes, progress tracking, and certificates.
            </p>
            <button className="mt-5 font-semibold text-blue-700 hover:text-blue-900">
              View Course →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}