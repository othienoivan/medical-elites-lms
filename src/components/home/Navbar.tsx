import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="block">
          <h1 className="text-2xl font-bold text-blue-700">Medical Elites</h1>
          <p className="text-xs font-semibold tracking-wide text-slate-500">
            LEARN • PRACTICE • EXCEL
          </p>
        </Link>

        <div className="hidden items-center gap-8 font-semibold text-slate-600 md:flex">
          <Link to="/courses" className="hover:text-blue-700">
            Courses
          </Link>
          <a href="#why" className="hover:text-blue-700">
            Why Us
          </a>
          <a href="#testimonials" className="hover:text-blue-700">
            Testimonials
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="font-semibold text-slate-700 hover:text-blue-700">
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800"
          >
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
}