import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  LockOpen,
  PenLine,
  Trophy,
  UserPlus,
} from "lucide-react";

import Container from "../ui/Container";
import Heading from "../ui/Heading";
import Section from "../ui/Section";

const steps = [
  {
    icon: UserPlus,
    title: "Register",
    text: "Create your Medical Elites learner account.",
  },
  {
    icon: BookOpen,
    title: "Enroll",
    text: "Choose a course and begin your structured learning path.",
  },
  {
    icon: PenLine,
    title: "Study",
    text: "Complete interactive lessons, notes, and guided activities.",
  },
  {
    icon: CheckCircle2,
    title: "Take Quiz",
    text: "Attempt the module quiz after completing the lesson.",
  },
  {
    icon: Trophy,
    title: "Score 80%+",
    text: "Demonstrate mastery before progressing.",
  },
  {
    icon: LockOpen,
    title: "Unlock",
    text: "Pass the quiz and unlock the next module automatically.",
  },
  {
    icon: GraduationCap,
    title: "Certificate",
    text: "Complete all modules and earn your certificate.",
  },
];

export default function LearningJourney() {
  return (
    <Section className="bg-white">
      <Container>
        <Heading
          subtitle="Learning Journey"
          title="How Medical Elites helps you master every module"
          align="center"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-7">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white">
                  <Icon size={26} />
                </div>

                <p className="mt-4 text-sm font-bold text-blue-700">
                  Step {index + 1}
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-950">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}