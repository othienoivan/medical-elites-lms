import { CalendarDays, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formattedDate() {
  return new Intl.DateTimeFormat("en-UG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function DailyBrief({
  name,
  subtitle,
  children,
}: {
  name: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="text-white">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-white/75">
            <CalendarDays size={17} /> {formattedDate()}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {greeting()}, {name} <span aria-hidden="true">👋</span>
          </h1>
          {subtitle && <p className="mt-2 max-w-3xl text-white/80">{subtitle}</p>}
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur lg:self-auto">
          <Sparkles size={17} /> Medical Elites Experience
        </div>
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
