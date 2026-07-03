import { Mail } from "lucide-react";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa6";
import { Link } from "react-router-dom";

import Container from "../ui/Container";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white">
              Medical Elites
            </h2>

            <p className="mt-2 uppercase tracking-[0.3em] text-blue-300">
              Learn • Practice • Excel
            </p>

            <p className="mt-6 leading-7 text-slate-400">
              Empowering healthcare professionals through modern,
              competency-based digital learning.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">Learning</h3>

            <ul className="space-y-3 text-slate-400">
              <li>
                <Link to="/courses" className="hover:text-white">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white">
                  Learning Paths
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white">
                  Assessments
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white">
                  Certificates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">Company</h3>

            <ul className="space-y-3 text-slate-400">
              <li>
                <a href="#why" className="hover:text-white">
                  Why Medical Elites
                </a>
              </li>
              <li>
                <Link to="/" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">Connect</h3>

            <p className="text-sm text-slate-400">
              Follow Medical Elites and stay updated.
            </p>

            <div className="mt-4 flex gap-4 text-2xl">
              <a href="#" className="transition hover:text-blue-400" aria-label="Facebook">
                <FaFacebook />
              </a>

              <a href="#" className="transition hover:text-pink-400" aria-label="Instagram">
                <FaInstagram />
              </a>

              <a href="#" className="transition hover:text-blue-500" aria-label="LinkedIn">
                <FaLinkedin />
              </a>

              <a href="#" className="transition hover:text-gray-300" aria-label="GitHub">
                <FaGithub />
              </a>

              <a href="#" className="transition hover:text-red-500" aria-label="YouTube">
                <FaYoutube />
              </a>

              <a
                href="mailto:othienoivan@gmail.com"
                className="transition hover:text-green-400"
                aria-label="Email"
              >
                <Mail size={24} />
              </a>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              © 2026 Medical Elites.
              <br />
              All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}