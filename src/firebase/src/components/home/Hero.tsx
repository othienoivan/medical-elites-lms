import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Container from "../ui/Container";

export default function Hero() {
  return (
    <section>
      <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <Badge>Medical education built for serious learners</Badge>

          <h2 className="mt-4 text-5xl font-extrabold leading-tight tracking-tight text-slate-950">
            Become an elite healthcare professional.
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Study structured medical courses, complete interactive lessons, pass
            mastery-based quizzes, and track your progress from one module to
            the next.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/courses">
              <Button className="gap-2">
                Explore Courses <ArrowRight size={18} />
              </Button>
            </Link>

            <Link to="/login">
              <Button variant="outline">Start Learning</Button>
            </Link>
          </div>

          <div className="mt-8 grid gap-3 text-sm font-medium text-slate-600 sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="text-green-600" size={18} />
              80% mastery progression
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="text-green-600" size={18} />
              Tutor-guided learning
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="rounded-2xl bg-blue-700 p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
              Featured Module
            </p>
            <h3 className="mt-3 text-3xl font-bold">
              Introduction to Pathology
            </h3>
            <p className="mt-4 text-blue-100">
              Learn disease concepts, etiology, pathogenesis, diagnostic
              methods, and clinical application.
            </p>

            <div className="mt-6 rounded-xl bg-white/10 p-4">
              <p className="font-semibold">Progression Rule</p>
              <p className="mt-1 text-sm text-blue-100">
                Complete lesson → take quiz → score at least 80% → unlock next
                module.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}