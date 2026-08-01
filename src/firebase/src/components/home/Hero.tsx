import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Container from "../ui/Container";

const capabilityCards = [
  { icon: GraduationCap, label: "Learning & progression" },
  { icon: ClipboardCheck, label: "Assessment & exams" },
  { icon: Bot, label: "AI-assisted education" },
  { icon: ShoppingBag, label: "Marketplace & commerce" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-slate-50">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-blue-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />

      <Container className="relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-24">
        <div>
          <Badge>Health sciences education, powered by one platform</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Teach, learn, assess and build an education business with Medical Elites.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            A secure digital ecosystem for institutions, tutors and students—combining an LMS, professional assessments, AI tools, finance, Flutterwave commerce and a health sciences marketplace.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/register"><Button className="w-full gap-2 sm:w-auto">Create free account <ArrowRight size={18} /></Button></Link>
            <Link to="/marketplace"><Button variant="outline" className="w-full sm:w-auto">Explore marketplace</Button></Link>
            <Link to="/courses"><Button variant="outline" className="w-full sm:w-auto">Browse course units</Button></Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
            <p className="flex items-center gap-2"><CheckCircle2 className="text-emerald-600" size={18} /> Mobile-friendly learning</p>
            <p className="flex items-center gap-2"><ShieldCheck className="text-emerald-600" size={18} /> Secure role-based access</p>
            <p className="flex items-center gap-2"><Building2 className="text-emerald-600" size={18} /> Built for schools and independent tutors</p>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] border border-white/70 bg-white p-4 shadow-2xl shadow-blue-950/10 sm:p-6">
            <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Medical Elites Platform</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">One connected health education ecosystem</h2>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {capabilityCards.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/25 text-blue-200"><Icon size={21} /></span>
                    <span className="font-semibold text-slate-100">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-blue-600 p-5">
                <p className="text-sm font-bold uppercase tracking-wider text-blue-100">Designed for</p>
                <p className="mt-2 text-lg font-semibold">Students • Tutors • Institutions • Content creators</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
