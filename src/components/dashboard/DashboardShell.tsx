import type { ReactNode } from "react";

import Container from "../ui/Container";

export type DashboardTone = "student" | "tutor" | "admin" | "founder";

const toneClasses: Record<DashboardTone, string> = {
  student: "from-blue-700 via-indigo-700 to-sky-700",
  tutor: "from-emerald-700 via-teal-700 to-cyan-700",
  admin: "from-violet-700 via-purple-700 to-indigo-700",
  founder: "from-slate-950 via-slate-900 to-amber-900",
};

export default function DashboardShell({
  tone,
  header,
  children,
}: {
  tone: DashboardTone;
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className={`bg-gradient-to-r ${toneClasses[tone]}`}>
        <Container className="py-8 md:py-10">{header}</Container>
      </div>
      <Container className="py-8 md:py-10">{children}</Container>
    </div>
  );
}
