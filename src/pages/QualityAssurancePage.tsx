import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { db } from "../config/firebase";
import useAuth from "../hooks/useAuth";

type Item={id:string; standard:string; evidence:string; status:"not-started"|"in-progress"|"compliant"};
export default function QualityAssurancePage(){
 const {currentUser,userProfile}=useAuth(); const [items,setItems]=useState<Item[]>([]); const [standard,setStandard]=useState(""); const [evidence,setEvidence]=useState("");
 useEffect(()=>onSnapshot(query(collection(db,"qualityAssuranceItems"),orderBy("createdAt","desc")),s=>setItems(s.docs.map(d=>({id:d.id,...d.data()} as Item)))),[]);
 const compliant=useMemo(()=>items.filter(i=>i.status==="compliant").length,[items]);
 async function add(){if(!standard.trim())return alert("Enter a quality standard."); await addDoc(collection(db,"qualityAssuranceItems"),{standard:standard.trim(),evidence:evidence.trim(),status:"not-started",ownerUserId:currentUser?.uid||"",institutionId:userProfile?.institutionId||"",createdAt:serverTimestamp()});setStandard("");setEvidence("");}
 return <TutorLayout title="Quality Assurance & Accreditation" subtitle="Track standards, evidence and institutional compliance">
  <div className="grid gap-4 sm:grid-cols-3"><Card><p className="text-sm text-slate-500">Standards tracked</p><p className="mt-2 text-3xl font-bold">{items.length}</p></Card><Card><p className="text-sm text-slate-500">Compliant</p><p className="mt-2 text-3xl font-bold text-green-600">{compliant}</p></Card><Card><p className="text-sm text-slate-500">Completion</p><p className="mt-2 text-3xl font-bold">{items.length?Math.round(compliant/items.length*100):0}%</p></Card></div>
  <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]"><Card><h2 className="mb-4 flex items-center gap-2 font-bold"><ShieldCheck size={20}/>Add standard</h2><div className="space-y-3"><input className="w-full rounded-xl border px-4 py-3" placeholder="Accreditation standard" value={standard} onChange={e=>setStandard(e.target.value)}/><textarea className="min-h-28 w-full rounded-xl border px-4 py-3" placeholder="Required evidence" value={evidence} onChange={e=>setEvidence(e.target.value)}/><Button fullWidth onClick={add}>Add standard</Button></div></Card><div className="space-y-3">{items.map(i=><Card key={i.id} className="border border-slate-200"><div className="flex gap-3"><CheckCircle2 className={i.status==="compliant"?"text-green-600":"text-slate-400"}/><div><h3 className="font-bold">{i.standard}</h3><p className="mt-1 text-sm text-slate-600">{i.evidence||"No evidence description supplied."}</p><span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{i.status}</span></div></div></Card>)}</div></div>
 </TutorLayout>;
}
