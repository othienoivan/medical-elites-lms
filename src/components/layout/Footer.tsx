import { Heart, Mail } from "lucide-react";
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
            <p className="mt-2 uppercase tracking-[0.3em] text-blue-300">
              Learn • Practice • Excel
            </p>
            <p className="mt-5 max-w-sm leading-7 text-slate-400">
              A comprehensive medical education management system for learning,
              assessment, clinical training, finance, communication, and AI.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">Platform</h3>
            <ul className="space-y-3 text-slate-400">
              <li><Link to="/courses" className="hover:text-white">Course Units</Link></li>
              <li><Link to="/login?role=student" className="hover:text-white">Student Portal</Link></li>
              <li><Link to="/login?role=tutor" className="hover:text-white">Tutor Portal</Link></li>
              <li><Link to="/login?role=admin" className="hover:text-white">Administrator Portal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">Company</h3>
            <ul className="space-y-3 text-slate-400">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/testimonials" className="hover:text-white">Testimonials</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">Connect</h3>
            <p className="text-sm text-slate-400">
              Contact us for institutional deployment, training, and support.
            </p>
            <div className="mt-5 flex gap-4 text-2xl">
              <a
                href="mailto:othienoivan@gmail.com"
                className="transition hover:text-green-400"
                aria-label="Email Medical Elites"
              >
                <Mail size={24} />
              </a>
              <a
                href="https://github.com/othienoivan/medical-elites-lms"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
                aria-label="Medical Elites on GitHub"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-blue-400"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {year} Medical Elites.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={15} className="fill-red-500 text-red-500" /> from Othieno Ivan.
          </p>
          <p>Version 1.0.0 RC4</p>
        </div>
      </Container>
    </footer>
  );
}
