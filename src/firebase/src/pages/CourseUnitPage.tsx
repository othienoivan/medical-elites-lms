import { AlertCircle, BookOpenCheck, Search } from "lucide-react";
import { useMemo, useState } from "react";

import CourseCard from "../components/ui/CourseCard";
import Container from "../components/ui/Container";
import Heading from "../components/ui/Heading";
import Section from "../components/ui/Section";
import usePublishedCourseUnits from "../hooks/usePublishedCourseUnits";

export default function CourseUnitPage() {
  const { courseUnits, loading, error } = usePublishedCourseUnits();
  const [searchTerm, setSearchTerm] = useState("");

  const visibleCourseUnits = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return courseUnits;
    return courseUnits.filter((courseUnit) =>
      [courseUnit.title, courseUnit.code, courseUnit.programmeTitle, courseUnit.description]
        .some((value) => String(value ?? "").toLowerCase().includes(term))
    );
  }, [courseUnits, searchTerm]);

  return (
    <main className="min-h-screen bg-slate-50">
      <Section>
        <Container>
          <Heading subtitle="Medical Elites Academy" title="Explore Published Course Units" align="center" />

          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Browse publicly available medical and health sciences course units from institutions and educators on Medical Elites.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by course unit, programme or code"
                className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-12 pr-4 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          {loading ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4" aria-label="Loading course units">
              {[0, 1, 2, 3].map((item) => <div key={item} className="h-96 animate-pulse rounded-3xl bg-slate-200" />)}
            </div>
          ) : error ? (
            <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
              <AlertCircle className="mx-auto" />
              <p className="mt-3 font-semibold">{error}</p>
            </div>
          ) : visibleCourseUnits.length === 0 ? (
            <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <BookOpenCheck className="mx-auto text-blue-700" size={42} />
              <h2 className="mt-4 text-xl font-bold text-slate-950">
                {courseUnits.length === 0 ? "No published course units available yet" : "No matching course units"}
              </h2>
              <p className="mt-2 text-slate-600">
                {courseUnits.length === 0
                  ? "Published course units will appear here automatically once educators make them public."
                  : "Try a different course title, programme name or code."}
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              {visibleCourseUnits.map((courseUnit) => <CourseCard key={courseUnit.id} course={courseUnit} />)}
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}
