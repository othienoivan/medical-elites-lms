import { Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { Link } from "react-router-dom";

import Container from "../ui/Container";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Medical Elites</h2>
            <p className="mt-2 uppercase tracking-[0.3em] text-blue-300">Learn • Practice • Excel</p>
            <p className="mt-5 max-w-sm leading-7 text-slate-300">
              A connected digital ecosystem for health professions education—learning, assessment, Medi AI, clinical training, institutional operations and educational commerce.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">Explore</h3>
            <ul className="space-y-3 text-slate-300">
              <li><Link to="/courses" className="hover:text-white">Course Units</Link></li>
              <li><Link to="/marketplace" className="hover:text-white">Marketplace</Link></li>
              <li><Link to="/testimonials" className="hover:text-white">Testimonials</Link></li>
              <li><Link to="/about" className="hover:text-white">About Medical Elites</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">Portals & Support</h3>
            <ul className="space-y-3 text-slate-300">
              <li><Link to="/login?role=student" className="hover:text-white">Student Portal</Link></li>
              <li><Link to="/login?role=tutor" className="hover:text-white">Tutor Portal</Link></li>
              <li><Link to="/login?role=admin" className="hover:text-white">Administrator Portal</Link></li>
              <li><Link to="/knowledge" className="hover:text-white">Knowledge Centre</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">Connect</h3>
            <p className="text-sm leading-6 text-slate-300">
              Institutional deployment, partnerships, training and platform support.
            </p>
            <a href="mailto:admin@medicalelites.org" className="mt-4 inline-flex items-center gap-2 font-semibold text-blue-200 hover:text-white">
              <Mail size={19} /> admin@medicalelites.org
            </a>
            <div className="mt-5 flex gap-4 text-2xl">
              <a href="mailto:admin@medicalelites.org" className="transition hover:text-green-400" aria-label="Email Medical Elites"><Mail size={24} /></a>
              <a href="https://github.com/othienoivan/medical-elites-lms" target="_blank" rel="noreferrer" className="transition hover:text-white" aria-label="Medical Elites on GitHub"><FaGithub /></a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="transition hover:text-blue-400" aria-label="LinkedIn"><FaLinkedin /></a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-800 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Medical Elites. All rights reserved.</p>
          <p>Medical Elites Platform • Uganda</p>
        </div>
      </Container>
    </footer>
  );
}
