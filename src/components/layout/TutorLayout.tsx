import type { ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  FileEdit,
  FilePlus2,
  FileQuestion,
  GraduationCap,
  Home,
  Layers,
  PlusCircle,
  Presentation,
  Settings,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const navigationGroups = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", icon: Home, path: "/tutor" }],
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
      { name: "Quizzes", icon: FileQuestion, path: "/tutor/quizzes" },
    ],
  },
  {
    title: "Learners",
    items: [{ name: "Students", icon: Users, path: "/tutor/students" }],
  },
  {
    title: "Reports",
    items: [{ name: "Analytics", icon: BarChart3, path: "/tutor/analytics" }],
  },
  {
    title: "System",
    items: [{ name: "Settings", icon: Settings, path: "/tutor/settings" }],
  },
];

export default function TutorLayout({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <aside className="sticky top-0 h-screen w-72 overflow-y-auto bg-slate-950 text-white">
          <div className="border-b border-slate-800 p-6">
            <h1 className="text-2xl font-bold text-blue-400">
              Medical Elites
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Academic Management Portal
            </p>
          </div>

          <nav className="space-y-6 p-4">
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
                        end={item.path === "/tutor"}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                            isActive
                              ? "bg-blue-700 text-white"
                              : "text-slate-300 hover:bg-slate-800"
                          }`
                        }
                      >
                        <Icon size={18} />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <header className="border-b bg-white px-10 py-8">
            <h1 className="text-3xl font-bold text-slate-950">{title}</h1>
            {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
          </header>

          <section className="p-10">{children}</section>
        </main>
      </div>
    </div>
  );
}