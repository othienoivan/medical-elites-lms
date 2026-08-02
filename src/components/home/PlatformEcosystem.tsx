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
} from "lucide-react";

import Card from "../ui/Card";
import Container from "../ui/Container";
import Heading from "../ui/Heading";
import Section from "../ui/Section";

const capabilities = [
  { icon: GraduationCap, title: "Learning Management", text: "Programmes, course units, modules, lessons, progression and certificates." },
  { icon: LibraryBig, title: "Assessment Suite", text: "Question banks, quizzes, assignments and professional examination building." },
  { icon: Bot, title: "Medical Elites AI", text: "AI-assisted lesson development, question generation and role-aware support." },
  { icon: ShoppingBag, title: "Education Marketplace", text: "Tutor and institution storefronts, products, carts, orders and entitlements." },
  { icon: CircleDollarSign, title: "Commerce & Finance", text: "Flutterwave checkout, invoices, receipts, wallets and revenue sharing." },
  { icon: Building2, title: "Institution Operations", text: "Academic administration, student management, attendance and ERP workflows." },
  { icon: MessageSquareText, title: "Communication", text: "Messaging, notifications, announcements and learner support." },
  { icon: ChartNoAxesCombined, title: "Analytics", text: "Learning, seller, marketplace, finance and platform-level insights." },
  { icon: ShieldCheck, title: "Secure Platform", text: "Role-based access, hardened Firebase rules, monitoring and recovery controls." },
];

export default function PlatformEcosystem() {
  return (
    <Section className="bg-slate-950 text-white">
      <Container>
        <Heading
          subtitle="One connected ecosystem"
          title="Everything health sciences education needs to teach, learn and grow"
          align="center"
        />
        <p className="mx-auto mt-5 max-w-3xl text-center leading-7 text-slate-300">
          Medical Elites combines academic delivery, AI, institutional management, assessment, commerce and marketplace capabilities in one coordinated platform.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="border-slate-800 bg-slate-900 text-white">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-300">
                <Icon size={24} />
              </span>
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{text}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
