import { useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  FileEdit,
  FilePlus2,
  FileQuestion,
  GraduationCap,
  Home,
  HeartHandshake,
  Layers,
  Link2,
  PackageOpen,
  Megaphone,
  Menu,
  MessageCircle,
  PlusCircle,
  Presentation,
  Settings,
  Sparkles,
  Stethoscope,
  Users,
  UploadCloud,
  WalletCards,
  LogOut,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../firebase/auth";

import MediFloatingAssistant from "../MediFloatingAssistant";
import HeaderActions from "../HeaderActions";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

type NavigationItem = {
  name: string;
  icon: React.ElementType;
  path: string;
  end?: boolean;
};

type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", icon: Home, path: "/tutor", end: true }],
  },
  {
    title: "Academic Management",
    items: [
      { name: "Programmes", icon: GraduationCap, path: "/tutor/programmes" },
      { name: "New Programme", icon: PlusCircle, path: "/tutor/programmes/new" },
      { name: "Course Units", icon: BookOpen, path: "/tutor/course-units" },
      { name: "New Course Unit", icon: FilePlus2, path: "/tutor/course-units/new" },
      { name: "Modules", icon: Layers, path: "/tutor/modules" },
      { name: "New Module", icon: PlusCircle, path: "/tutor/modules/new" },
      { name: "Lessons", icon: Presentation, path: "/tutor/lessons" },
      { name: "New Lesson", icon: PlusCircle, path: "/tutor/lessons/new" },
      { name: "Lesson Builder", icon: FileEdit, path: "/tutor/lessons/builder" },
      { name: "Learning Packages", icon: PackageOpen, path: "/tutor/learning-packages" },
      { name: "AI Curriculum Import", icon: UploadCloud, path: "/tutor/curriculum-import" },
    ],
  },
  {
    title: "Assessments",
    items: [
      { name: "Assessment Workspace", icon: FileQuestion, path: "/tutor/assessments" },
      { name: "Question Bank", icon: FileQuestion, path: "/tutor/questions" },
      { name: "Quiz Bank", icon: FileQuestion, path: "/tutor/quizzes" },
      { name: "Examination Bank", icon: FileQuestion, path: "/tutor/exams" },
      { name: "Submission Inbox", icon: FileEdit, path: "/tutor/submissions" },
      { name: "Gradebook", icon: BarChart3, path: "/tutor/gradebook" },
      { name: "Class Analytics", icon: BarChart3, path: "/tutor/class-analytics" },
    ],
  },
  {
    title: "Learners & Clinical",
    items: [
      { name: "Students", icon: Users, path: "/tutor/students" },
      { name: "Registration Links", icon: Link2, path: "/tutor/registration-links" },
      { name: "Enrolments", icon: GraduationCap, path: "/tutor/enrollments" },
      { name: "Clinical Logbook", icon: Stethoscope, path: "/tutor/clinical-logbook" },
      { name: "Attendance", icon: CalendarCheck, path: "/tutor/attendance" },
      { name: "Timetable", icon: CalendarDays, path: "/tutor/timetable" },
    ],
  },
  {
    title: "Institution & Communication",
    items: [
      { name: "Finance", icon: WalletCards, path: "/tutor/finance" },
      { name: "Announcements", icon: Megaphone, path: "/tutor/announcements" },
      { name: "Messages", icon: MessageCircle, path: "/tutor/messages" },
      { name: "Notifications", icon: Bell, path: "/tutor/notifications" },
      { name: "Medi AI", icon: Sparkles, path: "/tutor/ai-assistant" },
      { name: "Donate", icon: HeartHandshake, path: "/donate" },
    ],
  },
  {
    title: "System",
    items: [{ name: "Curriculum Explorer", icon: Settings, path: "/tutor/curriculum" }],
  },
];

const breadcrumbLabels: Record<string, string> = {
  programmes: "Programmes",
  "course-units": "Course Units",
  modules: "Modules",
  lessons: "Lessons",
  assessments: "Assessments",
  questions: "Question Bank",
  quizzes: "Quiz Bank",
  exams: "Examination Bank",
  submissions: "Submissions",
  gradebook: "Gradebook",
  "automatic-gradebook": "Automatic Gradebook",
  "class-analytics": "Class Analytics",
  students: "Students",
  enrollments: "Enrolments",
  "clinical-logbook": "Clinical Logbook",
  attendance: "Attendance",
  timetable: "Timetable",
  finance: "Finance",
  announcements: "Announcements",
  messages: "Messages",
  notifications: "Notifications",
  "ai-assistant": "Medi AI",
  curriculum: "Curriculum Explorer",
  "learning-packages": "Learning Packages",
  new: "New",
  builder: "Builder",
  preview: "Preview",
  analytics: "Analytics",
  mark: "Mark Submission",
  register: "Register Student",
  "registration-links": "Registration Links",
};

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await logoutUser();
    navigate("/login", { replace: true });
    onNavigate?.();
  }

  return (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="border-b border-slate-800 p-6">
        <Link to="/tutor" onClick={onNavigate} className="block">
          <h1 className="text-2xl font-bold text-blue-400">Medical Elites</h1>
          <p className="mt-1 text-sm text-slate-400">Academic Management Portal</p>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {navigationGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-blue-700 text-white shadow-lg shadow-blue-950/30"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`
                    }
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-4">
        <button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-950/40 hover:text-red-200">
          <LogOut size={18} aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default function TutorLayout({ title, subtitle, children }: Props) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const segments = location.pathname.split("/").filter(Boolean).slice(1);
  const breadcrumbItems = segments
    .filter((segment) => !/^[A-Za-z0-9_-]{18,}$/.test(segment))
    .map((segment, index) => ({
      label: breadcrumbLabels[segment] ?? segment.replaceAll("-", " "),
      path: `/tutor/${segments.slice(0, index + 1).join("/")}`,
    }));

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto lg:block">
          <Sidebar />
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close tutor navigation"
              className="absolute inset-0 bg-slate-950/60"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative h-full w-[min(19rem,88vw)] shadow-2xl">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <X size={22} />
              </button>
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <header className="border-b bg-white px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
            <div className="mx-auto max-w-[1600px]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <button
                    type="button"
                    aria-label="Open tutor navigation"
                    onClick={() => setMobileMenuOpen(true)}
                    className="mt-0.5 rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-50 lg:hidden"
                  >
                    <Menu size={22} />
                  </button>

                  <div className="min-w-0">
                    <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                      <Link to="/tutor" className="font-medium hover:text-blue-700">Dashboard</Link>
                      {breadcrumbItems.map((item, index) => (
                        <span key={`${item.path}-${index}`} className="flex items-center gap-1">
                          <ChevronRight size={14} aria-hidden="true" />
                          {index === breadcrumbItems.length - 1 ? (
                            <span className="capitalize text-slate-700">{item.label}</span>
                          ) : (
                            <Link to={item.path} className="capitalize hover:text-blue-700">{item.label}</Link>
                          )}
                        </span>
                      ))}
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
      <MediFloatingAssistant/>
    </div>
  );
}
