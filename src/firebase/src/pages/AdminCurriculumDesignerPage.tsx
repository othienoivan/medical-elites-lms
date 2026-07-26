import { BookOpen, ChevronDown, ChevronRight, GraduationCap, Layers, Search } from "lucide-react";
import { useMemo, useState } from "react";

import AdminLayout from "../components/layout/AdminLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import useCourseUnits from "../hooks/useCourseUnits";
import useModules from "../hooks/useModules";
import useProgrammes from "../hooks/useProgrammes";

export default function AdminCurriculumDesignerPage() {
  const { programmes, loading: programmesLoading } = useProgrammes();
  const { courseUnits, loading: courseUnitsLoading } = useCourseUnits();
  const { modules, loading: modulesLoading } = useModules();
  const [search, setSearch] = useState("");
  const [expandedProgrammes, setExpandedProgrammes] = useState<Set<string>>(new Set());
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  const filteredProgrammes = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return programmes;
    return programmes.filter((programme) => {
      const programmeCourses = courseUnits.filter((course) => course.programmeId === programme.id);
      const courseIds = new Set(programmeCourses.map((course) => course.id));
      const programmeModules = modules.filter((module) => module.courseUnitId && courseIds.has(module.courseUnitId));
      return [programme.title, programme.code, programme.department, ...programmeCourses.map((course) => course.title), ...programmeModules.map((module) => module.title)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [courseUnits, modules, programmes, search]);

  const loading = programmesLoading || courseUnitsLoading || modulesLoading;

  function toggle(setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <AdminLayout title="Curriculum Designer" subtitle="Review the programme → course unit → module hierarchy from one institutional workspace.">
      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard label="Programmes" value={programmes.length} icon={GraduationCap} />
        <SummaryCard label="Course Units" value={courseUnits.length} icon={BookOpen} />
        <SummaryCard label="Modules" value={modules.length} icon={Layers} />
      </div>

      <Card className="mt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Institution Curriculum Map</h2>
            <p className="mt-1 text-sm text-slate-600">Expand a programme to inspect its course units and modules.</p>
          </div>
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search curriculum..." className="pl-11" />
          </div>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">{[1,2,3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}</div>
        ) : filteredProgrammes.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-600">No curriculum records match your search.</div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredProgrammes.map((programme) => {
              const programmeCourses = courseUnits.filter((course) => course.programmeId === programme.id).sort((a,b) => (a.yearOfStudy ?? 0) - (b.yearOfStudy ?? 0) || (a.semester ?? 0) - (b.semester ?? 0) || a.title.localeCompare(b.title));
              const expanded = expandedProgrammes.has(programme.id);
              return (
                <section key={programme.id} className="overflow-hidden rounded-2xl border border-slate-200">
                  <button type="button" onClick={() => toggle(setExpandedProgrammes, programme.id)} className="flex w-full items-center justify-between gap-4 bg-slate-50 px-5 py-4 text-left hover:bg-violet-50">
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl bg-violet-100 p-2 text-violet-700"><GraduationCap size={20}/></span>
                      <div><h3 className="font-bold text-slate-950">{programme.title}</h3><p className="mt-1 text-sm text-slate-500">{programme.code || programme.level} · {programmeCourses.length} course unit(s)</p></div>
                    </div>
                    {expanded ? <ChevronDown size={20}/> : <ChevronRight size={20}/>} 
                  </button>
                  {expanded && <div className="space-y-3 p-4">
                    {programmeCourses.length === 0 ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">No course units have been linked to this programme.</p> : programmeCourses.map((course) => {
                      const courseModules = modules.filter((module) => module.courseUnitId === course.id || module.courseId === course.id).sort((a,b) => a.order - b.order);
                      const courseExpanded = expandedCourses.has(course.id);
                      return <div key={course.id} className="rounded-xl border border-slate-200">
                        <button type="button" onClick={() => toggle(setExpandedCourses, course.id)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50">
                          <div><p className="font-semibold text-slate-900">{course.code ? `${course.code} — ` : ""}{course.title}</p><p className="mt-1 text-xs text-slate-500">Year {course.yearOfStudy || "—"} · Semester {course.semester || "—"} · {courseModules.length} module(s)</p></div>
                          {courseExpanded ? <ChevronDown size={18}/> : <ChevronRight size={18}/>} 
                        </button>
                        {courseExpanded && <div className="border-t border-slate-200 bg-slate-50 p-3">
                          {courseModules.length === 0 ? <p className="text-sm text-slate-500">No modules added.</p> : <ol className="space-y-2">{courseModules.map((module) => <li key={module.id} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{module.order}</span><span className="font-medium text-slate-800">{module.title}</span></li>)}</ol>}
                        </div>}
                      </div>;
                    })}
                  </div>}
                </section>
              );
            })}
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p></div><span className="rounded-2xl bg-violet-100 p-3 text-violet-700"><Icon size={24}/></span></div></div>;
}
