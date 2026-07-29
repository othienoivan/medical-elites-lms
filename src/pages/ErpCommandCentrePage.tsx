import { Link } from "react-router-dom";
import { BarChart3, CalendarCheck, CalendarDays, ClipboardCheck, FileText, GraduationCap, Megaphone, MessageCircle, ShieldCheck, Sparkles, Stethoscope, WalletCards } from "lucide-react";
import TutorLayout from "../components/layout/TutorLayout";
import Card from "../components/ui/Card";

const modules = [
  ["Attendance", "/tutor/attendance", CalendarCheck, "Class registers, attendance history and exports"],
  ["Clinical Logbook", "/tutor/clinical-logbook", Stethoscope, "Clinical procedures, competencies and supervisor review"],
  ["OSCE / OSPE", "/tutor/osce", ClipboardCheck, "Build stations, checklists and examiner score sheets"],
  ["Timetable", "/tutor/timetable", CalendarDays, "Teaching schedules, rooms and academic sessions"],
  ["Finance", "/tutor/finance", WalletCards, "Invoices, payments, balances and student statements"],
  ["Communication", "/tutor/announcements", Megaphone, "Announcements, messages and notifications"],
  ["Results & Transcripts", "/tutor/gradebook", GraduationCap, "Gradebooks, results and academic records"],
  ["Quality Assurance", "/tutor/quality-assurance", ShieldCheck, "Programme evidence, compliance and accreditation tracking"],
  ["AI Medical Educator", "/tutor/ai-assistant", Sparkles, "Curriculum, lesson and assessment generation"],
  ["Institutional Analytics", "/tutor/institutional-analytics", BarChart3, "Executive indicators across academic operations"],
];

export default function ErpCommandCentrePage() {
  return (
    <TutorLayout title="ERP Command Centre" subtitle="Integrated institutional operations for Medical Elites LMS">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map(([name, path, Icon, description]) => (
          <Link key={String(name)} to={String(path)} className="group">
            <Card className="h-full border border-slate-200 group-hover:border-blue-300 group-hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon size={24} /></div>
              <h2 className="text-lg font-bold text-slate-900">{String(name)}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{String(description)}</p>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="mt-6 border border-blue-100 bg-blue-50/60">
        <div className="flex items-start gap-3"><FileText className="mt-1 text-blue-700" /><div><h2 className="font-bold text-slate-900">Phase 5 integrated workspace</h2><p className="mt-1 text-sm text-slate-700">All institutional modules are accessible from one command centre while retaining their specialist workflows and role controls.</p></div></div>
      </Card>
    </TutorLayout>
  );
}
