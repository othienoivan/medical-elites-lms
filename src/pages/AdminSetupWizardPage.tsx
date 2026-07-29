import { CheckCircle2, ChevronRight, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import Button from "../components/ui/Button";
import { getAcademicYears, getDepartments, getInstitutionSettings, getSemesters } from "../firebase/institutionCore";
import { getPlatformMetrics } from "../firebase/platformMetrics";

type Step = { label: string; description: string; path: string; complete: boolean };

export default function AdminSetupWizardPage() {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void (async () => {
    try {
      const [settings, years, semesters, departments, metrics] = await Promise.all([getInstitutionSettings(), getAcademicYears(), getSemesters(), getDepartments(), getPlatformMetrics()]);
      setSteps([
        { label: "Institution Details", description: "Name, contacts, currency and time zone", path: "/admin/settings", complete: Boolean(settings?.institutionName) },
        { label: "Academic Year", description: "Create the current academic year", path: "/admin/academic-years", complete: years.length > 0 },
        { label: "Semester", description: "Define the active semester", path: "/admin/semesters", complete: semesters.length > 0 },
        { label: "Departments", description: "Create academic departments", path: "/admin/departments", complete: departments.length > 0 },
        { label: "Programmes", description: "Configure institutional programmes", path: "/tutor/programmes", complete: metrics.programmes > 0 },
        { label: "Tutors", description: "Register or activate tutor accounts", path: "/admin/tutors", complete: metrics.tutors > 0 },
        { label: "Students", description: "Register and enrol learners", path: "/tutor/students", complete: metrics.students > 0 },
      ]);
    } finally { setLoading(false); }
  })(); }, []);
  const completed = steps.filter((step) => step.complete).length;
  const percent = steps.length ? Math.round((completed / steps.length) * 100) : 0;
  return <AdminLayout title="Academic Setup Wizard" subtitle="Follow the guided sequence to prepare the institution for teaching and learning."><div className="max-w-4xl"><section className="rounded-3xl bg-gradient-to-br from-violet-800 to-indigo-950 p-6 text-white shadow-xl sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-200">Institution readiness</p><div className="mt-3 flex items-end justify-between gap-4"><div><h2 className="text-3xl font-bold">{loading ? "Checking…" : `${percent}% configured`}</h2><p className="mt-2 text-violet-100">{completed} of {steps.length} setup stages complete.</p></div><span className="text-5xl font-black text-white/20">{percent}%</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${percent}%` }}/></div></section><section className="mt-6 space-y-3">{steps.map((step, index) => <button key={step.label} type="button" onClick={() => navigate(step.path)} className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700">{step.complete ? <CheckCircle2 size={23}/> : <Circle size={23}/>}</span><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Step {index + 1}</p><h3 className="mt-1 font-bold text-slate-950">{step.label}</h3><p className="mt-1 text-sm text-slate-500">{step.description}</p></div><ChevronRight className="text-slate-400"/></button>)}</section>{percent === 100 && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><h3 className="font-bold text-emerald-800">Institution setup complete</h3><p className="mt-1 text-sm text-emerald-700">Core institutional records are ready. Continue with course-unit assignment, timetable, finance and learning-content setup.</p><Button className="mt-4" onClick={() => navigate("/admin")}>Return to Dashboard</Button></div>}</div></AdminLayout>;
}
