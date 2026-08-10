import {
  Bot,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  GraduationCap,
  LibraryBig,
  MessageSquareText,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
} from "lucide-react";

import Card from "../ui/Card";
import Container from "../ui/Container";
import Heading from "../ui/Heading";
import Section from "../ui/Section";

const capabilities = [
  { icon: GraduationCap, title: "Academic Learning", text: "Programmes, course units, modules, lessons, progression, timetables and attendance in one learning environment." },
  { icon: LibraryBig, title: "Professional Assessment", text: "Question banks, quizzes, assignments, grading, analytics and professional examination building." },
  { icon: Bot, title: "Medical Elites AI & Knowledge", text: "AI-assisted curriculum work, lesson authoring, question generation, contextual support and a role-aware knowledge centre." },
  { icon: ShoppingBag, title: "Tutor Marketplace", text: "Tutor products, public storefronts, carts, wishlists, purchases and a personal student learning library." },
  { icon: CircleDollarSign, title: "Commerce & Finance", text: "Flutterwave checkout, verified fulfilment, receipts, tutor wallets, commissions and revenue sharing." },
  { icon: Building2, title: "Institution Operations", text: "Multi-tenant academic administration, student and tutor management, finance and institutional workflows." },
  { icon: Stethoscope, title: "Clinical Education", text: "Clinical logbooks, competency tracking and practical learning workflows for health professions education." },
  { icon: MessageSquareText, title: "Communication", text: "Messaging, notifications, announcements, learner support and connected collaboration tools." },
  { icon: ChartNoAxesCombined, title: "Analytics", text: "Learning, class, seller, marketplace, finance and platform-level insights for better decisions." },
  { icon: ShieldCheck, title: "Secure Platform", text: "Role-aware access, tenant isolation, hardened Firebase rules, audit controls, monitoring and recovery readiness." },
];

export default function PlatformEcosystem() {
  return (
    <Section className="bg-slate-950 text-white">
      <Container>
        <Heading
          subtitle="One connected ecosystem"
          title="Everything health sciences education needs to teach, learn, assess and grow"
          align="center"
          dark
        />
        <p className="mx-auto mt-5 max-w-3xl text-center text-base leading-8 text-slate-200 sm:text-lg">
          Medical Elites brings academic delivery, professional assessment, Medi AI, clinical learning, institutional operations and a tutor-powered marketplace into one coordinated platform.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="!border !border-slate-700 !bg-slate-900 !text-white shadow-none">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-200">
                <Icon size={24} />
              </span>
              <h3 className="mt-5 text-xl font-bold text-white">{title}</h3>
              <p className="mt-3 leading-7 text-slate-200">{text}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
