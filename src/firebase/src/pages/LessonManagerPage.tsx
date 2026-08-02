import {
  BookOpen,
  Clock,
  Edit,
  Eye,
  Layers,
  Plus,
  Search, ArrowUp, ArrowDown,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useLessons from "../hooks/useLessons";
import useModules from "../hooks/useModules";
import { updateLesson } from "../firebase/lessons";
import type { Lesson } from "../models/Lesson";

export default function LessonManagerPage() {
  const navigate = useNavigate();
  const { modules, loading } = useModules();

  const [search, setSearch] = useState("");

  return (
    <TutorLayout
      title="Lesson Manager"
      subtitle="View, create and manage lessons across modules."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Lesson Workspace</h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Build structured lessons using rich blocks, previews and module-based organisation.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/tutor/lessons/new")}
            >
              <Plus size={18} />
              New Lesson
            </Button>

          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard title="Modules" value={loading ? "..." : modules.length} icon={Layers} />
        <StatCard title="Lessons" value="Grouped" icon={BookOpen} />
        <StatCard title="Builder" value="Active" icon={Edit} />
      </section>

      <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Lessons by Module</h2>
          <p className="mt-1 text-slate-600">
            Browse lessons grouped under their parent modules.
          </p>
        </div>

        <div className="relative w-full md:max-w-md">
          <Search size={18} className="absolute left-4 top-4 text-slate-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search lessons..."
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-700"
          />
        </div>
      </section>

      {loading ? (
        <Card>Loading modules...</Card>
      ) : modules.length === 0 ? (
        <Card className="text-center">
          <BookOpen className="mx-auto text-slate-400" size={52} />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            No modules available
          </h2>

          <p className="mt-2 text-slate-600">
            Create a module first before adding lessons.
          </p>

          <Button className="mt-6" onClick={() => navigate("/tutor/modules/new")}>
            Create Module
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {modules.map((module) => (
            <ModuleLessonsCard
              key={module.id}
              moduleId={module.id}
              search={search}
            />
          ))}
        </div>
      )}
    </TutorLayout>
  );
}

function ModuleLessonsCard({
  moduleId,
  search,
}: {
  moduleId: string;
  search: string;
}) {
  const navigate = useNavigate();
  const { lessons, loading } = useLessons(moduleId);
  const [orderedLessons, setOrderedLessons] = useState<Lesson[]>([]);
  const [moving, setMoving] = useState(false);
  useEffect(() => setOrderedLessons([...lessons].sort((a,b)=>a.order-b.order)), [lessons]);

  async function moveLesson(lessonId: string, direction: -1 | 1) {
    const index = orderedLessons.findIndex(item => item.id === lessonId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= orderedLessons.length || moving) return;
    const next = [...orderedLessons];
    [next[index], next[target]] = [next[target], next[index]];
    const normalized = next.map((item, position) => ({ ...item, order: position + 1 }));
    setOrderedLessons(normalized); setMoving(true);
    try {
      await Promise.all(normalized.map(item => updateLesson(item.id, { order: item.order })));
    } catch (error) {
      console.error("Failed to reorder lessons", error);
      setOrderedLessons([...lessons].sort((a,b)=>a.order-b.order));
      alert("Lesson order could not be saved.");
    } finally { setMoving(false); }
  }

  const filteredLessons = useMemo(() => {
    const keyword = search.toLowerCase();

    return orderedLessons.filter((lesson) => {
      return (
        lesson.title.toLowerCase().includes(keyword) ||
        lesson.description.toLowerCase().includes(keyword) ||
        (lesson.moduleTitle ?? "").toLowerCase().includes(keyword) ||
        (lesson.courseUnitTitle ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [orderedLessons, search]);

  if (loading) {
    return <Card>Loading lessons...</Card>;
  }

  if (search && filteredLessons.length === 0) {
    return null;
  }

  return (
    <Card>
      {orderedLessons.length === 0 ? (
        <div className="text-center">
          <BookOpen className="mx-auto text-slate-400" size={44} />

          <h3 className="mt-4 text-lg font-bold text-slate-900">
            No lessons in this module yet
          </h3>

          <p className="mt-2 text-slate-600">
            Add the first lesson or build one using the visual builder.
          </p>

          <Button className="mt-5" onClick={() => navigate("/tutor/lessons/new")}>
            Add Lesson
          </Button>
        </div>
      ) : (
        <div>
          <div className="mb-5 border-b border-slate-200 pb-4">
            <p className="text-sm font-semibold text-blue-700">
              {orderedLessons[0]?.courseUnitTitle || "Course Unit"}
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {orderedLessons[0]?.moduleTitle || "Module"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredLessons.length} lesson(s)
            </p>
          </div>

          <div className="space-y-5">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-wrap gap-2">
                  <Badge>Lesson {lesson.order}</Badge>
                  <Badge>{lesson.isPublished ? "Published" : "Draft"}</Badge>
                  <button type="button" disabled={moving || orderedLessons.findIndex(item=>item.id===lesson.id)===0} onClick={()=>void moveLesson(lesson.id,-1)} className="rounded-lg border bg-white p-1.5 disabled:opacity-30" title="Move lesson earlier"><ArrowUp size={16}/></button>
                  <button type="button" disabled={moving || orderedLessons.findIndex(item=>item.id===lesson.id)===orderedLessons.length-1} onClick={()=>void moveLesson(lesson.id,1)} className="rounded-lg border bg-white p-1.5 disabled:opacity-30" title="Move lesson later"><ArrowDown size={16}/></button>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-950">
                  {lesson.title}
                </h3>

                <p className="mt-2 leading-7 text-slate-600">
                  {lesson.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {lesson.estimatedMinutes} minutes
                  </div>

                  <div className="flex items-center gap-2">
                    <Layers size={16} />
                    {lesson.blocks?.length ?? 0} blocks
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/tutor/lessons/${lesson.id}/preview`)}
                  >
                    <Eye size={16} />
                    Preview
                  </Button>

                  <Button
                    onClick={() => navigate(`/tutor/lessons/${lesson.id}/builder`)}
                  >
                    <Edit size={16} />
                    Open Builder
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate(`/tutor/learning-packages/${lesson.id}`)}
                  >
                    <BookOpen size={16} />
                    Learning Package
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
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
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>

        <Icon size={36} className="text-blue-700" />
      </div>
    </Card>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {children}
    </span>
  );
}