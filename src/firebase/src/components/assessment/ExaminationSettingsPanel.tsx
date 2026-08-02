import { CalendarClock, Settings2 } from "lucide-react";
import Card from "../ui/Card";
import Input from "../ui/Input";

type Props = {
  durationMinutes: number; setDurationMinutes: (value: number) => void;
  passMark: number; setPassMark: (value: number) => void;
  attemptsAllowed: number; setAttemptsAllowed: (value: number) => void;
  opensAt: string; setOpensAt: (value: string) => void;
  closesAt: string; setClosesAt: (value: string) => void;
  randomizeQuestions: boolean; setRandomizeQuestions: (value: boolean) => void;
  randomizeOptions: boolean; setRandomizeOptions: (value: boolean) => void;
  showResultsImmediately: boolean; setShowResultsImmediately: (value: boolean) => void;
};

export default function ExaminationSettingsPanel(props: Props) {
  return <Card>
    <div className="flex items-start gap-3"><Settings2 className="mt-1 text-blue-700" size={28}/><div><h2 className="text-2xl font-bold text-slate-950">Delivery and Security Settings</h2><p className="mt-1 text-slate-600">Configure duration, pass mark, attempts, availability and randomisation.</p></div></div>
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <Field label="Duration (minutes)"><Input type="number" min={1} value={props.durationMinutes} onChange={e=>props.setDurationMinutes(Number(e.target.value)||0)}/></Field>
      <Field label="Pass mark (%)"><Input type="number" min={0} max={100} value={props.passMark} onChange={e=>props.setPassMark(Number(e.target.value)||0)}/></Field>
      <Field label="Attempts allowed"><Input type="number" min={1} max={20} value={props.attemptsAllowed} onChange={e=>props.setAttemptsAllowed(Number(e.target.value)||1)}/></Field>
      <Field label="Opens at" icon={CalendarClock}><Input type="datetime-local" value={props.opensAt} onChange={e=>props.setOpensAt(e.target.value)}/></Field>
      <Field label="Closes at" icon={CalendarClock}><Input type="datetime-local" value={props.closesAt} onChange={e=>props.setClosesAt(e.target.value)}/></Field>
    </div>
    <div className="mt-6 grid gap-3 md:grid-cols-3">
      <Toggle label="Randomise questions" checked={props.randomizeQuestions} onChange={props.setRandomizeQuestions}/>
      <Toggle label="Randomise MCQ options" checked={props.randomizeOptions} onChange={props.setRandomizeOptions}/>
      <Toggle label="Show results immediately" checked={props.showResultsImmediately} onChange={props.setShowResultsImmediately}/>
    </div>
  </Card>;
}
function Field({label,icon:Icon,children}:{label:string;icon?:React.ElementType;children:React.ReactNode}){return <div><label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">{Icon&&<Icon size={16} className="text-blue-700"/>}{label}</label>{children}</div>}
function Toggle({label,checked,onChange}:{label:string;checked:boolean;onChange:(value:boolean)=>void}){return <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4"><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} className="h-4 w-4"/><span className="font-semibold text-slate-700">{label}</span></label>}
