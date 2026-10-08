import { CalendarClock, FileText, GraduationCap, PlayCircle, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { getPublishedStudentExaminations } from "../firebase/examinations";
import { getOwnExaminationSubmissions } from "../firebase/examinationSubmissions";
import useStudentLearningAccess from "../hooks/useStudentLearningAccess";
import type { Examination } from "../models/Examination";
import type { ExaminationSubmission } from "../models/ExaminationSubmission";

export default function StudentExaminationsPage() {
  const navigate = useNavigate();
  const { courseUnitIds, loading: accessLoading, error: accessError } = useStudentLearningAccess();
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [submissions, setSubmissions] = useState<Record<string,ExaminationSubmission>>({});
  const [loading, setLoading] = useState(true);

  const courseKey = useMemo(() => [...courseUnitIds].sort().join("|"), [courseUnitIds]);

  useEffect(() => {
    let active = true;
    if (accessLoading) return () => { active = false; };
    async function load() {
      try {
        setLoading(true);
        const [records,ownSubmissions] = await Promise.all([getPublishedStudentExaminations(courseUnitIds),getOwnExaminationSubmissions()]);
        if (active) {setExaminations(records);setSubmissions(Object.fromEntries(ownSubmissions.map(item=>[item.examinationId,item])));}
      } catch (error) {
        console.error("Failed to load published examinations:", error);
        if (active) setExaminations([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [accessLoading, courseKey]);

  const now = Date.now();
  const available = examinations.filter((exam) => !exam.opensAt || new Date(exam.opensAt).getTime() <= now);
  const upcoming = examinations.filter((exam) => exam.opensAt && new Date(exam.opensAt).getTime() > now);

  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
    <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
      <div className="flex items-center gap-4"><FileText size={44}/><div><h1 className="text-3xl font-bold">My Examinations</h1><p className="mt-2 text-blue-100">Access examination papers published for your assigned course units.</p></div></div>
    </section>

    <div className="mt-6 grid gap-4 sm:grid-cols-2"><Card><p className="text-sm font-semibold text-slate-500">Available examinations</p><p className="mt-2 text-3xl font-black text-slate-950">{available.length}</p></Card><Card><p className="text-sm font-semibold text-slate-500">Upcoming examinations</p><p className="mt-2 text-3xl font-black text-slate-950">{upcoming.length}</p></Card></div>

    {accessError ? <Card className="mt-6 border-red-200 bg-red-50 text-red-800">{accessError}</Card> : loading || accessLoading ? <Card className="mt-6">Loading examinations...</Card> : examinations.length === 0 ? <Card className="mt-6 text-center"><FileText size={52} className="mx-auto text-slate-400"/><h2 className="mt-4 text-xl font-bold">No published examinations yet</h2><p className="mt-2 text-slate-600">Published examinations for your assigned course units will appear here.</p></Card> : <div className="mt-6 grid gap-5 md:grid-cols-2">{examinations.map((exam) => {
      const opensLater = Boolean(exam.opensAt && new Date(exam.opensAt).getTime() > now);
      const closed = Boolean(exam.closesAt && new Date(exam.closesAt).getTime() < now);
      const submission = submissions[exam.id];
      const buttonText = submission?.released ? "View Released Results" : submission ? "Examination Already Submitted" : opensLater ? "Not Open Yet" : closed ? "Examination Closed" : "Sit Examination Online";
      return <Card key={exam.id}><div className="flex items-start justify-between gap-3"><div><span className={`rounded-full px-3 py-1 text-xs font-bold ${opensLater ? "bg-amber-100 text-amber-800" : closed ? "bg-slate-200 text-slate-700" : "bg-emerald-100 text-emerald-800"}`}>{opensLater ? "Upcoming" : closed ? "Closed" : "Available"}</span><h2 className="mt-3 text-xl font-bold text-slate-950">{exam.title}</h2><p className="mt-1 text-sm text-slate-600">{exam.courseUnitTitle || exam.examinationName}</p></div><GraduationCap className="text-blue-700"/></div>
        <div className="mt-4 space-y-2 text-sm text-slate-600"><p className="flex items-center gap-2"><Timer size={16}/>Time allowed: {exam.timeAllowed || `${exam.durationMinutes || 0} minutes`}</p>{exam.opensAt&&<p className="flex items-center gap-2"><CalendarClock size={16}/>Opens: {formatDate(exam.opensAt)}</p>}{exam.closesAt&&<p className="flex items-center gap-2"><CalendarClock size={16}/>Closes: {formatDate(exam.closesAt)}</p>}</div>
        <Button className="mt-5 w-full" disabled={!submission && (opensLater || closed || !exam.uploadedExamExtractedText)} onClick={()=>navigate(`/examinations/${exam.id}`)}><PlayCircle size={17}/>{buttonText}</Button>
        {!exam.uploadedExamExtractedText&&<p className="mt-2 text-xs text-amber-700">Online paper text is unavailable. Contact your tutor.</p>}
      </Card>})}</div>}
  </div>;
}

function formatDate(value:string){const date=new Date(value);return Number.isNaN(date.getTime())?value:date.toLocaleString();}

