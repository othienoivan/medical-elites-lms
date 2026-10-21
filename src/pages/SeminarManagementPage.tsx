import { useEffect, useMemo, useState } from "react";
import { Award, CalendarDays, ClipboardCheck, Download, Plus, RotateCcw, Users, WalletCards } from "lucide-react";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useAuth from "../hooks/useAuth";
import { saveSeminar, watchSeminar } from "../firebase/seminars";
import { Link } from "react-router-dom";

type Tab = "overview" | "schedule" | "tasks" | "attendance" | "scores" | "budget";
type TaskStatus = "not-started" | "in-progress" | "done" | "blocked";
type SeminarTask = { id: string; title: string; owner: string; deadline: string; status: TaskStatus };
type AttendanceRow = { id: string; name: string; programme: string; session: string; present: boolean };
type ScoreRow = { id: string; team: string; department: string; knowledge: number; caseScore: number; teachBack: number; practical: number; teamwork: number };
type BudgetRow = { id: string; category: string; quantity: number; unitCost: number; funding: string; status: "proposed" | "approved" | "paid" };
type SeminarState = { tasks: SeminarTask[]; attendance: AttendanceRow[]; scores: ScoreRow[]; budget: BudgetRow[] };

const STORE_KEY = "medical-elites-seminar-2026";
const programmes: Record<string, string[]> = {
  Nursing: ["Certificate in Nursing", "Diploma in Nursing Direct", "Diploma in Nursing Extension"],
  Midwifery: ["Certificate in Midwifery", "Diploma in Midwifery Direct", "Diploma in Midwifery Extension"],
  Pharmacy: ["Certificate in Pharmacy", "Diploma in Pharmacy"],
  Laboratory: ["Certificate in Medical Laboratory Techniques", "Diploma in Medical Laboratory"],
  "Clinical Medicine": ["Diploma in Clinical Medicine and Community Health"],
};
const schedule = [
  ["Mon 2 Nov", "Continuing", "Opening, ethics, communication, patient safety, infection prevention, baseline assessment and team orientation"],
  ["Tue 3 Nov", "Continuing", "Departmental theory I, short quizzes and case analysis"],
  ["Wed 4 Nov", "Continuing", "Departmental theory II, clinical reasoning, common errors and team teach-backs"],
  ["Thu 5 Nov", "Continuing", "Career guidance, professional updates, theory assessment and practical briefing"],
  ["Fri 6 Nov", "Extension", "Orientation, shared professional foundations, Nursing and Midwifery case challenges"],
  ["Sat 7 Nov", "Extension", "Departmental consolidation, teach-backs, theory assessment and practical briefing"],
  ["Sun 8 Nov", "Extension", "Career guidance, professional updates, theory assessment and provisional nominations"],
] as const;
const initialState: SeminarState = {
  tasks: [
    { id: "t1", title: "Confirm student numbers, rooms and equipment", owner: "Logistics and Venue", deadline: "2026-10-16", status: "in-progress" },
    { id: "t2", title: "Submit learning outcomes, priority skills and resource needs", owner: "Track coordinators", deadline: "2026-10-20", status: "not-started" },
    { id: "t3", title: "Confirm speakers, funding and practical dates", owner: "Academic and Finance", deadline: "2026-10-24", status: "blocked" },
    { id: "t4", title: "Prepare questions, rubrics, checklists and attendance tools", owner: "Academic and Speakers", deadline: "2026-10-28", status: "not-started" },
    { id: "t5", title: "Run station trial and technical rehearsal", owner: "Logistics and Academic", deadline: "2026-10-31", status: "not-started" },
    { id: "t6", title: "Complete final readiness review", owner: "Chairperson and Vice Chairperson", deadline: "2026-11-01", status: "not-started" },
  ], attendance: [], scores: [], budget: [],
};

const inputClass = "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm";
const statusClass: Record<TaskStatus, string> = { "not-started": "bg-slate-100 text-slate-700", "in-progress": "bg-blue-100 text-blue-800", done: "bg-emerald-100 text-emerald-800", blocked: "bg-red-100 text-red-800" };
const money = (value: number) => `UGX ${value.toLocaleString()}`;
const nextId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function SeminarManagementPage() {
  const { currentUser, userProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudMessage, setCloudMessage] = useState("Connecting to shared seminar data...");
  const [data, setData] = useState<SeminarState>(() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "null") || initialState; } catch { return initialState; }
  });
  useEffect(() => localStorage.setItem(STORE_KEY, JSON.stringify(data)), [data]);
  useEffect(() => watchSeminar(remote => {
    if (remote) {
      setData(remote as SeminarState);
      setCloudMessage("Shared data is up to date");
    } else {
      setCloudMessage("No shared record yet. Save to create it.");
    }
    setCloudReady(true);
  }, error => {
    console.error("Failed to load seminar", error);
    setCloudMessage("Working from this browser. Shared data could not be loaded.");
    setCloudReady(true);
  }), []);
  const totalBudget = useMemo(() => data.budget.reduce((sum, row) => sum + row.quantity * row.unitCost, 0), [data.budget]);
  const completed = data.tasks.filter((task) => task.status === "done").length;
  const present = data.attendance.filter((row) => row.present).length;
  const ranked = [...data.scores].sort((a, b) => totalScore(b) - totalScore(a));

  function downloadReport() {
    const payload = { event: "Kawempe Seminar and Departmental Competition 2026", exportedAt: new Date().toISOString(), ...data };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "kawempe-seminar-management-data.json"; link.click(); URL.revokeObjectURL(url);
  }

  async function saveShared() {
    if (!currentUser) return;
    setCloudMessage("Saving shared data...");
    try {
      const profile = userProfile as Record<string, unknown> | null;
      const institutionId = String(profile?.institutionId || "");
      if (!institutionId) throw new Error("Your account is not assigned to an institution.");
      await saveSeminar({ data, userId: currentUser.uid, institutionId, userName: String(profile?.fullName || currentUser.email || "Seminar coordinator") });
      setCloudMessage("Shared data saved");
    } catch (error) {
      console.error("Failed to save seminar", error);
      setCloudMessage("Shared save failed. Your browser copy is still available.");
    }
  }

  return <TutorLayout title="Seminar Management" subtitle="Plan, deliver and report the Kawempe seminar and departmental competition.">
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-6 text-white sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-200">2-8 November 2026 · Theory phase</p><h1 className="mt-2 max-w-4xl text-3xl font-black sm:text-4xl">Strengthening Clinical Competence, Professionalism and Teamwork for Safe Patient Care</h1><p className="mt-3 max-w-3xl text-blue-100">Five departments · 11 programmes · theory, practicals and structured competition</p><p className="mt-3 text-sm font-semibold text-cyan-200">{cloudMessage}</p></div><div className="flex flex-wrap gap-2"><Button variant="success" disabled={!cloudReady} onClick={()=>void saveShared()}><CheckCloud/>Save shared data</Button><Button variant="outline" onClick={downloadReport}><Download size={17}/>Export data</Button><Button variant="danger" onClick={() => { if (confirm("Reset the working copy? Changes are not shared until you press Save shared data.")) setData(initialState); }}><RotateCcw size={17}/>Reset</Button></div></div>
    </section>

    <div className="mt-6 flex gap-2 overflow-x-auto pb-2">{(["overview","schedule","tasks","attendance","scores","budget"] as Tab[]).map(item => <button key={item} onClick={() => setTab(item)} className={`min-h-11 whitespace-nowrap rounded-xl px-4 text-sm font-bold capitalize ${tab === item ? "bg-blue-700 text-white" : "border bg-white text-slate-700"}`}>{item}</button>)}<Link to="/seminar/competition" className="min-h-11 whitespace-nowrap rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white">Competition control & leaderboard</Link></div>

    {tab === "overview" && <div className="mt-4 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={ClipboardCheck} label="Readiness tasks" value={`${completed}/${data.tasks.length}`} detail={`${data.tasks.filter(t=>t.status==="blocked").length} blocked`}/><Metric icon={Users} label="Attendance records" value={data.attendance.length} detail={`${present} present`}/><Metric icon={Award} label="Competition teams" value={data.scores.length} detail="100 marks per team"/><Metric icon={WalletCards} label="Proposed budget" value={money(totalBudget)} detail="Approval required"/></div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><Card><h2 className="text-xl font-black">Management decisions still required</h2><div className="mt-4 space-y-3">{["Confirm practical attendance dates and the interdepartmental final","Confirm venue capacities and enrolment by programme","Approve budget ceiling, purchasing arrangements and award rules"].map(x=><div key={x} className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><span className="mt-0.5 h-3 w-3 shrink-0 rounded-full bg-amber-500"/><p className="font-semibold text-amber-950">{x}</p></div>)}</div></Card><Card><h2 className="text-xl font-black">Departments and programmes</h2><div className="mt-4 space-y-3">{Object.entries(programmes).map(([department, items])=><div key={department} className="rounded-xl border p-3"><div className="flex justify-between gap-3"><strong>{department}</strong><span className="text-sm text-slate-500">{items.length} programme{items.length>1?"s":""}</span></div><p className="mt-1 text-sm text-slate-600">{items.join(" · ")}</p></div>)}</div></Card></div>
    </div>}

    {tab === "schedule" && <Card className="mt-4"><h2 className="text-xl font-black">Approved theory programme</h2><p className="mt-1 text-sm text-slate-600">Daily hours: 08:00-16:00. Sunday is included for extension students as stated in the approved plan.</p><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b bg-slate-50"><th className="p-3">Date</th><th className="p-3">Group</th><th className="p-3">Focus</th></tr></thead><tbody>{schedule.map(row=><tr key={row[0]} className="border-b"><td className="p-3 font-bold">{row[0]}</td><td className="p-3"><span className="rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-800">{row[1]}</span></td><td className="p-3 text-slate-700">{row[2]}</td></tr>)}</tbody></table></div></Card>}

    {tab === "tasks" && <Tasks data={data} setData={setData}/>} 
    {tab === "attendance" && <Attendance data={data} setData={setData}/>} 
    {tab === "scores" && <Scores setData={setData} ranked={ranked}/>} 
    {tab === "budget" && <Budget data={data} setData={setData} total={totalBudget}/>} 
    <p className="mt-6 text-xs text-slate-500">Changes are retained in this browser while you work. Press Save shared data to publish them to authorised committee members, and use Export data for an independent backup.</p>
  </TutorLayout>;
}

function CheckCloud(){return <span aria-hidden="true">✓</span>}

function Metric({icon:Icon,label,value,detail}:{icon:typeof CalendarDays;label:string;value:string|number;detail:string}) { return <Card><Icon className="text-blue-700"/><p className="mt-4 text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></Card>; }
function Tasks({data,setData}:{data:SeminarState;setData:React.Dispatch<React.SetStateAction<SeminarState>>}) { const [title,setTitle]=useState(""); return <Card className="mt-4"><h2 className="text-xl font-black">Preparation tracker</h2><form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={e=>{e.preventDefault();if(!title.trim())return;setData(d=>({...d,tasks:[...d.tasks,{id:nextId(),title:title.trim(),owner:"Unassigned",deadline:"",status:"not-started"}]}));setTitle("")}}><input className={inputClass} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Add a preparation task"/><Button type="submit"><Plus size={17}/>Add task</Button></form><div className="mt-5 space-y-3">{data.tasks.map(task=><div key={task.id} className="grid gap-3 rounded-xl border p-4 md:grid-cols-[1fr_220px_150px_42px] md:items-center"><div><p className="font-bold">{task.title}</p><input aria-label="Task owner" className="mt-2 w-full border-b text-sm text-slate-600" value={task.owner} onChange={e=>setData(d=>({...d,tasks:d.tasks.map(x=>x.id===task.id?{...x,owner:e.target.value}:x)}))}/></div><input aria-label="Task deadline" type="date" className={inputClass} value={task.deadline} onChange={e=>setData(d=>({...d,tasks:d.tasks.map(x=>x.id===task.id?{...x,deadline:e.target.value}:x)}))}/><select aria-label="Task status" className={`${inputClass} ${statusClass[task.status]}`} value={task.status} onChange={e=>setData(d=>({...d,tasks:d.tasks.map(x=>x.id===task.id?{...x,status:e.target.value as TaskStatus}:x)}))}><option value="not-started">Not started</option><option value="in-progress">In progress</option><option value="done">Done</option><option value="blocked">Blocked</option></select><button aria-label="Delete task" className="text-red-600" onClick={()=>setData(d=>({...d,tasks:d.tasks.filter(x=>x.id!==task.id)}))}>×</button></div>)}</div></Card> }
function Attendance({data,setData}:{data:SeminarState;setData:React.Dispatch<React.SetStateAction<SeminarState>>}) { const [form,setForm]=useState({name:"",programme:"Certificate in Nursing",session:"Mon 2 Nov - Morning"}); const add=(e:React.FormEvent)=>{e.preventDefault();setData(d=>({...d,attendance:[...d.attendance,{id:nextId(),...form,present:true}]}));setForm({...form,name:""})}; return <Card className="mt-4"><h2 className="text-xl font-black">Session attendance</h2><p className="mt-1 text-sm text-slate-600">Record both morning and afternoon checks; eligibility is proposed at 80% of assigned sessions.</p><form onSubmit={add} className="mt-4 grid gap-3 md:grid-cols-4"><input required className={inputClass} placeholder="Student full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><select className={inputClass} value={form.programme} onChange={e=>setForm({...form,programme:e.target.value})}>{Object.values(programmes).flat().map(x=><option key={x}>{x}</option>)}</select><input className={inputClass} value={form.session} onChange={e=>setForm({...form,session:e.target.value})}/><Button type="submit"><Plus size={17}/>Add record</Button></form><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b"><th className="p-3">Student</th><th className="p-3">Programme</th><th className="p-3">Session</th><th className="p-3">Present</th><th/></tr></thead><tbody>{data.attendance.map(row=><tr key={row.id} className="border-b"><td className="p-3 font-bold">{row.name}</td><td className="p-3">{row.programme}</td><td className="p-3">{row.session}</td><td className="p-3"><input type="checkbox" checked={row.present} onChange={e=>setData(d=>({...d,attendance:d.attendance.map(x=>x.id===row.id?{...x,present:e.target.checked}:x)}))}/></td><td><button className="text-red-600" onClick={()=>setData(d=>({...d,attendance:d.attendance.filter(x=>x.id!==row.id)}))}>Remove</button></td></tr>)}</tbody></table>{!data.attendance.length&&<p className="py-8 text-center text-slate-500">No attendance recorded yet.</p>}</div></Card> }
function totalScore(row:ScoreRow){return row.knowledge+row.caseScore+row.teachBack+row.practical+row.teamwork}
function Scores({setData,ranked}:{setData:React.Dispatch<React.SetStateAction<SeminarState>>;ranked:ScoreRow[]}) { const add=()=>setData(d=>({...d,scores:[...d.scores,{id:nextId(),team:`Team ${d.scores.length+1}`,department:"Nursing",knowledge:0,caseScore:0,teachBack:0,practical:0,teamwork:0}]})); const update=(id:string,key:keyof ScoreRow,value:string|number)=>setData(d=>({...d,scores:d.scores.map(x=>x.id===id?{...x,[key]:value}:x)})); return <Card className="mt-4"><div className="flex justify-between gap-3"><div><h2 className="text-xl font-black">Departmental competition scores</h2><p className="mt-1 text-sm text-slate-600">Knowledge 20 · Case 25 · Teach-back 15 · Practical 30 · Teamwork 10</p></div><Button onClick={add}><Plus size={17}/>Add team</Button></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="border-b"><th className="p-2">Rank</th><th className="p-2">Team</th><th className="p-2">Department</th>{["Knowledge","Case","Teach-back","Practical","Teamwork","Total"].map(x=><th key={x} className="p-2 text-center">{x}</th>)}</tr></thead><tbody>{ranked.map((row,i)=><tr key={row.id} className="border-b"><td className="p-2 font-black">{i+1}</td><td className="p-2"><input className="w-32 border-b font-bold" value={row.team} onChange={e=>update(row.id,"team",e.target.value)}/></td><td className="p-2"><select className="rounded-lg border p-2" value={row.department} onChange={e=>update(row.id,"department",e.target.value)}>{Object.keys(programmes).map(x=><option key={x}>{x}</option>)}</select></td>{(["knowledge","caseScore","teachBack","practical","teamwork"] as const).map((key,j)=><td className="p-2" key={key}><input aria-label={`${row.team} ${key}`} type="number" min="0" max={[20,25,15,30,10][j]} className="w-16 rounded border p-2 text-center" value={row[key]} onChange={e=>update(row.id,key,Math.min(Number(e.target.value),[20,25,15,30,10][j]))}/></td>)}<td className="p-2 text-center text-lg font-black">{totalScore(row)}</td></tr>)}</tbody></table>{!ranked.length&&<p className="py-8 text-center text-slate-500">Add teams when departmental categories are confirmed.</p>}</div></Card> }
function Budget({data,setData,total}:{data:SeminarState;setData:React.Dispatch<React.SetStateAction<SeminarState>>;total:number}) { const add=()=>setData(d=>({...d,budget:[...d.budget,{id:nextId(),category:"Practical resources",quantity:1,unitCost:0,funding:"Unconfirmed",status:"proposed"}]})); const update=(id:string,key:keyof BudgetRow,value:string|number)=>setData(d=>({...d,budget:d.budget.map(x=>x.id===id?{...x,[key]:value}:x)})); return <Card className="mt-4"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="text-xl font-black">Budget preparation</h2><p className="mt-1 text-sm text-slate-600">Do not spend against unconfirmed sponsorship or proposed lines.</p></div><div className="text-right"><p className="text-sm text-slate-500">Current total</p><p className="text-2xl font-black">{money(total)}</p></div><Button onClick={add}><Plus size={17}/>Add line</Button></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead><tr className="border-b"><th className="p-2">Category</th><th className="p-2">Qty</th><th className="p-2">Unit cost</th><th className="p-2">Total</th><th className="p-2">Funding source</th><th className="p-2">Status</th></tr></thead><tbody>{data.budget.map(row=><tr key={row.id} className="border-b">{(["category","quantity","unitCost"] as const).map(key=><td className="p-2" key={key}><input className="rounded border p-2" type={key==="category"?"text":"number"} value={row[key]} onChange={e=>update(row.id,key,key==="category"?e.target.value:Number(e.target.value))}/></td>)}<td className="p-2 font-black">{money(row.quantity*row.unitCost)}</td><td className="p-2"><input className="rounded border p-2" value={row.funding} onChange={e=>update(row.id,"funding",e.target.value)}/></td><td className="p-2"><select className="rounded border p-2" value={row.status} onChange={e=>update(row.id,"status",e.target.value)}><option value="proposed">Proposed</option><option value="approved">Approved</option><option value="paid">Paid</option></select></td></tr>)}</tbody></table>{!data.budget.length&&<p className="py-8 text-center text-slate-500">No budget lines entered. Quantities and rates must be confirmed before approval.</p>}</div></Card> }
