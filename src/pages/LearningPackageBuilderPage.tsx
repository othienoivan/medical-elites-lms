import { BookOpen, CheckCircle2, ClipboardCheck, FileText, Save, Sparkles, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { getLessonById, updateLesson } from "../firebase/lessons";
import type { Lesson } from "../models/Lesson";

export default function LearningPackageBuilderPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!lessonId) { setLoading(false); return; }
      try { setLesson(await getLessonById(lessonId)); } finally { setLoading(false); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [lessonId]);

  const quality = useMemo(() => {
    if (!lesson) return { score: 0, checks: [] as { label: string; met: boolean }[] };
    const checks = [
      { label: "Lesson title", met: Boolean(lesson.title.trim()) },
      { label: "Description", met: Boolean(lesson.description?.trim()) },
      { label: "Learning objectives", met: Boolean(lesson.learningObjectives?.some((item) => item.objective.trim())) },
      { label: "At least one learning resource", met: Boolean(lesson.blocks?.some((block) => ["pdf", "powerpoint", "document", "image", "youtube"].includes(block.type))) },
      { label: "Learning activity", met: Boolean(lesson.blocks?.some((block) => ["quiz", "assignment", "knowledge-check", "clinical-case"].includes(block.type))) },
      { label: "Estimated duration", met: lesson.estimatedMinutes > 0 },
    ];
    return { score: Math.round((checks.filter((item) => item.met).length / checks.length) * 100), checks };
  }, [lesson]);

  function update<K extends keyof Lesson>(field: K, value: Lesson[K]) {
    setLesson((current) => current ? { ...current, [field]: value } : current);
  }

  async function save(publish = false) {
    if (!lessonId || !lesson) return;
    if (publish && quality.score < 67) {
      alert("Complete the lesson title, objectives, duration and at least one resource before publishing.");
      return;
    }
    try {
      setSaving(true);
      await updateLesson(lessonId, { ...lesson, isPublished: publish ? true : lesson.isPublished, updatedAt: new Date() });
      setLesson((current) => current ? { ...current, isPublished: publish ? true : current.isPublished } : current);
      alert(publish ? "Learning package published." : "Learning package saved.");
    } finally { setSaving(false); }
  }

  if (loading) return <TutorLayout title="Learning Package Builder" subtitle="Loading lesson package..."><Card>Loading...</Card></TutorLayout>;
  if (!lesson) return <TutorLayout title="Learning Package Builder" subtitle="Lesson not found."><Card>Open a saved lesson from Lesson Manager.</Card></TutorLayout>;

  return (
    <TutorLayout title="Learning Package Builder" subtitle="Turn a lesson into a complete learning experience with objectives, resources, activities and assessment.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-100 p-3 text-blue-700"><BookOpen size={22}/></span><div><h2 className="text-xl font-bold text-slate-950">Lesson Information</h2><p className="text-sm text-slate-500">Core details students see before opening the lesson.</p></div></div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="md:col-span-2"><span className="mb-2 block font-semibold text-slate-700">Lesson title</span><Input value={lesson.title} onChange={(event) => update("title", event.target.value)} /></label>
              <label className="md:col-span-2"><span className="mb-2 block font-semibold text-slate-700">Description</span><textarea value={lesson.description || ""} onChange={(event) => update("description", event.target.value)} className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700" /></label>
              <label><span className="mb-2 block font-semibold text-slate-700">Estimated minutes</span><Input type="number" value={lesson.estimatedMinutes} onChange={(event) => update("estimatedMinutes", Number(event.target.value))} /></label>
              <label><span className="mb-2 block font-semibold text-slate-700">Difficulty</span><select value={lesson.difficulty || "intermediate"} onChange={(event) => update("difficulty", event.target.value as Lesson["difficulty"])} className="w-full rounded-xl border border-slate-300 px-4 py-3"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3"><Target className="text-emerald-600"/><div><h2 className="text-xl font-bold">Learning Objectives</h2><p className="text-sm text-slate-500">Define measurable outcomes for the learner.</p></div></div>
            <div className="mt-5 space-y-3">{(lesson.learningObjectives || []).map((objective, index) => <div key={objective.id || index} className="flex gap-3"><span className="mt-3 font-bold text-slate-400">{index + 1}.</span><Input value={objective.objective} onChange={(event) => update("learningObjectives", (lesson.learningObjectives || []).map((item, itemIndex) => itemIndex === index ? { ...item, objective: event.target.value } : item))} /></div>)}</div>
            <Button className="mt-4" variant="outline" onClick={() => update("learningObjectives", [...(lesson.learningObjectives || []), { id: crypto.randomUUID(), objective: "" }])}>Add objective</Button>
          </Card>

          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-slate-950">Package Content</h2><p className="mt-1 text-sm text-slate-500">Use the visual lesson builder to add notes, slides, video, clinical cases, assignments and quizzes.</p></div><Button onClick={() => navigate(`/tutor/lessons/${lesson.id}/builder`)}><FileText size={18}/> Open Content Builder</Button></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><PackageStat label="Resources" value={(lesson.blocks || []).filter((block) => ["pdf","powerpoint","document","image","youtube"].includes(block.type)).length}/><PackageStat label="Activities" value={(lesson.blocks || []).filter((block) => ["assignment","quiz","knowledge-check","clinical-case"].includes(block.type)).length}/><PackageStat label="Total Blocks" value={lesson.blocks?.length || 0}/></div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="sticky top-6">
            <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-500">Lesson Quality</p><p className="mt-1 text-4xl font-bold text-slate-950">{quality.score}%</p></div><Sparkles className="text-violet-600" size={32}/></div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-violet-600" style={{ width: `${quality.score}%` }} /></div>
            <div className="mt-5 space-y-3">{quality.checks.map((check) => <div key={check.label} className="flex items-center gap-2 text-sm"><CheckCircle2 size={17} className={check.met ? "text-emerald-600" : "text-slate-300"}/><span className={check.met ? "text-slate-800" : "text-slate-500"}>{check.label}</span></div>)}</div>
            <div className="mt-6 space-y-3"><Button className="w-full" onClick={() => void save(false)} disabled={saving}><Save size={18}/>{saving ? "Saving..." : "Save Package"}</Button><Button className="w-full" variant="success" onClick={() => void save(true)} disabled={saving}><ClipboardCheck size={18}/> Publish Package</Button></div>
          </Card>
        </aside>
      </div>
    </TutorLayout>
  );
}

function PackageStat({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{value}</p></div>; }
