import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { ClipboardCheck, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { db } from "../config/firebase";
import useAuth from "../hooks/useAuth";

type Station = { id: string; title: string; discipline: string; stationType: "OSCE" | "OSPE"; durationMinutes: number; totalMarks: number; instructions: string; status: "draft" | "published" };

export default function OsceManagerPage() {
  const { currentUser, userProfile } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", discipline: "", stationType: "OSCE" as "OSCE" | "OSPE", durationMinutes: 5, totalMarks: 20, instructions: "" });

  useEffect(() => onSnapshot(query(collection(db, "osceStations"), orderBy("createdAt", "desc")), snap => setStations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Station)))), []);

  async function createStation() {
    if (!form.title.trim() || !form.discipline.trim()) return alert("Enter the station title and discipline.");
    setSaving(true);
    try {
      await addDoc(collection(db, "osceStations"), { ...form, status: "draft", ownerUserId: currentUser?.uid || "", createdByUid: currentUser?.uid || "", createdByName: userProfile?.fullName || currentUser?.email || "Tutor", institutionId: userProfile?.institutionId || "", createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setForm({ title: "", discipline: "", stationType: "OSCE", durationMinutes: 5, totalMarks: 20, instructions: "" });
    } finally { setSaving(false); }
  }

  return <TutorLayout title="OSCE / OSPE Manager" subtitle="Create practical assessment stations and examiner-ready specifications">
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Card><h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Plus size={20}/> New station</h2>
        <div className="space-y-4">
          <input className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Station title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          <input className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Discipline / course unit" value={form.discipline} onChange={e=>setForm({...form,discipline:e.target.value})}/>
          <div className="grid grid-cols-2 gap-3"><select className="rounded-xl border border-slate-300 px-3 py-3" value={form.stationType} onChange={e=>setForm({...form,stationType:e.target.value as "OSCE"|"OSPE"})}><option>OSCE</option><option>OSPE</option></select><input type="number" min="1" className="rounded-xl border border-slate-300 px-3 py-3" value={form.durationMinutes} onChange={e=>setForm({...form,durationMinutes:Number(e.target.value)})}/></div>
          <input type="number" min="1" className="w-full rounded-xl border border-slate-300 px-4 py-3" value={form.totalMarks} onChange={e=>setForm({...form,totalMarks:Number(e.target.value)})}/>
          <textarea className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Candidate and examiner instructions" value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})}/>
          <Button fullWidth loading={saving} onClick={createStation}>Create station</Button>
        </div>
      </Card>
      <div className="space-y-4">{stations.length===0 ? <Card className="text-center text-slate-500"><ClipboardCheck className="mx-auto mb-3"/>No stations created yet.</Card> : stations.map(station=><Card key={station.id} className="border border-slate-200"><div className="flex items-start justify-between gap-4"><div><div className="mb-2 flex gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{station.stationType}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{station.status}</span></div><h3 className="text-lg font-bold">{station.title}</h3><p className="text-sm text-slate-600">{station.discipline} · {station.durationMinutes} minutes · {station.totalMarks} marks</p><p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{station.instructions || "No instructions added."}</p></div><Button variant="danger" size="sm" onClick={()=>deleteDoc(doc(db,"osceStations",station.id))}><Trash2 size={16}/></Button></div></Card>)}</div>
    </div>
  </TutorLayout>;
}
