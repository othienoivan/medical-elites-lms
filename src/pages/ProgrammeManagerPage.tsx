import { GraduationCap, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import useProgrammes from "../hooks/useProgrammes";

export default function ProgrammeManagerPage() {
  const navigate = useNavigate();
  const { programmes, loading } = useProgrammes();

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <Container className="flex items-center justify-between py-5">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              Programme Manager
            </h1>
            <p className="text-sm text-slate-500">
              Manage academic programmes.
            </p>
          </div>

          <Button
            className="gap-2"
            onClick={() => navigate("/tutor/programmes/new")}
          >
            <Plus size={18} />
            New Programme
          </Button>
        </Container>
      </header>

      <Container className="py-10">
        {loading ? (
          <p className="text-slate-600">Loading programmes...</p>
        ) : programmes.length === 0 ? (
          <Card className="text-center">
            <GraduationCap className="mx-auto text-slate-400" size={44} />

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No programmes yet
            </h2>

            <p className="mt-2 text-slate-600">
              Create your first programme to organize your curriculum.
            </p>

            <Button
              className="mt-6"
              onClick={() => navigate("/tutor/programmes/new")}
            >
              Create Programme
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {programmes.map((programme) => (
              <Card key={programme.id}>
                <p className="text-sm font-semibold text-blue-700">
                  {programme.level}
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {programme.title}
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {programme.description}
                </p>

                <p className="mt-4 text-sm text-slate-500">
                  Duration: {programme.duration}
                </p>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline">View</Button>
                  <Button variant="outline">Edit</Button>
                  <Button>Add Course Unit</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}