import {
  Calendar,
  FileText,
  GraduationCap,
  Layers,
  Plus,
  Search,
  Timer,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useExaminations from "../hooks/useExaminations";

export default function ExaminationBankPage() {
  const navigate = useNavigate();
  const { examinations, loading } = useExaminations();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all");

  const filteredExaminations = useMemo(() => {
    const keyword = search.toLowerCase();

    return examinations.filter((exam) => {
      const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
      return matchesStatus && (
        exam.title.toLowerCase().includes(keyword) ||
        exam.examinationName.toLowerCase().includes(keyword) ||
        exam.institutionName.toLowerCase().includes(keyword) ||
        exam.academicYear.toLowerCase().includes(keyword) ||
        exam.courseUnitTitle?.toLowerCase().includes(keyword) ||
        exam.programmeTitle?.toLowerCase().includes(keyword)
      );
    });
  }, [examinations, search, statusFilter]);

  return (
    <TutorLayout
      title="Examination Bank"
      subtitle="Create, organise and manage professional medical examination papers."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              Professional Examination Centre
            </h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Manage candidate papers, examiner papers, structured sections,
              clinical cases, OSCE/OSPE stations and marking guides.
            </p>
          </div>

          <Button
            className="bg-white text-blue-700 hover:bg-blue-50"
            onClick={() => navigate("/tutor/exams/builder")}
          >
            <Plus size={18} />
            New Examination
          </Button>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          title="Examinations"
          value={loading ? "..." : examinations.length}
          icon={FileText}
        />

        <StatCard title="Sections" value="Structured" icon={Layers} />

        <StatCard title="Papers" value="Candidate / Examiner" icon={GraduationCap} />
      </section>

      <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            All Examinations
          </h2>

          <p className="mt-1 text-slate-600">
            Search examination papers by title, institution, academic year,
            programme or course unit.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 md:max-w-2xl md:flex-row">
          <select aria-label="Filter examinations by status" value={statusFilter} onChange={event=>setStatusFilter(event.target.value as typeof statusFilter)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700">
            <option value="all">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
          </select>
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-4 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search examinations..."
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-700"
          />
        </div>
        </div>
      </section>

      {loading ? (
        <Card>Loading examinations...</Card>
      ) : filteredExaminations.length === 0 ? (
        <Card className="text-center">
          <FileText size={56} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-bold">
            No Examinations Found
          </h2>

          <p className="mt-2 text-slate-600">
            Start building professional examination papers from your question
            bank.
          </p>

          <Button
            className="mt-6"
            onClick={() => navigate("/tutor/exams/builder")}
          >
            Create First Examination
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExaminations.map((exam) => (
            <Card key={exam.id}>
              <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{exam.status}</Badge>
                    <Badge>{exam.academicYear}</Badge>
                    {exam.semester && <Badge>{exam.semester}</Badge>}
                  </div>

                  <p className="mt-4 text-sm font-semibold text-blue-700">
                    {exam.institutionName}
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-950">
                    {exam.title}
                  </h2>

                  <p className="mt-2 text-slate-600">
                    {exam.examinationName}
                  </p>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                    <InfoRow
                      icon={Layers}
                      text={`${exam.sections.length} section(s)`}
                    />

                    <InfoRow
                      icon={GraduationCap}
                      text={`${exam.totalMarks} marks`}
                    />

                    <InfoRow
                      icon={Timer}
                      text={exam.timeAllowed || "Time not set"}
                    />

                    <InfoRow
                      icon={Calendar}
                      text={exam.academicYear || "Academic year not set"}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/tutor/exams/${exam.id}`)}
                  >
                    View
                  </Button>

                  <Button
                    onClick={() =>
                      navigate(`/tutor/exams/${exam.id}/builder`)
                    }
                  >
                    Open Builder
                  </Button>
                </div>
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

function InfoRow({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <p className="flex items-center gap-2">
      <Icon size={16} className="text-blue-700" />
      {text}
    </p>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {children}
    </span>
  );
}