import { Archive, ArrowLeft, Copy, Edit, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CandidatePaperPreview from "../components/assessment/CandidatePaperPreview";
import MarkingGuidePreview from "../components/assessment/MarkingGuidePreview";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { createExaminationVersions, getExaminationById, updateExamination } from "../firebase/examinations";
import type { Examination } from "../models/Examination";

export default function ExaminationDetailsPage() {
  const { examId } = useParams(); const navigate = useNavigate();
  const [examination,setExamination]=useState<Examination|null>(null); const [loading,setLoading]=useState(true); const [preview,setPreview]=useState<"candidate"|"marking">("candidate"); const [working,setWorking]=useState(false);
  useEffect(()=>{let active=true;async function load(){if(!examId){setLoading(false);return;}try{const data=await getExaminationById(examId);if(active)setExamination(data);}finally{if(active)setLoading(false)}}void load();return()=>{active=false}},[examId]);
  async function createVersions(){if(!examination)return;const raw=prompt("How many shuffled versions? Enter 2 to 4.","2");if(!raw)return;const count=Number(raw);if(!Number.isInteger(count)||count<2||count>4){alert("Enter a whole number from 2 to 4.");return;}try{setWorking(true);await createExaminationVersions(examination,count);alert(`${count} draft versions created.`);navigate("/tutor/exams");}finally{setWorking(false)}}
  async function archive(){if(!examination||!confirm("Archive this examination?"))return;try{setWorking(true);await updateExamination(examination.id,{status:"archived"});setExamination({...examination,status:"archived"});}finally{setWorking(false)}}
  return <TutorLayout title="Examination Details" subtitle="Preview, print, version and manage the examination paper.">{loading?<Card>Loading examination...</Card>:!examination?<Card>Examination not found.</Card>:<div className="space-y-6">
    <div className="flex flex-wrap justify-end gap-3 print:hidden"><Button variant="outline" onClick={()=>navigate("/tutor/exams")}><ArrowLeft size={17}/>Back to Bank</Button><Button variant="outline" onClick={()=>setPreview(preview==="candidate"?"marking":"candidate")}>{preview==="candidate"?"Show Marking Guide":"Show Candidate Paper"}</Button><Button variant="outline" onClick={()=>window.print()}><Printer size={17}/>Print / Save PDF</Button><Button variant="outline" disabled={working} onClick={createVersions}><Copy size={17}/>Create Versions</Button><Button variant="outline" disabled={working||examination.status==="archived"} onClick={archive}><Archive size={17}/>Archive</Button><Button onClick={()=>navigate(`/tutor/exams/${examination.id}/builder`)}><Edit size={17}/>Open Builder</Button></div>
    <Card><div className="grid gap-3 text-sm md:grid-cols-4"><Metric label="Status" value={examination.status}/><Metric label="Pass mark" value={`${examination.passMark??50}%`}/><Metric label="Attempts" value={`${examination.attemptsAllowed??1}`}/><Metric label="Duration" value={`${examination.durationMinutes??0} minutes`}/></div></Card>
    {preview==="candidate"?<CandidatePaperPreview examination={examination}/>:<MarkingGuidePreview examination={examination}/>}</div>}</TutorLayout>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-slate-50 p-3"><p className="font-semibold text-slate-500">{label}</p><p className="mt-1 font-bold capitalize text-slate-950">{value}</p></div>}
