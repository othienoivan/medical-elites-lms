import { Brain, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

const items = [
  {
    icon: Brain,
    title: "Mastery-Based Learning",
    text: "Learners progress only after demonstrating competence.",
  },
  {
    icon: Sparkles,
    title: "Interactive Lessons",
    text: "PowerPoint content transformed into structured digital learning.",
  },
  {
    icon: GraduationCap,
    title: "Certificates",
    text: "Completion certificates prepared for future verification.",
  },
  {
    icon: ShieldCheck,
    title: "Serious Standards",
    text: "Designed for disciplined medical and health sciences training.",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why" className="bg-slate-100 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="font-semibold text-blue-700">Why Medical Elites?</p>
        <h3 className="mt-2 text-3xl font-bold text-slate-950">
          Built for serious healthcare education
        </h3>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <item.icon className="text-blue-700" size={32} />
              <h4 className="mt-4 text-lg font-bold">{item.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}