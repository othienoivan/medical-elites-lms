import { Link } from "react-router-dom";
import Logo from "../ui/Logo";
import Button from "../ui/Button";
import Container from "../ui/Container";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <Logo />

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
          <Link to="/register">
            <Button>Register</Button>
          </Link>
        </div>
      </Container>
    </header>
  );
}