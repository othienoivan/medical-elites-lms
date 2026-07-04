import {
  BookOpen,
  FileText,
  HelpCircle,
  Image,
  Lightbulb,
  ListChecks,
  Plus,
  Video,
} from "lucide-react";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function LessonBuilderPage() {
  return (
    <TutorLayout
      title="Visual Lesson Builder"
      subtitle="Build rich medical lessons using reusable learning blocks."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Button className="gap-2">
          <Plus size={18} />
          Add Objective
        </Button>

        <Button variant="outline" className="gap-2">
          <Plus size={18} />
          Add Section
        </Button>

        <Button variant="outline" className="gap-2">
          <Plus size={18} />
          Add Resource
        </Button>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-950">
            Lesson Workspace
          </h2>

          <p className="mt-2 text-slate-600">
            This area will become the interactive editor where tutors arrange
            lesson content blocks.
          </p>

          <div className="mt-6 space-y-4">
            <BuilderBlock
              icon={<ListChecks size={22} />}
              title="Learning Objectives"
              text="Define what the learner should be able to achieve by the end of the lesson."
            />

            <BuilderBlock
              icon={<BookOpen size={22} />}
              title="Lesson Sections"
              text="Organize the lesson into structured teaching sections."
            />

            <BuilderBlock
              icon={<Video size={22} />}
              title="Videos"
              text="Add YouTube links or uploaded video resources."
            />

            <BuilderBlock
              icon={<FileText size={22} />}
              title="PDF / Notes"
              text="Attach lecture notes, guidelines, handouts, or reading material."
            />

            <BuilderBlock
              icon={<Image size={22} />}
              title="Images and Diagrams"
              text="Add medical diagrams, charts, tables, and clinical images."
            />

            <BuilderBlock
              icon={<Lightbulb size={22} />}
              title="Clinical Pearls"
              text="Highlight important clinical teaching points."
            />

            <BuilderBlock
              icon={<HelpCircle size={22} />}
              title="Knowledge Checks"
              text="Add short formative questions within the lesson."
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950">
            Builder Tools
          </h2>

          <p className="mt-2 text-slate-600">
            These tools will allow tutors to assemble full lessons without
            writing code.
          </p>

          <div className="mt-6 space-y-3">
            <ToolButton label="Add Objective" />
            <ToolButton label="Add Section" />
            <ToolButton label="Add Slide" />
            <ToolButton label="Add YouTube Video" />
            <ToolButton label="Upload PDF" />
            <ToolButton label="Add Clinical Case" />
            <ToolButton label="Add Knowledge Check" />
            <ToolButton label="Generate with AI" />
          </div>
        </Card>
      </section>
    </TutorLayout>
  );
}

function BuilderBlock({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex gap-4">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
          {icon}
        </div>

        <div>
          <h3 className="font-bold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-white"
    >
      {label}
    </button>
  );
}