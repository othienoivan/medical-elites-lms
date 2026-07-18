import { useState, type ReactNode } from "react";
import {
  Bell, BookOpen, CalendarCheck, CalendarDays, ChevronRight, ClipboardCheck,
  Clock3, GraduationCap, Home, LogOut, Menu, MessageCircle, ReceiptText,
  Sparkles, Stethoscope, User, X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import HeaderActions from "../HeaderActions";
import { logoutUser } from "../../firebase/auth";

type Props = { children: ReactNode };
type Item = { name: string; path: string; icon: React.ElementType; end?: boolean };
type Group = { title: string; items: Item[] };

const groups: Group[] = [
  { title: "Overview", items: [{ name: "Dashboard", path: "/dashboard", icon: Home, end: true }] },
  { title: "Learning", items: [
    { name: "My Courses", path: "/my-courses", icon: BookOpen },
    { name: "Assessments", path: "/assessments", icon: ClipboardCheck },
    { name: "Assessment History", path: "/assessment-history", icon: Clock3 },
  ]},
  { title: "Academic", items: [
    { name: "Timetable", path: "/timetable", icon: CalendarDays },
    { name: "Attendance", path: "/attendance", icon: CalendarCheck },
    { name: "Clinical Logbook", path: "/clinical-logbook", icon: Stethoscope },
    { name: "Finance", path: "/finance", icon: ReceiptText },
  ]},
  { title: "Communication", items: [
    { name: "Messages", path: "/messages", icon: MessageCircle },
    { name: "Notifications", path: "/notifications", icon: Bell },
  ]},
  { title: "Support", items: [
    { name: "Ask Medi", path: "/ai-assistant", icon: Sparkles },
    { name: "My Profile", path: "/dashboard", icon: User },
  ]},
];

const labels: Record<string, string> = {
  dashboard: "Dashboard", "my-courses": "My Courses", assessments: "Assessments",
  "assessment-history": "Assessment History", timetable: "Timetable", attendance: "Attendance",
  "clinical-logbook": "Clinical Logbook", finance: "Finance", messages: "Messages",
  notifications: "Notifications", "ai-assistant": "Medi AI", lesson: "Lesson",
};

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  async function logout() { await logoutUser(); navigate("/login", { replace: true }); }
  return <div className="flex h-full flex-col bg-slate-950 text-white">
    <div className="border-b border-slate-800 p-6">
      <Link to="/dashboard" onClick={onNavigate} className="block">
        <h1 className="text-2xl font-bold text-blue-400">Medical Elites</h1>
        <p className="mt-1 text-sm text-slate-400">Student Learning Portal</p>
      </Link>
    </div>
    <nav className="flex-1 space-y-6 overflow-y-auto p-4">
      {groups.map((group) => <div key={group.title}>
        <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">{group.title}</p>
        <div className="space-y-1">{group.items.map((item) => {
          const Icon = item.icon;
          return <NavLink key={item.path} to={item.path} end={item.end} onClick={onNavigate}
            className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? "bg-blue-700 text-white shadow-lg shadow-blue-950/30" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <Icon size={18}/><span>{item.name}</span>
          </NavLink>;
        })}</div>
      </div>)}
    </nav>
    <div className="border-t border-slate-800 p-4">
      <button type="button" onClick={() => void logout()} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-950/40">
        <LogOut size={18}/> Logout
      </button>
    </div>
  </div>;
}

export default function StudentLayout({ children }: Props) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  return <div className="min-h-screen bg-slate-100">
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 lg:block"><Sidebar/></aside>
      {open && <div className="fixed inset-0 z-50 lg:hidden">
        <button type="button" aria-label="Close student navigation" className="absolute inset-0 bg-slate-950/60" onClick={() => setOpen(false)}/>
        <aside className="relative h-full w-[min(19rem,88vw)] shadow-2xl">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-300 hover:bg-slate-800"><X size={22}/></button>
          <Sidebar onNavigate={() => setOpen(false)}/>
        </aside>
      </div>}
      <main id="main-content" className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" aria-label="Open student navigation" onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 p-2.5 text-slate-700 lg:hidden"><Menu size={22}/></button>
              <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm text-slate-500">
                <Link to="/dashboard" className="font-semibold text-blue-700"><GraduationCap size={18}/></Link>
                {segments.map((segment, index) => <span key={`${segment}-${index}`} className="flex min-w-0 items-center gap-1"><ChevronRight size={14}/><span className="truncate capitalize text-slate-700">{labels[segment] ?? segment.replaceAll("-", " ")}</span></span>)}
              </nav>
            </div>
            <HeaderActions/>
          </div>
        </header>
        <div>{children}</div>
      </main>
    </div>
  </div>;
}
