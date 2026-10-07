import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Copy, Download, Link2, Plus, Radio, Trash2, Unlink, Users, Video, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TutorLayout from "../components/layout/TutorLayout";
import FileUpload from "../components/upload/FileUpload";
import useAuth from "../hooks/useAuth";
import useCourseUnits from "../hooks/useCourseUnits";
import useQuizzes from "../hooks/useQuizzes";
import { getLiveClassRoster, listLiveClasses, manageLiveClass, saveLiveClass } from "../firebase/liveClasses";
import type { LiveClass, LiveClassAttendance } from "../models/LiveClass";

const initial = { title: "", description: "", courseUnitId: "", startsAt: "", endsAt: "", presentationName: "", presentationUrl: "", presentationPath: "", quizId: "", allowJoinBeforeTutor: true, earlyJoinMinutes: 30, generateOpenLink: false };

export default function LiveClassesPage() {
  const { role } = useAuth();
  const tutor = role === "tutor" || role === "admin";
  const navigate = useNavigate();
  const { courseUnits } = useCourseUnits(tutor);
  const { quizzes } = useQuizzes();
  const [sessions, setSessions] = useState<LiveClass[]>([]);
  const [form, setForm] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attendance, setAttendance] = useState<{ session: LiveClass; records: LiveClassAttendance[] } | null>(null);

  async function refresh() { try { setError(""); setSessions(await listLiveClasses()); } catch (e) { setError(e instanceof Error ? e.message : "Live classes could not be loaded."); } }
  useEffect(() => { void refresh(); }, []);
  const sorted = useMemo(() => [...sessions].sort((a,b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()), [sessions]);
  const availableQuizzes = quizzes.filter((quiz) => !form.courseUnitId || quiz.courseUnitId === form.courseUnitId);

  async function create() {
    const unit = courseUnits.find((item) => item.id === form.courseUnitId);
    const quiz = quizzes.find((item) => item.id === form.quizId);
    if (!form.title || !unit || !form.startsAt || !form.endsAt) { setError("Enter the title, course unit, start time and end time."); return; }
    try {
      setBusy(true); setError("");
      await saveLiveClass({ ...form, courseUnitTitle: unit.title, startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString(), quizTitle: quiz?.title ?? null, quizId: quiz?.id ?? null, presentationName: form.presentationName || null, presentationUrl: form.presentationUrl || null, presentationPath: form.presentationPath || null });
      setForm(initial); setShowForm(false); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "The class could not be scheduled."); } finally { setBusy(false); }
  }

  async function action(session: LiveClass, type: "start" | "end" | "delete" | "create_open_link" | "revoke_open_link") {
    if (type === "delete" && !window.confirm(`Delete ${session.title}?`)) return;
    try {
      setBusy(true); setError(""); setNotice("");
      const result = await manageLiveClass({ sessionId: session.id, action: type });
      if (type === "create_open_link" && typeof result.openShareToken === "string") {
        await copyLink(`/open-live/${result.openShareToken}`, "Public join link generated and copied. Anyone with this link can complete the guest form and join during the allowed time.");
      }
      if (type === "revoke_open_link") setNotice("The public join link has been revoked and can no longer be used.");
      await refresh();
      if (type === "start") navigate(`/live-classes/${session.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : "The class action failed."); } finally { setBusy(false); }
  }

  async function copyLink(path: string, confirmation = "Link copied.") {
    const url = `${window.location.origin}${path}`;
    try { await navigator.clipboard.writeText(url); setNotice(confirmation); }
    catch { window.prompt("Copy this link", url); setNotice("The link is ready to copy and share."); }
  }

  function canJoinNow(session: LiveClass) {
    if (session.status === "live") return true;
    if (session.status !== "scheduled" || session.allowJoinBeforeTutor === false) return false;
    return Date.now() >= new Date(session.startsAt).getTime() - (session.earlyJoinMinutes ?? 30) * 60_000;
  }

  async function retrieveAttendance(session: LiveClass) {
    try { setBusy(true); setError(""); setAttendance({ session, records: (await getLiveClassRoster(session.id)).filter(record => record.role !== "tutor") }); }
    catch (e) { setError(e instanceof Error ? e.message : "Attendance could not be retrieved."); }
    finally { setBusy(false); }
  }

  function attendanceDuration(record: LiveClassAttendance) {
    if (!record.joinedAt) return "—";
    const end = record.leftAt || record.lastSeenAt;
    if (!end) return "—";
    return `${Math.max(0, Math.round((new Date(end).getTime() - new Date(record.joinedAt).getTime()) / 60_000))} min`;
  }

  function downloadAttendance() {
    if (!attendance) return;
    const safe = (value: unknown) => {
      let text = String(value ?? "");
      if (/^[=+\-@]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const rows = [["Name", "Type", "Email", "Phone", "Institution", "Status", "Joined", "Last seen", "Left", "Duration", "Join count"], ...attendance.records.map(record => [record.studentName || record.studentUid, record.role === "guest" ? "Guest" : "Student", record.studentEmail || "", record.phoneNumber || "", record.institutionName || "", record.status, record.joinedAt ? new Date(record.joinedAt).toLocaleString() : "", record.lastSeenAt ? new Date(record.lastSeenAt).toLocaleString() : "", record.leftAt ? new Date(record.leftAt).toLocaleString() : "", attendanceDuration(record), record.joinCount ?? 1])];
    const blob = new Blob(["\uFEFF" + rows.map(row => row.map(safe).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${attendance.session.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "live-class"}-attendance.csv`; anchor.click();
    URL.revokeObjectURL(url);
  }

  const content = <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-black text-slate-900">Live Classes</h1><p className="mt-1 text-slate-600">Video lessons, live attendance, presentations, screen sharing and timed tests.</p></div>
      {tutor && <button onClick={() => setShowForm(v=>!v)} className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white"><Plus size={18}/> Schedule class</button>}
    </div>
    {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}
    {notice && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">{notice}</div>}
    {tutor && showForm && <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">Schedule a live class</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label><span className="mb-1 block text-sm font-bold">Class title</span><input className="w-full rounded-xl border px-4 py-3" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
        <label><span className="mb-1 block text-sm font-bold">Course unit</span><select className="w-full rounded-xl border px-4 py-3" value={form.courseUnitId} onChange={e=>setForm({...form,courseUnitId:e.target.value,quizId:""})}><option value="">Select course unit</option>{courseUnits.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
        <label><span className="mb-1 block text-sm font-bold">Starts</span><input type="datetime-local" className="w-full rounded-xl border px-4 py-3" value={form.startsAt} onChange={e=>setForm({...form,startsAt:e.target.value})}/></label>
        <label><span className="mb-1 block text-sm font-bold">Ends</span><input type="datetime-local" className="w-full rounded-xl border px-4 py-3" value={form.endsAt} onChange={e=>setForm({...form,endsAt:e.target.value})}/></label>
        <label className="flex items-start gap-3 rounded-xl border p-4"><input type="checkbox" checked={form.allowJoinBeforeTutor} onChange={e=>setForm({...form,allowJoinBeforeTutor:e.target.checked})} className="mt-1 h-4 w-4"/><span><strong className="block">Allow students to join before me</strong><span className="text-sm text-slate-600">The secure room opens before the tutor arrives.</span></span></label>
        <label><span className="mb-1 block text-sm font-bold">Open room before start (minutes)</span><input type="number" min={0} max={240} disabled={!form.allowJoinBeforeTutor} className="w-full rounded-xl border px-4 py-3 disabled:bg-slate-100" value={form.earlyJoinMinutes} onChange={e=>setForm({...form,earlyJoinMinutes:Number(e.target.value)})}/></label>
        <label className="flex items-start gap-3 rounded-xl border p-4 md:col-span-2"><input type="checkbox" checked={form.generateOpenLink} onChange={e=>setForm({...form,generateOpenLink:e.target.checked})} className="mt-1 h-4 w-4"/><span><strong className="block">Generate an open guest link</strong><span className="text-sm text-slate-600">Anyone with the link can enter after providing their name, email, phone and institution. They are recorded in attendance but receive no tutor controls.</span></span></label>
        <label className="md:col-span-2"><span className="mb-1 block text-sm font-bold">Description / agenda</span><textarea className="w-full rounded-xl border px-4 py-3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
        <label><span className="mb-1 block text-sm font-bold">Optional live test</span><select className="w-full rounded-xl border px-4 py-3" value={form.quizId} onChange={e=>setForm({...form,quizId:e.target.value})}><option value="">No test attached</option>{availableQuizzes.map(q=><option key={q.id} value={q.id}>{q.title}</option>)}</select></label>
        <div><span className="mb-1 block text-sm font-bold">Optional presentation</span><FileUpload folder="documents" accept=".pdf,.ppt,.pptx,.doc,.docx" label="Upload presentation" onUploaded={file=>setForm({...form,presentationName:file.fileName,presentationUrl:file.downloadUrl,presentationPath:file.filePath})}/></div>
      </div>
      <button disabled={busy} onClick={()=>void create()} className="mt-5 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white disabled:opacity-50">{busy?"Saving…":"Schedule and notify students"}</button>
    </div>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{sorted.map(session=><article key={session.id} className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${session.status==="live"?"bg-red-100 text-red-700":"bg-slate-100 text-slate-700"}`}>{session.status==="live"&&<Radio className="mr-1 inline" size={12}/>} {session.status}</span><Video className="text-blue-700"/></div>
      <h2 className="mt-4 text-xl font-black">{session.title}</h2><p className="mt-1 font-semibold text-blue-700">{session.courseUnitTitle}</p>
      <p className="mt-3 flex items-center gap-2 text-sm text-slate-600"><CalendarClock size={16}/>{new Date(session.startsAt).toLocaleString()}</p>
      <p className="mt-2 text-sm text-slate-600">Tutor: {session.tutorName}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {canJoinNow(session) && <button onClick={()=>navigate(`/live-classes/${session.id}`)} className="rounded-xl bg-blue-700 px-4 py-2 font-bold text-white">Join classroom</button>}
        {tutor && session.status==="scheduled" && <button disabled={busy} onClick={()=>void action(session,"start")} className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white">Start class</button>}
        {tutor && session.status==="live" && <button disabled={busy} onClick={()=>void action(session,"end")} className="rounded-xl bg-amber-600 px-4 py-2 font-bold text-white">End class</button>}
        {tutor && <button onClick={()=>void copyLink(`/live-classes/${session.id}`, "Enrolled-student link copied.")} className="flex items-center gap-2 rounded-xl border px-3 py-2 font-bold"><Copy size={16}/> Enrolled students</button>}
        {tutor && session.openShareToken && <button onClick={()=>void copyLink(`/open-live/${session.openShareToken}`, "Public join link copied. Anyone with the link can complete the guest form and join during the allowed time.")} className="flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 font-bold text-blue-700"><Link2 size={16}/> Copy public join link</button>}
        {tutor && !session.openShareToken && session.status!=="ended" && <button disabled={busy} onClick={()=>void action(session,"create_open_link")} className="flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 font-bold text-blue-700"><Link2 size={16}/> Generate public join link</button>}
        {tutor && session.openShareToken && <button title="Revoke public join link" aria-label="Revoke public join link" disabled={busy} onClick={()=>void action(session,"revoke_open_link")} className="rounded-xl border p-2 text-slate-600"><Unlink size={18}/></button>}
        {tutor && <button disabled={busy} onClick={()=>void retrieveAttendance(session)} className="flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 font-bold text-emerald-700"><Users size={16}/> Attendance</button>}
        {tutor && <button aria-label="Delete class" disabled={busy} onClick={()=>void action(session,"delete")} className="rounded-xl border border-red-200 p-2 text-red-700"><Trash2 size={18}/></button>}
      </div>
    </article>)}</div>
    {!sorted.length && <div className="rounded-2xl border border-dashed bg-white p-12 text-center"><Users className="mx-auto text-slate-400" size={44}/><h2 className="mt-4 text-xl font-black">No live classes yet</h2><p className="mt-2 text-slate-600">{tutor?"Schedule the first class for a course unit.":"Your scheduled classes will appear here."}</p></div>}
    {attendance && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-label="Class attendance"><section className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black">Attendance: {attendance.session.title}</h2><p className="text-sm text-slate-600">{new Date(attendance.session.startsAt).toLocaleString()} · {attendance.records.length} attendee(s)</p></div><div className="flex gap-2"><button onClick={downloadAttendance} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white"><Download size={17}/> Download CSV</button><button aria-label="Close attendance" onClick={()=>setAttendance(null)} className="rounded-xl border p-2"><X size={20}/></button></div></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-100"><tr>{["Name", "Type", "Contact", "Institution", "Status", "Joined", "Last seen / left", "Duration"].map(label=><th key={label} className="px-3 py-3">{label}</th>)}</tr></thead><tbody>{attendance.records.map(record=><tr key={record.id} className="border-t"><td className="px-3 py-3 font-bold">{record.studentName || record.studentUid}</td><td className="px-3 py-3 capitalize">{record.role || "student"}</td><td className="px-3 py-3"><div>{record.studentEmail || "—"}</div><div className="text-slate-500">{record.phoneNumber}</div></td><td className="px-3 py-3">{record.institutionName || "—"}</td><td className="px-3 py-3 capitalize">{record.status}</td><td className="px-3 py-3">{record.joinedAt ? new Date(record.joinedAt).toLocaleString() : "—"}</td><td className="px-3 py-3">{record.leftAt ? new Date(record.leftAt).toLocaleString() : record.lastSeenAt ? new Date(record.lastSeenAt).toLocaleString() : "—"}</td><td className="px-3 py-3">{attendanceDuration(record)}</td></tr>)}</tbody></table>{!attendance.records.length && <p className="p-8 text-center text-slate-500">No one has joined this class yet.</p>}</div></section></div>}
  </div>;
  return tutor ? <TutorLayout title="Live Classes" subtitle="Teach, present, assess and record attendance in real time.">{content}</TutorLayout> : content;
}


