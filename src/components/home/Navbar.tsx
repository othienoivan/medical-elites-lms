import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import Logo from "../ui/Logo";
import Button from "../ui/Button";
import Container from "../ui/Container";

const links = [
  { to: "/about", label: "About" },
  { to: "/courses", label: "Course Units" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <Container className="flex min-h-20 items-center justify-between py-3">
        <Link to="/" aria-label="Medical Elites home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 font-semibold text-slate-600 lg:flex" aria-label="Public navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `transition hover:text-blue-700 ${isActive ? "text-blue-700" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login" className="hidden font-semibold text-slate-700 transition hover:text-blue-700 sm:inline">
            Sign in
          </Link>
          <Link to="/register" className="hidden sm:block">
            <Button size="sm">Create account</Button>
          </Link>
          <button
            type="button"
            className="rounded-xl border border-slate-300 p-2.5 text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 lg:hidden"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <Container className="space-y-1 py-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 font-semibold transition hover:bg-blue-50 hover:text-blue-700 ${
                    isActive ? "bg-blue-50 text-blue-700" : "text-slate-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold text-slate-700">
                Sign in
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white">
                Register
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
