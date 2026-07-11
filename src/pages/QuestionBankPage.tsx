import {
  BookOpen,
  Brain,
  ClipboardList,
  Plus,
  Search,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useQuestions from "../hooks/useQuestions";

export default function QuestionBankPage() {
  const navigate = useNavigate();
  const { questions, loading } = useQuestions();

  const [search, setSearch] = useState("");

  function goToCreateQuestion() {
    sessionStorage.setItem("redirectAfterLogin", "/tutor/questions/new");
    navigate("/tutor/questions/new");
  }

  const filteredQuestions = useMemo(() => {
    const keyword = search.toLowerCase();

    return questions.filter((question) => {
      return (
        question.questionText.toLowerCase().includes(keyword) ||
        question.topic.toLowerCase().includes(keyword) ||
        question.type.toLowerCase().includes(keyword) ||
        question.difficulty.toLowerCase().includes(keyword) ||
        question.bloomLevel.toLowerCase().includes(keyword) ||
        question.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    });
  }, [questions, search]);

  return (
    <TutorLayout
      title="Question Bank"
      subtitle="Create, organise and reuse questions across lessons, CATs, module tests and examinations."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Medical Question Bank</h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Build reusable MCQs, true/false, SAQs, essays, EMQs and clinical
              questions for all assessments in the LMS.
            </p>
          </div>

          <Button
            className="bg-white text-blue-700 hover:bg-blue-50"
            onClick={goToCreateQuestion}
          >
            <Plus size={18} />
            New Question
          </Button>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          title="Questions"
          value={loading ? "..." : questions.length}
          icon={BookOpen}
        />

        <StatCard title="Bloom Levels" value="Tracked" icon={Brain} />

        <StatCard title="Assessment Use" value="Reusable" icon={Target} />
      </section>

      <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            All Questions
          </h2>

          <p className="mt-1 text-slate-600">
            Search by topic, question text, type, difficulty, Bloom level or
            tags.
          </p>
        </div>

        <div className="relative w-full md:max-w-lg">
          <Search
            size={18}
            className="absolute left-4 top-4 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search question bank..."
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-700"
          />
        </div>
      </section>

      {loading ? (
        <Card>Loading questions...</Card>
      ) : filteredQuestions.length === 0 ? (
        <Card className="text-center">
          <ClipboardList size={56} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-bold">No Questions Found</h2>

          <p className="mt-2 text-slate-600">
            Start building your reusable medical question bank.
          </p>

          <Button className="mt-6" onClick={goToCreateQuestion}>
            Create First Question
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <Card key={question.id}>
              <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{question.topic}</Badge>
                    <Badge>{question.type}</Badge>
                    <Badge>{question.difficulty}</Badge>
                    <Badge>{question.bloomLevel}</Badge>
                    <Badge>{question.marks} Marks</Badge>
                  </div>

                  <h2 className="mt-4 text-xl font-bold leading-8 text-slate-950">
                    {question.questionText}
                  </h2>

                  {question.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {question.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/tutor/questions/${question.id}`)}
                  >
                    View
                  </Button>

                  <Button
                    onClick={() =>
                      navigate(`/tutor/questions/${question.id}/edit`)
                    }
                  >
                    Edit
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {children}
    </span>
  );
}