import { useEffect, useMemo, useState } from "react";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { getContentCampaigns, markSharedContentAttempt, type ContentCampaignData } from "../firebase/contentShareLinks";

type Attempt = Record<string, unknown>;

export default function TutorContentCampaignResultsPage() {
  const [data, setData] = useState<ContentCampaignData>({ links: [], contacts: [], attempts: [] });
  const [selected, setSelected] = useState("all");
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  async function load() { const next = await getContentCampaigns(); setData(next); setSelectedAttempt(current => current ? next.attempts.find(item => String(item.id) === String(current.id)) ?? null : null); }
  useEffect(() => { void load().catch(() => setError("Campaign results could not be loaded.")); }, []);
  const contacts = useMemo(() => new Map(data.contacts.map(item => [String(item.id), item])), [data.contacts]);
  const filtered = useMemo(() => data.attempts.filter(item => selected === "all" || String(item.assessmentGroupId) === selected), [data.attempts, selected]);
  const marked = filtered.filter(item => Number.isFinite(Number(item.percentage)));
  const average = marked.length ? Math.round(marked.reduce((sum, item) => sum + Number(item.percentage), 0) / marked.length) : null;
  function openAttempt(attempt:Attempt){setSelectedAttempt(attempt);window.setTimeout(()=>window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"}),50)}

  async function mark(attempt: Attempt, score: number, total: number, feedback: string) {
    if (!Number.isFinite(total) || !Number.isFinite(score) || total <= 0 || score < 0 || score > total) { setError("Enter a valid score and a total greater than zero."); return; }
    try { setSaving(String(attempt.id)); setError(""); await markSharedContentAttempt({ attemptId: String(attempt.id), score, totalMarks: total, feedback }); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The mark could not be saved."); }
    finally { setSaving(""); }
  }


  return <TutorLayout title="Campaign Results" subtitle="Open guest submissions, mark them, then release results to each participant.">
    <div className="grid gap-4 sm:grid-cols-3"><Metric label="Submissions" value={filtered.length}/><Metric label="Marked" value={marked.length}/><Metric label="Average" value={average == null ? "Awaiting marks" : `${average}%`}/></div>
    {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-800">{error}</p>}
    <Card className="mt-6"><label className="block max-w-xl"><span className="mb-1 block text-sm font-bold">Niche / campaign cohort</span><select className="w-full rounded-xl border px-3 py-3" value={selected} onChange={event => setSelected(event.target.value)}><option value="all">All campaign cohorts</option>{data.links.map(link => <option key={String(link.id)} value={String(link.assessmentGroupId || link.code || link.id)}>{String(link.nicheName)} — {String(link.resourceTitle)}</option>)}</select></label></Card>
    <Card className="mt-6"><h2 className="text-xl font-black">Collective grading and analysis</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Participant</th><th className="p-3">Institution</th><th className="p-3">Content</th><th className="p-3">Score</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>{filtered.map(attempt => {
      const contact = contacts.get(String(attempt.contactId)); const isMarked = attempt.status === "marked" || attempt.status === "released"; const isReleased = attempt.released === true || attempt.status === "released";
      return <tr key={String(attempt.id)} className="border-b align-top"><td className="p-3"><strong>{String(contact?.fullName || "Guest learner")}</strong><br/><span className="text-xs text-slate-500">{String(contact?.email || "")}</span></td><td className="p-3">{String(contact?.institutionName || "")}</td><td className="p-3">{String(attempt.resourceTitle || "")}</td><td className="p-3 font-bold">{attempt.score == null ? "Tutor review" : `${String(attempt.score)}/${String(attempt.totalMarks)} (${String(attempt.percentage)}%)`}</td><td className="p-3">{isReleased ? "Released" : isMarked ? "Marked — awaiting release" : "Submitted"}</td><td className="p-3"><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => openAttempt(attempt)}>View answers</Button><Button variant="outline" disabled={saving === String(attempt.id)} onClick={() => openAttempt(attempt)}>{isMarked ? "Review mark" : "Mark"}</Button></div></td></tr>;
    })}</tbody></table>{filtered.length === 0 && <p className="py-8 text-center text-slate-500">No submissions in this cohort yet.</p>}</div></Card>
    {selectedAttempt && <SubmissionReview key={String(selectedAttempt.id)} attempt={selectedAttempt} contact={contacts.get(String(selectedAttempt.contactId))} saving={saving === String(selectedAttempt.id)} onSave={(score,totalMarks,feedback) => mark(selectedAttempt,score,totalMarks,feedback)} onClose={() => setSelectedAttempt(null)}/>}
  </TutorLayout>;
}

function SubmissionReview({ attempt, contact, saving, onSave, onClose }: { attempt: Attempt; contact?: Attempt; saving: boolean; onSave: (score:number,totalMarks:number,feedback:string) => Promise<void>; onClose: () => void }) {
  const answers = attempt.answers && typeof attempt.answers === "object" ? Object.entries(attempt.answers as Record<string, unknown>).filter(([key]) => !key.startsWith("_")) : [];
  const snapshots = Array.isArray(attempt.questionSnapshot) ? attempt.questionSnapshot as Array<Record<string, unknown>> : [];
  const initialTotal=Number(attempt.totalMarks);const [totalMarks,setTotalMarks]=useState(Number.isFinite(initialTotal)&&initialTotal>0?String(initialTotal):"100");const [score,setScore]=useState(attempt.score==null?"":String(attempt.score));const [feedback,setFeedback]=useState(String(attempt.feedback||""));const released=attempt.released===true||attempt.status==="released";
  return <Card className="mt-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold uppercase text-blue-700">Submitted examination</p><h2 className="mt-1 text-2xl font-black">{String(contact?.fullName || "Guest learner")}</h2><p className="text-sm text-slate-500">{String(contact?.email || "")} · {String(contact?.institutionName || "")}</p></div><Button variant="outline" onClick={onClose}>Close</Button></div><h3 className="mt-6 font-black">{String(attempt.resourceTitle || "Examination")}</h3>{snapshots.length > 0 ? <div className="mt-4 space-y-3">{snapshots.map((question,index) => {const id=String(question.id||index+1);const answer=(attempt.answers as Record<string,unknown>|undefined)?.[id];return <div key={id} className="rounded-xl border bg-slate-50 p-4"><p className="text-xs font-black uppercase text-blue-700">Question {String(question.label||index+1)}</p><p className="mt-2 font-semibold whitespace-pre-wrap">{String(question.prompt||"")}</p><p className="mt-3 whitespace-pre-wrap"><strong>Guest answer:</strong> {String(answer||"No response")}</p></div>})}</div> : answers.length > 0 ? <div className="mt-4 space-y-3">{answers.map(([question, answer]) => <div key={question} className="rounded-xl border bg-slate-50 p-4"><p className="text-xs font-black uppercase text-blue-700">Question {question}</p><p className="mt-2 whitespace-pre-wrap">{String(answer || "No response")}</p></div>)}</div> : <pre className="mt-4 whitespace-pre-wrap rounded-xl border bg-slate-50 p-4 font-sans text-sm leading-6">{String(attempt.answerText || "No readable answers were recorded.")}</pre>}<div className="mt-6 rounded-2xl border-2 border-blue-100 bg-blue-50 p-5"><h3 className="text-lg font-black text-blue-950">Tutor marking</h3><p className="mt-1 text-sm text-blue-800">Review the complete submission above before entering the final mark.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label><span className="mb-1 block text-sm font-bold">Total marks</span><input className="w-full rounded-xl border bg-white px-3 py-3" type="number" min="1" step="0.5" value={totalMarks} onChange={event=>setTotalMarks(event.target.value)}/></label><label><span className="mb-1 block text-sm font-bold">Student score</span><input className="w-full rounded-xl border bg-white px-3 py-3" type="number" min="0" max={Number(totalMarks)||undefined} step="0.5" value={score} onChange={event=>setScore(event.target.value)}/></label></div><label className="mt-4 block"><span className="mb-1 block text-sm font-bold">Feedback and corrections</span><textarea className="min-h-32 w-full rounded-xl border bg-white p-3" value={feedback} onChange={event=>setFeedback(event.target.value)} placeholder="Explain strengths, corrections and areas for improvement..."/></label><div className="mt-4 flex flex-wrap gap-3"><Button disabled={saving||!score||Number(totalMarks)<=0||Number(score)<0||Number(score)>Number(totalMarks)} onClick={()=>void onSave(Number(score),Number(totalMarks),feedback)}>{saving?"Saving...":attempt.status==="marked"||released?"Update mark":"Save mark"}</Button>{released&&<span className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-800">Result released to guest</span>}</div></div></Card>;
}

function Metric({ label, value }: { label: string; value: string | number }) { return <Card><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></Card>; }
