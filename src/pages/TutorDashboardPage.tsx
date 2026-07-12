import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  Stethoscope,
  WalletCards,
  Megaphone,
  Bell,
  MessageCircle,
  BookOpen,
  Brain,
  ClipboardCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers,
  LibraryBig,
  PenTool,
  PlusCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Card from "../components/ui/Card";

export default function TutorDashboardPage() {
  const navigate = useNavigate();

  return (
    <TutorLayout
      title="Tutor Portal"
      subtitle="Manage curriculum, lessons, assessments and learner progress."
    >
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <h2 className="text-3xl font-bold">Medical Elites Tutor Workspace</h2>

        <p className="mt-2 max-w-3xl text-blue-100">
          Build lessons, manage academic programmes, create CATs, module tests,
          practice assessments, examinations and medical education analytics
          from one place.
        </p>
      </div>

      <DashboardSection title="Academic Management">
        <DashboardCard
          title="Programmes"
          description="Create and manage academic programmes."
          icon={GraduationCap}
          onClick={() => navigate("/tutor/programmes")}
        />

        <DashboardCard
          title="Course Units"
          description="Create and organise course units."
          icon={BookOpen}
          onClick={() => navigate("/tutor/course-units")}
        />

        <DashboardCard
          title="Modules"
          description="Build modules under course units."
          icon={Layers}
          onClick={() => navigate("/tutor/modules")}
        />

        <DashboardCard
          title="Lessons"
          description="Create and edit lesson content."
          icon={LibraryBig}
          onClick={() => navigate("/tutor/lessons")}
        />

        <DashboardCard
          title="Visual Lesson Builder"
          description="Build rich lessons using interactive blocks."
          icon={PenTool}
          onClick={() => navigate("/tutor/lessons")}
        />

        <DashboardCard
          title="Curriculum Explorer"
          description="Review curriculum structure."
          icon={BarChart3}
          onClick={() => navigate("/tutor/curriculum")}
        />
      </DashboardSection>

      <DashboardSection title="Assessment Centre">
        <DashboardCard
          title="Assessment Workspace"
          description="Open the central medical assessment control centre."
          icon={ClipboardCheck}
          onClick={() => navigate("/tutor/assessments")}
        />

        <DashboardCard
          title="Question Bank"
          description="Create reusable MCQs, SAQs, essays, EMQs and clinical questions."
          icon={HelpCircle}
          onClick={() => navigate("/tutor/questions")}
        />

        <DashboardCard
          title="Assessment Bank"
          description="Manage lesson quizzes, CATs, module tests, practice tests, mock exams and final assessments."
          icon={ClipboardCheck}
          onClick={() => navigate("/tutor/quizzes")}
        />

        <DashboardCard
          title="Universal Assessment Builder"
          description="Build CATs, lesson quizzes, module tests and mock exams from the Question Bank."
          icon={PlusCircle}
          onClick={() => navigate("/tutor/quizzes/builder")}
        />

        <DashboardCard
          title="Examination Bank"
          description="Manage full professional examination papers."
          icon={FileText}
          onClick={() => navigate("/tutor/exams")}
        />

        <DashboardCard
          title="Examination Builder"
          description="Create sectioned papers, UAHEB-style exams and marking guides."
          icon={FileText}
          onClick={() => navigate("/tutor/exams/builder")}
        />
      </DashboardSection>
      <DashboardSection title="Student Management">
        <DashboardCard
  title="Students"
  description="Search, filter and manage student academic records."
  icon={Users}
  onClick={() => navigate("/tutor/students")}
/><DashboardCard
  title="Enrollment Manager"
  description="Assign students to programmes, course units, semesters and class groups."
  icon={GraduationCap}
  onClick={() => navigate("/tutor/enrollments")}
/>

        <DashboardCard
          title="Clinical Logbook"
          description="Review clinical procedures, reflections and competency submissions."
          icon={Stethoscope}
          onClick={() => navigate("/tutor/clinical-logbook")}
        />


        <DashboardCard
          title="AI Academic Assistant"
          description="Generate lesson plans, assessments, marking guides and performance-support materials."
          icon={Sparkles}
          onClick={() => navigate("/tutor/ai-assistant")}
        />

        <DashboardCard
          title="Finance Management"
          description="Manage fee structures, student billing, payments, receipts and clearance."
          icon={WalletCards}
          onClick={() => navigate("/tutor/finance")}
        />

        <DashboardCard
          title="Attendance Management"
          description="Record class attendance, monitor participation and export reports."
          icon={CalendarCheck}
          onClick={() => navigate("/tutor/attendance")}
        />

        <DashboardCard
          title="Timetable Management"
          description="Schedule course units, venues, class groups and teaching times."
          icon={CalendarDays}
          onClick={() => navigate("/tutor/timetable")}
        />

        <DashboardCard
          title="Announcements"
          description="Publish institutional notices, assessment reminders and course updates."
          icon={Megaphone}
          onClick={() => navigate("/tutor/announcements")}
        />

        <DashboardCard
          title="Messages"
          description="Communicate directly with students and fellow tutors."
          icon={MessageCircle}
          onClick={() => navigate("/tutor/messages")}
        />

        <DashboardCard
          title="Notifications"
          description="Review unread messages and important system updates."
          icon={Bell}
          onClick={() => navigate("/tutor/notifications")}
        />

        <DashboardCard
          title="Submission Inbox"
          description="Review submitted assessments and open attempts for marking."
          icon={ClipboardCheck}
          onClick={() => navigate("/tutor/submissions")}
        />

        <DashboardCard
          title="Gradebook"
          description="Review manually marked assessment scores and pass/fail results."
          icon={BarChart3}
          onClick={() => navigate("/tutor/gradebook")}
        />

        <DashboardCard
          title="Automatic Gradebook"
          description="Automatically calculate student averages, grades and rankings."
          icon={GraduationCap}
          onClick={() => navigate("/tutor/automatic-gradebook")}
        />

        <DashboardCard
          title="Student Performance"
          description="Open detailed academic profiles, assessment history and progress reports."
          icon={Users}
          onClick={() => navigate("/tutor/student-performance/demo")}
        />

        <DashboardCard
          title="Class Analytics"
          description="View class averages, pass rates, grade distribution and performance trends."
          icon={BarChart3}
          onClick={() => navigate("/tutor/class-analytics")}
        />

        <DashboardCard
          title="Assessment Analytics"
          description="Analyse assessment statistics, question performance and learner outcomes."
          icon={ClipboardCheck}
          onClick={() => navigate("/tutor/quizzes")}
        />
      </DashboardSection>

      <DashboardSection title="AI Tools">
        <DashboardCard
          title="AI Question Generator"
          description="Generate MCQs, SAQs, essays, OSCE stations and clinical cases."
          icon={Sparkles}
          onClick={() => alert("AI Question Generator coming soon.")}
        />

        <DashboardCard
          title="AI Lesson Generator"
          description="Generate lesson plans, notes, presentations and tutor guides."
          icon={Brain}
          onClick={() => alert("AI Lesson Generator coming soon.")}
        />
      </DashboardSection>
    </TutorLayout>
  );
}

function DashboardSection({
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

function DashboardCard({
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
      onClick={onClick}
      className="cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-300"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
        <Icon size={28} className="text-blue-700" />
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <span className="font-semibold text-blue-700">
          Open Module →
        </span>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Medical Elites
        </span>
      </div>
    </Card>
  );
}