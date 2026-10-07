import { useEffect, useState } from "react";
import { CalendarClock, ShieldCheck, Video } from "lucide-react";
import { useParams } from "react-router-dom";
import { getOpenLiveClass, joinOpenLiveClass, updateOpenLiveClassPresence, type OpenLiveClassSummary } from "../firebase/liveClasses";

type GuestForm = { guestName: string; guestEmail: string; guestPhone: string; guestInstitution: string };
type JoinDetails = { roomUrl: string; token: string; attendeeKey: string };

export default function OpenLiveClassPage() {
  const { shareToken = "" } = useParams();
  const [session, setSession] = useState<OpenLiveClassSummary | null>(null);
  const [form, setForm] = useState<GuestForm>({ guestName: "", guestEmail: "", guestPhone: "", guestInstitution: "" });
  const [join, setJoin] = useState<JoinDetails | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { void getOpenLiveClass(shareToken).then(setSession).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "This live-class link is unavailable.")); }, [shareToken]);
  useEffect(() => {
    if (!join) return;
    const heartbeat = window.setInterval(() => void updateOpenLiveClassPresence({ shareToken, attendeeKey: join.attendeeKey, action: "heartbeat" }), 30_000);
    const leave = () => void updateOpenLiveClassPresence({ shareToken, attendeeKey: join.attendeeKey, action: "leave" });
    window.addEventListener("beforeunload", leave);
    return () => { window.clearInterval(heartbeat); window.removeEventListener("beforeunload", leave); leave(); };
  }, [join, shareToken]);

  async function enter() {
    try { setBusy(true); setError(""); setJoin(await joinOpenLiveClass({ shareToken, ...form })); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "You could not join this class."); }
    finally { setBusy(false); }
  }

  if (join) return <main className="min-h-screen bg-slate-950 p-3 text-white"><div className="mx-auto max-w-[1600px]"><div className="mb-3"><h1 className="text-xl font-black">{session?.title}</h1><p className="text-sm text-slate-300">Joined as {form.guestName}</p></div><iframe title={session?.title || "Live classroom"} src={`${join.roomUrl}?t=${encodeURIComponent(join.token)}`} allow="camera; microphone; fullscreen; display-capture; autoplay" className="h-[calc(100vh-6rem)] w-full rounded-2xl border-0 bg-black"/></div></main>;

  return <main className="min-h-screen bg-slate-100 px-4 py-10"><section className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-xl sm:p-9">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><Video size={28}/></div>
    <h1 className="mt-5 text-3xl font-black text-slate-900">{session?.title ?? "Join live class"}</h1>
    {session && <><p className="mt-2 font-semibold text-blue-700">{session.courseUnitTitle}</p><p className="mt-3 text-slate-600">{session.description}</p><p className="mt-4 flex items-center gap-2 text-sm text-slate-600"><CalendarClock size={17}/>{session.startsAt ? new Date(session.startsAt).toLocaleString() : "Time to be confirmed"} · Tutor: {session.tutorName}</p></>}
    {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}
    {session && <div className="mt-7 grid gap-4 sm:grid-cols-2">
      <label><span className="mb-1 block text-sm font-bold">Full name</span><input required className="w-full rounded-xl border px-4 py-3" value={form.guestName} onChange={e=>setForm({...form,guestName:e.target.value})}/></label>
      <label><span className="mb-1 block text-sm font-bold">Email address</span><input required type="email" className="w-full rounded-xl border px-4 py-3" value={form.guestEmail} onChange={e=>setForm({...form,guestEmail:e.target.value})}/></label>
      <label><span className="mb-1 block text-sm font-bold">Phone number</span><input required type="tel" className="w-full rounded-xl border px-4 py-3" value={form.guestPhone} onChange={e=>setForm({...form,guestPhone:e.target.value})}/></label>
      <label><span className="mb-1 block text-sm font-bold">Institution</span><input className="w-full rounded-xl border px-4 py-3" value={form.guestInstitution} onChange={e=>setForm({...form,guestInstitution:e.target.value})}/></label>
      <p className="flex gap-2 text-xs text-slate-500 sm:col-span-2"><ShieldCheck className="shrink-0" size={17}/>Your details and attendance are shared with the class tutor for class administration and follow-up.</p>
      <button disabled={busy || !form.guestName || !form.guestEmail || !form.guestPhone} onClick={()=>void enter()} className="rounded-xl bg-blue-700 px-5 py-4 font-black text-white disabled:opacity-50 sm:col-span-2">{busy ? "Joining securely…" : "Join live class"}</button>
    </div>}
  </section></main>;
}


