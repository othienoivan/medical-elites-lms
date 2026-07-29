import { Calendar, FileText, School, Timer } from "lucide-react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import type { ExaminationTemplate, ExaminationType } from "../../models/Examination";

type Props = {
  title: string; setTitle: (value: string) => void;
  examinationName: string; setExaminationName: (value: string) => void;
  institutionName: string; setInstitutionName: (value: string) => void;
  academicYear: string; setAcademicYear: (value: string) => void;
  semester: string; setSemester: (value: string) => void;
  yearOfStudy: string; setYearOfStudy: (value: string) => void;
  timeAllowed: string; setTimeAllowed: (value: string) => void;
  examinationType: ExaminationType; setExaminationType: (value: ExaminationType) => void;
  template: ExaminationTemplate; setTemplate: (value: ExaminationTemplate) => void;
  targetMarks: number; setTargetMarks: (value: number) => void;
  candidateInstructions: string; setCandidateInstructions: (value: string) => void;
};

export default function ExaminationDetailsPanel(props: Props) {
  return <Card>
    <div className="flex items-start gap-3"><FileText className="mt-1 text-blue-700" size={28}/><div><h2 className="text-2xl font-bold text-slate-950">Examination Details</h2><p className="mt-1 text-slate-600">Define the paper type, academic context, template, timing and mark target.</p></div></div>
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <Field label="Examination Title"><Input value={props.title} onChange={e=>props.setTitle(e.target.value)} placeholder="General Pathology Final Examination"/></Field>
      <Field label="Examination Name"><Input value={props.examinationName} onChange={e=>props.setExaminationName(e.target.value)} placeholder="FINAL EXAMINATION"/></Field>
      <Field label="Institution" icon={School}><Input value={props.institutionName} onChange={e=>props.setInstitutionName(e.target.value)} /></Field>
      <Field label="Examination Type"><select className="w-full rounded-xl border border-slate-300 px-4 py-3" value={props.examinationType} onChange={e=>props.setExaminationType(e.target.value as ExaminationType)}>{["cat","midterm","final","mock","supplementary","osce","practical"].map(v=><option key={v} value={v}>{v.toUpperCase()}</option>)}</select></Field>
      <Field label="Paper Template"><select className="w-full rounded-xl border border-slate-300 px-4 py-3" value={props.template} onChange={e=>props.setTemplate(e.target.value as ExaminationTemplate)}><option value="institutional">Institutional</option><option value="uaheb">UAHEB</option><option value="nche">NCHE</option><option value="university">University</option></select></Field>
      <Field label="Academic Year" icon={Calendar}><Input value={props.academicYear} onChange={e=>props.setAcademicYear(e.target.value)} placeholder="2026/2027"/></Field>
      <Field label="Year of Study"><Input value={props.yearOfStudy} onChange={e=>props.setYearOfStudy(e.target.value)} placeholder="Year 1"/></Field>
      <Field label="Semester"><Input value={props.semester} onChange={e=>props.setSemester(e.target.value)} placeholder="Semester II"/></Field>
      <Field label="Time Allowed" icon={Timer}><Input value={props.timeAllowed} onChange={e=>props.setTimeAllowed(e.target.value)} placeholder="3 Hours"/></Field>
      <Field label="Target Marks"><Input type="number" min={1} value={props.targetMarks} onChange={e=>props.setTargetMarks(Number(e.target.value)||0)}/></Field>
    </div>
    <div className="mt-6"><Field label="Candidate Instructions"><textarea value={props.candidateInstructions} onChange={e=>props.setCandidateInstructions(e.target.value)} className="min-h-40 w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Answer ALL questions."/></Field></div>
  </Card>;
}
function Field({label,icon:Icon,children}:{label:string;icon?:React.ElementType;children:React.ReactNode}){return <div><label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">{Icon&&<Icon size={16} className="text-blue-700"/>}{label}</label>{children}</div>}
