import {
  BarChart3,
<<<<<<< HEAD
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
=======
  BookOpen,
  FileQuestion,
  GraduationCap,
  Layers,
  Plus,
  Presentation,
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
<<<<<<< HEAD
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
=======
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useCourseUnits from "../hooks/useCourseUnits";
import useProgrammes from "../hooks/useProgrammes";

export default function TutorDashboardPage() {
  const navigate = useNavigate();
  const { courseUnits, loading: courseUnitsLoading } = useCourseUnits();
  const { programmes, loading: programmesLoading } = useProgrammes();

  const loading = courseUnitsLoading || programmesLoading;

  return (
    <TutorLayout
      title="Academic Management Portal"
      subtitle="Manage programmes, course units, modules, lessons, quizzes, and learner progress."
    >
      <div className="mb-8 flex flex-wrap gap-3">
        <Button
          className="gap-2"
          onClick={() => navigate("/tutor/programmes/new")}
        >
          <Plus size={18} />
          New Programme
        </Button>

        <Button
          variant="outline"
          className="gap-2"
          onClick={() => navigate("/tutor/course-units/new")}
        >
          <Plus size={18} />
          New Course Unit
        </Button>
      </div>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<GraduationCap size={30} />}
          label="Programmes"
          value={loading ? "..." : programmes.length}
          iconClass="text-blue-700"
        />

        <StatCard
          icon={<BookOpen size={30} />}
          label="Course Units"
          value={loading ? "..." : courseUnits.length}
          iconClass="text-green-700"
        />

        <StatCard
          icon={<Layers size={30} />}
          label="Modules"
          value="4"
          iconClass="text-amber-600"
        />

        <StatCard
          icon={<Presentation size={30} />}
          label="Lessons"
          value="1"
          iconClass="text-purple-700"
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Academic Structure
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Build your platform from programmes down to lessons and quizzes.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate("/tutor/programmes/new")}
            >
              Add Programme
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <PortalActionCard
              title="Programmes"
              text="Create academic programmes such as Diploma in Clinical Medicine or Bachelor of Nursing."
              icon={<GraduationCap size={26} />}
              onClick={() => navigate("/tutor/programmes/new")}
            />

            <PortalActionCard
              title="Course Units"
              text="Create course units such as General Pathology, Pharmacology, or Nursing Practice."
              icon={<BookOpen size={26} />}
              onClick={() => navigate("/tutor/course-units/new")}
            />

            <PortalActionCard
              title="Modules"
              text="Organize each course unit into structured modules with pass marks."
              icon={<Layers size={26} />}
              onClick={() => navigate("/tutor/modules")}
            />

            <PortalActionCard
              title="Lessons"
              text="Add slides, videos, notes, clinical pearls, cases, and knowledge checks."
              icon={<Presentation size={26} />}
              onClick={() => alert("Lesson builder coming next.")}
            />

            <PortalActionCard
              title="Quizzes"
              text="Create assessments and enforce mastery-based progression."
              icon={<FileQuestion size={26} />}
              onClick={() => alert("Quiz builder coming next.")}
            />

            <PortalActionCard
              title="Analytics"
              text="Monitor learner progress, quiz performance, and course engagement."
              icon={<BarChart3 size={26} />}
              onClick={() => alert("Analytics dashboard coming next.")}
            />
          </div>
        </Card>

        <Card>
          <Users className="text-blue-700" size={30} />

          <h2 className="mt-4 text-xl font-bold text-slate-950">
            Learner Analytics
          </h2>

          <p className="mt-2 text-slate-600">
            Student progress, quiz performance, engagement metrics, and
            completion trends will appear here.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Coming Soon</p>

            <p className="mt-2 text-sm text-slate-600">
              This panel will help tutors identify struggling learners and
              difficult modules.
            </p>
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold text-slate-950">
            Recent Programmes
          </h2>

          {programmesLoading ? (
            <p className="mt-5 text-slate-600">Loading programmes...</p>
          ) : programmes.length === 0 ? (
            <EmptyState
              icon={<GraduationCap size={36} />}
              title="No programmes yet"
              text="Create your first academic programme to begin organizing your curriculum."
              buttonText="Create Programme"
              onClick={() => navigate("/tutor/programmes/new")}
            />
          ) : (
            <div className="mt-5 space-y-4">
              {programmes.slice(0, 3).map((programme) => (
                <div
                  key={programme.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm font-semibold text-blue-700">
                    {programme.level}
                  </p>

                  <h3 className="mt-1 font-bold text-slate-950">
                    {programme.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {programme.duration}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950">
            Recent Course Units
          </h2>

          {courseUnitsLoading ? (
            <p className="mt-5 text-slate-600">Loading course units...</p>
          ) : courseUnits.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={36} />}
              title="No course units yet"
              text="Create your first course unit and attach it to a programme."
              buttonText="Create Course Unit"
              onClick={() => navigate("/tutor/course-units/new")}
            />
          ) : (
            <div className="mt-5 space-y-4">
              {courseUnits.slice(0, 3).map((courseUnit) => (
                <div
                  key={courseUnit.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm font-semibold text-blue-700">
                    {courseUnit.category}
                  </p>

                  <h3 className="mt-1 font-bold text-slate-950">
                    {courseUnit.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {courseUnit.level} • {courseUnit.duration}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
    </TutorLayout>
  );
}

<<<<<<< HEAD
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
=======
function StatCard({
  icon,
  label,
  value,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconClass: string;
}) {
  return (
    <Card>
      <div className={iconClass}>{icon}</div>

      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>

      <h3 className="mt-2 text-3xl font-bold">{value}</h3>
    </Card>
  );
}

function PortalActionCard({
  title,
  text,
  icon,
  onClick,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-slate-950">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </button>
  );
}

function EmptyState({
  icon,
  title,
  text,
  buttonText,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
      <div className="mx-auto flex justify-center text-slate-400">{icon}</div>

      <h3 className="mt-4 text-lg font-bold text-slate-800">{title}</h3>

      <p className="mt-2 text-slate-600">{text}</p>

      <Button className="mt-5" onClick={onClick}>
        {buttonText}
      </Button>
    </div>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
  );
}