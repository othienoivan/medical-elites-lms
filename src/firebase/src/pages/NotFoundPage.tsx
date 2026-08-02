import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950">
          Page not found
        </h1>
        <p className="mt-4 text-slate-600">
          The address may be incorrect, or the page may have been moved.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Go back
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home size={18} />
            Home
          </Button>
        </div>
      </section>
    </main>
  );
}
