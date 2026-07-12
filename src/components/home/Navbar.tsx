import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

import Logo from "../ui/Logo";
import Button from "../ui/Button";
import Container from "../ui/Container";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <Link to="/" aria-label="Medical Elites home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 font-semibold text-slate-600 lg:flex" aria-label="Public navigation">
          <Link to="/about" className="hover:text-blue-700">About</Link>
          <Link to="/courses" className="hover:text-blue-700">Courses</Link>
          <Link to="/testimonials" className="hover:text-blue-700">Testimonials</Link>
          <Link to="/contact" className="hover:text-blue-700">Contact</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login" className="hidden font-semibold text-slate-700 hover:text-blue-700 sm:inline">
            Login
          </Link>
          <Link to="/register">
            <Button size="sm">Register</Button>
          </Link>
          <Link to="/about" className="rounded-lg border border-slate-300 p-2 text-slate-700 lg:hidden" aria-label="Open public information pages">
            <Menu size={20} />
          </Link>
        </div>
      </Container>
    </header>
  );
}
