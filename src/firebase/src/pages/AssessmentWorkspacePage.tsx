import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  PenTool,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function AssessmentWorkspacePage() {
  const navigate = useNavigate();

  return (
    <TutorLayout
      title="Assessment Workspace"
      subtitle="Create, organise and deliver all assessments from one central workspace."
    >
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <LayoutDashboard size={46} />

            <div>
              <h2 className="text-3xl font-bold">
                Medical Assessment Centre
              </h2>

              <p className="mt-2 max-w-3xl text-blue-100">
                Design, deliver and analyse every assessment used in a modern
                health training institution — from lesson quizzes to
                professional licensing examinations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/tutor/questions/new")}
            >
              <PlusCircle size={18} />
              New Question
            </Button>

            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/tutor/quizzes/builder")}
            >
              <ClipboardCheck size={18} />
              New Assessment
            </Button>

            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/tutor/exams/builder")}
            >
              <FileText size={18} />
              New Exam
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Question Bank" value="Ready" icon={BookOpen} />
        <StatCard
          title="Assessment Bank"
          value="Active"
          icon={ClipboardCheck}
        />
        <StatCard title="Exam Builder" value="Active" icon={FileText} />
        <StatCard title="OSCE/OSPE" value="Planned" icon={Stethoscope} />
      </div>

      <WorkspaceSection title="Question Bank">
        <WorkspaceCard
          title="Browse Questions"
          description="View, search and manage reusable medical questions."
          icon={BookOpen}
          onClick={() => navigate("/tutor/questions")}
        />

        <WorkspaceCard
          title="Create Question"
          description="Add MCQs, true/false, SAQs, essays and EMQs."
          icon={PlusCircle}
          onClick={() => navigate("/tutor/questions/new")}
        />

        <WorkspaceCard
          title="Question Import"
          description="Import questions from Word, Excel or CSV."
          icon={ListChecks}
          onClick={() => alert("Question import coming next.")}
        />
      </WorkspaceSection>

      <WorkspaceSection title="Assessment Bank">
        <WorkspaceCard
          title="Assessment Bank"
          description="Manage lesson quizzes, short quizzes, CATs, module tests, mock examinations and final assessments."
          icon={ClipboardCheck}
          onClick={() => navigate("/tutor/quizzes")}
        />

        <WorkspaceCard
          title="Universal Assessment Builder"
          description="Create every type of assessment from one intelligent builder."
          icon={PenTool}
          onClick={() => navigate("/tutor/quizzes/builder")}
        />

        <WorkspaceCard
          title="Assessment Categories"
          description="Configure lesson quizzes, CATs, module tests, mock examinations and final examinations."
          icon={ListChecks}
          onClick={() => navigate("/tutor/quizzes")}
        />

        <WorkspaceCard
          title="Quick Assessment"
          description="Launch a CAT, lesson quiz, revision quiz or module test in seconds."
          icon={ShieldCheck}
          onClick={() => navigate("/tutor/quizzes/builder")}
        />
      </WorkspaceSection>

      <WorkspaceSection title="Examination Centre">
        <WorkspaceCard
          title="Examination Bank"
          description="Manage professional examination papers."
          icon={FileText}
          onClick={() => navigate("/tutor/exams")}
        />

        <WorkspaceCard
          title="Examination Builder"
          description="Create sectioned papers with candidate preview."
          icon={PenTool}
          onClick={() => navigate("/tutor/exams/builder")}
        />

        <WorkspaceCard
          title="Exam Templates"
          description="UAHEB, university, nursing and OSCE templates."
          icon={ListChecks}
          onClick={() => alert("Exam templates coming next.")}
        />
      </WorkspaceSection>

      <WorkspaceSection title="Clinical Assessment">
        <WorkspaceCard
          title="OSCE Builder"
          description="Create clinical skills stations and checklists."
          icon={Stethoscope}
          onClick={() => alert("OSCE Builder coming next.")}
        />

        <WorkspaceCard
          title="OSPE Builder"
          description="Create specimen, image and instrument stations."
          icon={GraduationCap}
          onClick={() => alert("OSPE Builder coming next.")}
        />

        <WorkspaceCard
          title="Assignments"
          description="Create coursework, homework and practical tasks."
          icon={ShieldCheck}
          onClick={() => alert("Assignment centre coming next.")}
        />
      </WorkspaceSection>

      <WorkspaceSection title="Reports, Analytics and AI">
        <WorkspaceCard
          title="Assessment Analytics"
          description="Track scores, pass rates and question performance."
          icon={BarChart3}
          onClick={() => navigate("/tutor/quizzes")}
        />

        <WorkspaceCard
          title="AI Assessment Generator"
          description="Generate MCQs, CATs, exams and marking guides."
          icon={Sparkles}
          onClick={() => alert("AI Assessment Generator coming next.")}
        />

        <WorkspaceCard
          title="Export Centre"
          description="Export candidate papers, examiner papers and PDFs."
          icon={FileText}
          onClick={() => alert("Export centre coming next.")}
        />
      </WorkspaceSection>
    </TutorLayout>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
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

function WorkspaceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-5 text-2xl font-bold text-slate-950">{title}</h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function WorkspaceCard({
  title,
  description,
  icon: Icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer transition hover:-translate-y-1 hover:shadow-xl"
      onClick={onClick}
    >
      <Icon size={42} className="text-blue-700" />

      <h3 className="mt-5 text-xl font-bold text-slate-950">{title}</h3>

      <p className="mt-2 text-slate-600">{description}</p>

      <p className="mt-5 font-semibold text-blue-700">Open →</p>
    </Card>
  );
}