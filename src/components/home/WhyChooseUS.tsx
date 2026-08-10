import {
  Award,
  BarChart3,
  BookOpenCheck,
  Brain,
  MonitorSmartphone,
  UserRoundCheck,
} from "lucide-react";

import Card from "../ui/Card";
import Container from "../ui/Container";
import Heading from "../ui/Heading";
import Section from "../ui/Section";

const benefits = [
  {
    icon: BookOpenCheck,
    title: "Structured Health Sciences Learning",
    text: "Programmes, course units, modules and lessons give learners a clear, structured learning path.",
  },
  {
    icon: TrophyIcon,
    title: "Configurable Mastery & Attempts",
    text: "Tutor-defined pass marks and attempt limits support accountable progression through assessments.",
  },
  {
    icon: Brain,
    title: "Modern Digital Learning",
    text: "Learners access lessons, resources, quizzes, assessments and purchased learning products across devices.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    text: "Learners and tutors can monitor performance, completion, and quiz results.",
  },
  {
    icon: UserRoundCheck,
    title: "Tutor & Medi AI Support",
    text: "Health sciences educators guide learning while Medi AI and the Knowledge Centre provide contextual support.",
  },
  {
    icon: MonitorSmartphone,
    title: "Learn Anywhere",
    text: "The platform is built for phones, tablets, and computers.",
  },
  {
    icon: Award,
    title: "Marketplace & Learning Library",
    text: "Students can discover tutor products, complete secure checkout and access fulfilled purchases in My Library.",
  },
];

function TrophyIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M5 5H3v2a4 4 0 0 0 4 4" />
      <path d="M19 5h2v2a4 4 0 0 1-4 4" />
    </svg>
  );
}

export default function WhyChooseUs() {
  return (
    <Section id="why" className="bg-slate-100">
      <Container>
        <Heading
          subtitle="Why Medical Elites?"
          title="Built for serious healthcare education"
          align="center"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="group border border-slate-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                  <Icon size={28} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {item.text}
                </p>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}