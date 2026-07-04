import type { ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  FileQuestion,
  GraduationCap,
  Home,
  Layers,
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

const navigation = [
  {
    name: "Dashboard",
    icon: Home,
    path: "/tutor",
  },
  {
    name: "Programmes",
    icon: GraduationCap,
    path: "/tutor/programmes",
  },
  {
    name: "Course Units",
    icon: BookOpen,
    path: "/tutor/course-units",
  },
  {
    name: "Modules",
    icon: Layers,
    path: "/tutor/modules",
  },
  {
    name: "Lessons",
    icon: Presentation,
    path: "/tutor/lessons",
  },
  {
    name: "Quizzes",
    icon: FileQuestion,
    path: "/tutor/quizzes",
  },
  {
    name: "Students",
    icon: Users,
    path: "/tutor/students",
  },
  {
    name: "Analytics",
    icon: BarChart3,
    path: "/tutor/analytics",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/tutor/settings",
  },
];

export default function TutorLayout({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        {/* Sidebar */}

        <aside className="sticky top-0 h-screen w-72 bg-slate-950 text-white">
          <div className="border-b border-slate-800 p-6">
            <h1 className="text-2xl font-bold text-blue-400">
              Medical Elites
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Academic Management Portal
            </p>
          </div>

          <nav className="space-y-2 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                      isActive
                        ? "bg-blue-700 text-white"
                        : "text-slate-300 hover:bg-slate-800"
                    }`
                  }
                >
                  <Icon size={20} />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Main */}

        <main className="flex-1">
          <header className="border-b bg-white px-10 py-8">
            <h1 className="text-3xl font-bold text-slate-950">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-2 text-slate-600">
                {subtitle}
              </p>
            )}
          </header>

          <section className="p-10">{children}</section>
        </main>
      </div>
    </div>
  );
}