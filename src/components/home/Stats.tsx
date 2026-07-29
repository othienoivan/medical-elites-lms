import { BrainCircuit, ClipboardCheck, MonitorSmartphone, UsersRound } from "lucide-react";

const strengths = [
  { icon: UsersRound, label: "Role-based portals", text: "Focused workspaces for students, tutors and administrators." },
  { icon: ClipboardCheck, label: "Assessment workflows", text: "Create, deliver, mark and review academic assessments." },
  { icon: BrainCircuit, label: "AI-enabled tools", text: "Accelerate curriculum, lesson and question development." },
  { icon: MonitorSmartphone, label: "Accessible anywhere", text: "Responsive learning on phones, tablets and computers." },
];

export default function Stats() {
  return (
    <section aria-label="Platform strengths" className="border-y border-slate-200 bg-white py-10">
      <div className="mx-auto grid max-w-7xl gap-5 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {strengths.map(({ icon: Icon, label, text }) => (
          <div key={label} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Icon size={22} /></span>
            <div>
              <p className="font-bold text-slate-900">{label}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
