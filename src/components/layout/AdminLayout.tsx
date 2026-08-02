import { useState, type ReactNode } from "react";
import {
  Activity,
  Bell,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Network,
  UploadCloud,
  GraduationCap,
  Home,
  HeartHandshake,
  Layers,
  LogOut,
  Menu,
  MessageCircle,
  MonitorCog,
  Command,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { auth } from "../../config/firebase";
import MediFloatingAssistant from "../MediFloatingAssistant";
import HeaderActions from "../HeaderActions";

type Props = { title: string; subtitle?: string; children: ReactNode };
type Item = { label: string; path: string; icon: React.ElementType; end?: boolean };
type Group = { title: string; items: Item[] };

const groups: Group[] = [
  { title: "Overview", items: [{ label: "Dashboard", path: "/admin", icon: Home, end: true }] },
  { title: "Academic", items: [
    { label: "Setup Wizard", path: "/admin/setup", icon: ClipboardList },
    { label: "Academic Years", path: "/admin/academic-years", icon: CalendarDays },
    { label: "Semesters", path: "/admin/semesters", icon: CalendarCheck },
    { label: "Departments", path: "/admin/departments", icon: Building2 },
    { label: "Programmes", path: "/admin/programmes", icon: GraduationCap },
    { label: "Course Units", path: "/admin/course-units", icon: BookOpen },
    { label: "Modules", path: "/admin/modules", icon: Layers },
    { label: "Curriculum Designer", path: "/admin/curriculum-designer", icon: Network },
    { label: "AI Curriculum Import", path: "/admin/curriculum-import", icon: UploadCloud },
  ] },
  { title: "Users", items: [
    { label: "Students", path: "/tutor/students", icon: Users },
    { label: "Tutor Accounts", path: "/admin/tutors", icon: ShieldCheck },
    { label: "Enrolments", path: "/tutor/enrollments", icon: ClipboardList },
  ] },
  { title: "Operations", items: [
    { label: "Timetable", path: "/tutor/timetable", icon: CalendarDays },
    { label: "Attendance", path: "/tutor/attendance", icon: CalendarCheck },
    { label: "Assessments", path: "/tutor/assessments", icon: ClipboardList },
    { label: "Finance", path: "/tutor/finance", icon: CircleDollarSign },
    { label: "Donate", path: "/donate", icon: HeartHandshake },
  ] },
  { title: "Communication", items: [
    { label: "Announcements", path: "/tutor/announcements", icon: Bell },
    { label: "Messages", path: "/tutor/messages", icon: MessageCircle },
  ] },
  { title: "System", items: [
    { label: "System Status", path: "/admin/system-status", icon: Activity },
    { label: "Institution Settings", path: "/admin/settings", icon: Settings },
    { label: "Founder Diagnostics", path: "/founder/diagnostics", icon: MonitorCog },
    { label: "Platform Console", path: "/platform", icon: Command },
  ] },
];

const labels: Record<string, string> = {
  "academic-years": "Academic Years",
  semesters: "Semesters",
  departments: "Departments",
  tutors: "Tutor Accounts",
  programmes: "Programmes",
  "course-units": "Course Units",
  modules: "Modules",
  settings: "Institution Settings",
  "system-status": "System Status",
  "curriculum-designer": "Curriculum Designer",
  "curriculum-import": "AI Curriculum Import",
};

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  async function logout() {
    await signOut(auth);
    navigate("/login", { replace: true });
  }
  return <div className="flex h-full flex-col bg-slate-950 text-white">
    <div className="border-b border-slate-800 p-6">
      <Link to="/admin" onClick={onNavigate}>
        <h1 className="text-2xl font-bold text-violet-400">Medical Elites</h1>
        <p className="mt-1 text-sm text-slate-400">Institution Control Centre</p>
      </Link>
    </div>
    <nav className="flex-1 space-y-6 overflow-y-auto p-4">
      {groups.map((group) => <div key={group.title}>
        <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">{group.title}</p>
        <div className="space-y-1">
          {group.items.map((item) => {
            const Icon = item.icon;
            return <NavLink key={item.path} to={item.path} end={item.end} onClick={onNavigate}
              className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? "bg-violet-700 text-white shadow-lg shadow-violet-950/30" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
              <Icon size={18} /><span>{item.label}</span>
            </NavLink>;
          })}
        </div>
      </div>)}
    </nav>
    <div className="border-t border-slate-800 p-4">
      <button type="button" onClick={() => void logout()} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-950/40 hover:text-red-200">
        <LogOut size={18} /> Logout
      </button>
    </div>
  </div>;
}

export default function AdminLayout({ title, subtitle, children }: Props) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const segments = location.pathname.split("/").filter(Boolean).slice(1);
  return <div className="min-h-screen bg-slate-100">
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 lg:block"><Sidebar /></aside>
      {open && <div className="fixed inset-0 z-50 lg:hidden">
        <button type="button" aria-label="Close administrator navigation" className="absolute inset-0 bg-slate-950/60" onClick={() => setOpen(false)} />
        <aside className="relative h-full w-[min(19rem,88vw)] shadow-2xl">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-300 hover:bg-slate-800"><X size={22}/></button>
          <Sidebar onNavigate={() => setOpen(false)} />
        </aside>
      </div>}
      <main className="min-w-0 flex-1">
        <header className="border-b bg-white px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <button type="button" aria-label="Open administrator navigation" onClick={() => setOpen(true)} className="mt-0.5 rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-50 lg:hidden"><Menu size={22}/></button>
                <div className="min-w-0">
                  <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                    <Link to="/admin" className="font-medium hover:text-violet-700">Dashboard</Link>
                    {segments.map((segment, index) => <span key={segment} className="flex items-center gap-1"><ChevronRight size={14}/><span className="capitalize text-slate-700">{labels[segment] ?? segment.replaceAll("-", " ")}</span>{index < segments.length - 1 ? null : null}</span>)}
                  </nav>
                  <h1 className="truncate text-2xl font-bold text-slate-950 sm:text-3xl">{title}</h1>
                  {subtitle && <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">{subtitle}</p>}
                </div>
              </div>
              <HeaderActions />
            </div>
          </div>
        </header>
        <section className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-10">{children}</section>
      </main>
    </div>
  <MediFloatingAssistant/></div>;
}
