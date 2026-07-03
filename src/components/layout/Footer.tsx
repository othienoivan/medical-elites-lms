import { Facebook, Github, Instagram, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

import Container from "../ui/Container";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-white">
              Medical Elites
            </h2>

            <p className="mt-4 leading-7">
              Learn • Practice • Excel
            </p>

            <p className="mt-4 text-sm text-slate-400">
              Competency-based medical education built for serious healthcare
              professionals.
            </p>
          </div>

          {/* Academy */}
          <div>
            <h3 className="mb-4 font-bold text-white">
              Academy
            </h3>

            <ul className="space-y-3">
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/">Learning Paths</Link></li>
              <li><Link to="/">Certificates</Link></li>
              <li><Link to="/">Admissions</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-bold text-white">
              Company
            </h3>

            <ul className="space-y-3">
              <li><Link to="/why">Why Medical Elites</Link></li>
              <li><Link to="/">Contact</Link></li>
              <li><Link to="/">Privacy Policy</Link></li>
              <li><Link to="/">Terms</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 font-bold text-white">
              Connect
            </h3>

            <div className="flex gap-4">
              <Facebook />
              <Instagram />
              <Linkedin />
              <Github />
              <Mail />
            </div>

            <p className="mt-6 text-sm text-slate-500">
              © 2026 Medical Elites.
              <br />
              All Rights Reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}