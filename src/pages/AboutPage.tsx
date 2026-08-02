import { Brain, GraduationCap, HeartPulse, ShieldCheck, Target, Users } from "lucide-react";

import PublicLayout from "../components/layout/PublicLayout";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import Section from "../components/ui/Section";

const values = [
  { title: "Excellence", text: "We design tools that support rigorous, competency-based health-professions education.", icon: Target },
  { title: "Integrity", text: "We protect learner records, respect academic standards, and promote responsible technology use.", icon: ShieldCheck },
  { title: "Innovation", text: "We combine modern learning technology, analytics, and AI to improve teaching and learning.", icon: Brain },
  { title: "Service", text: "We build for tutors, students, administrators, and institutions working to improve healthcare.", icon: HeartPulse },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white">
        <Container className="py-20 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-blue-200">About Us</p>
          <h1 className="mx-auto mt-4 max-w-4xl text-5xl font-extrabold leading-tight">
            Advancing medical education through technology, structure, and innovation
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-blue-100">
            Medical Elites is a comprehensive medical education management system created to support learning, assessment, clinical training, communication, finance, and institutional administration.
          </p>
        </Container>
      </section>

      <Section>
        <Container className="grid gap-8 lg:grid-cols-2">
          <Card>
            <GraduationCap className="text-blue-700" size={36} />
            <h2 className="mt-5 text-3xl font-bold text-slate-950">Our Mission</h2>
            <p className="mt-4 leading-8 text-slate-600">
              To empower health training institutions, tutors, and learners with an integrated digital platform that improves teaching quality, academic accountability, clinical competence, and access to reliable learning support.
            </p>
          </Card>
          <Card>
            <Users className="text-blue-700" size={36} />
            <h2 className="mt-5 text-3xl font-bold text-slate-950">Our Vision</h2>
            <p className="mt-4 leading-8 text-slate-600">
              To become a trusted medical education technology platform for health training institutions across Africa and beyond.
            </p>
          </Card>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">Our Values</p>
            <h2 className="mt-3 text-4xl font-extrabold text-slate-950">What guides our work</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {values.map(({ title, text, icon: Icon }) => (
              <Card key={title}>
                <Icon className="text-blue-700" size={30} />
                <h3 className="mt-4 text-xl font-bold text-slate-950">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-xl md:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">Founder</p>
            <h2 className="mt-3 text-4xl font-extrabold text-white">Othieno Ivan</h2>
            <p className="mt-2 text-lg font-semibold text-blue-200">Founder, Medical Educator &amp; Lead Developer</p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-100">
              Medical Elites was developed from a practical understanding of the needs of health sciences tutors and students. The platform is designed to make teaching, learning, assessment, clinical supervision, communication, and academic administration more efficient and accountable.
            </p>
          </div>
        </Container>
      </Section>
    </PublicLayout>
  );
}
