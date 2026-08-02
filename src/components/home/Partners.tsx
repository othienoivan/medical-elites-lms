import { Building2, Handshake, ShieldCheck, Stethoscope } from "lucide-react";

import Button from "../ui/Button";
import Container from "../ui/Container";
import Section from "../ui/Section";
import { Link } from "react-router-dom";

const partnerSlots = [
  { label: "Health Training Institution", icon: Stethoscope },
  { label: "Teaching Hospital", icon: Building2 },
  { label: "Professional Association", icon: ShieldCheck },
  { label: "Education Partner", icon: Handshake },
];

export default function Partners() {
  return (
    <Section className="bg-slate-100">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">
            Our Partners
          </p>
          <h2 className="mt-3 text-4xl font-extrabold text-slate-950">
            Building the future of medical education together
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            We welcome collaboration with health training institutions,
            teaching hospitals, professional bodies, and education partners
            committed to excellence in healthcare education.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {partnerSlots.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm"
            >
              <Icon className="mx-auto text-blue-700" size={34} />
              <p className="mt-4 font-bold text-slate-800">{label}</p>
              <p className="mt-2 text-sm text-slate-500">Partner space</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/contact?subject=partnership">
            <Button>Become a Partner</Button>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
