import {
  BookOpen,
  GraduationCap,
  Clock3,
  Trophy,
} from "lucide-react";

import Container from "../ui/Container";
import Section from "../ui/Section";

const stats = [
  {
    icon: BookOpen,
    value: "30+",
    title: "Medical Courses",
  },
  {
    icon: GraduationCap,
    value: "100+",
    title: "Interactive Lessons",
  },
  {
    icon: Trophy,
    value: "80%",
    title: "Mastery Required",
  },
  {
    icon: Clock3,
    value: "24/7",
    title: "Online Learning",
  },
];

export default function Statistics() {
  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-8 text-center shadow-sm transition hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <Icon size={28} />
                </div>

                <h2 className="mt-5 text-4xl font-bold text-slate-900">
                  {item.value}
                </h2>

                <p className="mt-2 text-slate-600">
                  {item.title}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}