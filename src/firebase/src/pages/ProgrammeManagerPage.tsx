import {
  BookOpen,
  GraduationCap,
  Layers,
  Plus,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import TutorLayout from "../components/layout/TutorLayout";
import useProgrammes from "../hooks/useProgrammes";

export default function ProgrammeManagerPage() {
  const navigate = useNavigate();
  const { programmes, loading } = useProgrammes(true);

  const [search, setSearch] = useState("");

  const filteredProgrammes = useMemo(() => {
    const keyword = search.toLowerCase();

    return programmes.filter((programme) => {
      return (
        programme.title.toLowerCase().includes(keyword) ||
        (programme.description ?? "").toLowerCase().includes(keyword) ||
        (programme.level ?? "").toLowerCase().includes(keyword) ||
        (programme.duration ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [programmes, search]);

  return (
    <TutorLayout
      title="Programme Management"
      subtitle="Create, organise and manage academic programmes for Medical Elites LMS."
    >
        <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                Academic Programme Workspace
              </h2>

              <p className="mt-2 max-w-3xl text-blue-100">
                Manage health training programmes, link course units, build
                modules and structure your curriculum from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-white text-blue-700 hover:bg-blue-50"
                onClick={() => navigate("/tutor/programmes/new")}
              >
                <Plus size={18} />
                Create Programme
              </Button>

              <Button
                className="bg-white text-blue-700 hover:bg-blue-50"
                onClick={() => navigate("/tutor/course-units/new")}
              >
                <BookOpen size={18} />
                Add Course Unit
              </Button>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <StatCard
            title="Programmes"
            value={loading ? "..." : programmes.length}
            icon={GraduationCap}
          />

          <StatCard title="Course Units" value="Linked" icon={BookOpen} />

          <StatCard title="Modules" value="Structured" icon={Layers} />
        </section>

        <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              All Programmes
            </h2>

            <p className="mt-1 text-slate-600">
              Browse and manage the academic programmes available in the LMS.
            </p>
          </div>

          <div className="relative w-full md:max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-4 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search programmes..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-700"
            />
          </div>
        </section>

        {loading ? (
          <Card>Loading programmes...</Card>
        ) : filteredProgrammes.length === 0 ? (
          <Card className="text-center">
            <GraduationCap className="mx-auto text-slate-400" size={52} />

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No programmes found
            </h2>

            <p className="mt-2 text-slate-600">
              Create your first academic programme to organise your curriculum.
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
            {filteredProgrammes.map((programme) => (
              <Card key={programme.id}>
                <div className="flex flex-wrap gap-2">
                  <Badge>{programme.level}</Badge>
                  <Badge>{programme.duration}</Badge>
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-950">
                  {programme.title}
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {programme.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/tutor/curriculum")}
                  >
                    View Curriculum
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate(`/tutor/programmes/${programme.id}/edit`)}
                  >
                    Edit
                  </Button>

                  <Button onClick={() => navigate("/tutor/course-units/new")}>
                    Add Course Unit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
    </TutorLayout>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>

        <Icon size={36} className="text-blue-700" />
      </div>
    </Card>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {children}
    </span>
  );
}