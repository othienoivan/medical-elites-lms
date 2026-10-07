import DailyIframe, { type DailyCall } from "@daily-co/daily-js";
import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, ExternalLink, FileText, Mic, MicOff, MonitorUp, MonitorX, RefreshCw, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import TutorLayout from "../components/layout/TutorLayout";
import useAuth from "../hooks/useAuth";
import { getLiveClassRoster, joinLiveClass, listLiveClasses, manageLiveClass, updateLiveClassPresence } from "../firebase/liveClasses";
import type { LiveClass, LiveClassAttendance } from "../models/LiveClass";

type JoinDetails = { roomUrl: string; token: string; isOwner: boolean };

export default function LiveClassRoomPage() {
  const { sessionId = "" } = useParams();
  const { role } = useAuth();
  const tutor = role === "tutor" || role === "admin";
  const navigate = useNavigate();
  const frameHostRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const videoBeforePresentingRef = useRef(false);
  const hideCameraWhilePresentingRef = useRef(true);
  const [session, setSession] = useState<LiveClass | null>(null);
  const [join, setJoin] = useState<JoinDetails | null>(null);
  const [roster, setRoster] = useState<LiveClassAttendance[]>([]);
  const [error, setError] = useState("");
  const [minutes, setMinutes] = useState(20);
  const [entered, setEntered] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [hideCameraWhilePresenting, setHideCameraWhilePresenting] = useState(true);

  useEffect(() => { hideCameraWhilePresentingRef.current = hideCameraWhilePresenting; }, [hideCameraWhilePresenting]);

  async function refresh() {
    const all = await listLiveClasses();
    setSession(all.find((item) => item.id === sessionId) ?? null);
    if (tutor) setRoster(await getLiveClassRoster(sessionId));
  }

  useEffect(() => {
    void refresh().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "The classroom could not be opened."));
  }, [sessionId]);

  async function enterClassroom() {
    try {
      setConnecting(true); setError("");
      const details = await joinLiveClass(sessionId);
      setJoin(details); setEntered(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The classroom could not be opened.");
    } finally { setConnecting(false); }
  }

  useEffect(() => {
    if (!join || !entered || !frameHostRef.current || callRef.current) return;
    const call = DailyIframe.createFrame(frameHostRef.current, {
      showLeaveButton: true, showFullscreenButton: true,
      startAudioOff: !micOn, startVideoOff: !videoOn,
      iframeStyle: { width: "100%", height: "100%", border: "0" },
    });
    callRef.current = call;
    const syncLocalState = () => {
      const local = call.participants().local;
      if (local) { setMicOn(Boolean(local.audio)); setVideoOn(Boolean(local.video)); }
    };
    call.on("joined-meeting", syncLocalState);
    call.on("participant-updated", syncLocalState);
    call.on("camera-error", () => { setVideoOn(false); setError("Camera access is blocked. Allow camera permission in browser settings, then use Retry devices."); });
    call.on("local-screen-share-started", () => setPresenting(true));
    call.on("local-screen-share-stopped", () => {
      setPresenting(false);
      const shouldRestoreVideo = hideCameraWhilePresentingRef.current && videoBeforePresentingRef.current;
      videoBeforePresentingRef.current = false;
      if (shouldRestoreVideo) {
        try { call.setLocalVideo(true); setVideoOn(true); } catch { /* Device may have been removed. */ }
      }
    });
    call.on("error", () => setError("The classroom could not access your devices. Check browser permissions or open it in a new tab."));
    void call.join({ url: join.roomUrl, token: join.token }).catch((caught: unknown) => {
      setError(caught instanceof Error ? caught.message : "Unable to join the classroom."); setEntered(false);
    });
    return () => { callRef.current = null; void call.destroy(); };
  }, [entered, join]);

  useEffect(() => {
    if (!join) return;
    const heartbeat = window.setInterval(() => void updateLiveClassPresence({ sessionId, action: "heartbeat" }), 30_000);
    const leave = () => void updateLiveClassPresence({ sessionId, action: "leave" });
    window.addEventListener("beforeunload", leave);
    return () => { window.clearInterval(heartbeat); window.removeEventListener("beforeunload", leave); leave(); };
  }, [join, sessionId]);

  useEffect(() => { if (!tutor) return; const timer = window.setInterval(() => void refresh(), 15_000); return () => window.clearInterval(timer); }, [tutor, sessionId]);

  async function toggleMicrophone() {
    const next = !micOn;
    try { await callRef.current?.setLocalAudio(next); setMicOn(next); setError(""); }
    catch { setError("Microphone access is blocked. Allow it in browser site settings, then use Retry devices."); }
  }

  async function toggleCamera() {
    const next = !videoOn;
    try { await callRef.current?.setLocalVideo(next); setVideoOn(next); setError(""); }
    catch { setError("Camera access is blocked. Allow it in browser site settings, then use Retry devices."); }
  }

  async function retryDevices() {
    setError("");
    try { const call = callRef.current; if (!call) return; await call.setLocalAudio(micOn); await call.setLocalVideo(videoOn); }
    catch { setError("Permission is still blocked. Use the site-controls icon beside the address bar, allow Camera and Microphone, then reload."); }
  }

  async function togglePresentation() {
    const call = callRef.current;
    if (!call) return;
    if (!presenting && !navigator.mediaDevices?.getDisplayMedia) {
      setError("This browser does not support screen sharing. Use desktop Chrome or Edge, or open the uploaded presentation for learners to follow.");
      return;
    }
    try {
      setError("");
      if (presenting) {
        await call.stopScreenShare();
        setPresenting(false);
        if (hideCameraWhilePresenting && videoBeforePresentingRef.current) {
          videoBeforePresentingRef.current = false;
          await call.setLocalVideo(true);
          setVideoOn(true);
        }
      } else {
        videoBeforePresentingRef.current = videoOn;
        if (hideCameraWhilePresenting && videoOn) {
          await call.setLocalVideo(false);
          setVideoOn(false);
        }
        await call.startScreenShare();
        setPresenting(true);
      }
    } catch (caught) {
      setPresenting(false);
      if (hideCameraWhilePresenting && videoBeforePresentingRef.current) {
        videoBeforePresentingRef.current = false;
        try { call.setLocalVideo(true); setVideoOn(true); } catch { /* Preserve the sharing error below. */ }
      }
      const detail = caught instanceof Error ? caught.message : "Screen capture was denied or is unavailable.";
      setError(`Screen sharing could not start: ${detail} Use desktop Chrome or Edge, select a screen, window or tab, and click Share.`);
    }
  }

  async function launchTest() { if (!session?.quizId) return; await manageLiveClass({ sessionId, action: "launch_test", quizId: session.quizId, quizTitle: session.quizTitle ?? undefined, testDurationMinutes: minutes }); await refresh(); }
  async function mark(record: LiveClassAttendance, status: LiveClassAttendance["status"]) { await updateLiveClassPresence({ sessionId, action: "attendance", studentUid: record.studentUid, attendanceStatus: status }); await refresh(); }
  const openInNewTab = async () => {
    const target = window.open("about:blank", "_blank");
    try {
      setError("");
      const details = join ?? await joinLiveClass(sessionId);
      setJoin(details);
      if (target) { target.opener = null; target.location.href = `${details.roomUrl}?t=${encodeURIComponent(details.token)}`; }
    } catch (caught) {
      target?.close();
      setError(caught instanceof Error ? caught.message : "The classroom could not be opened in a new tab.");
    }
  };
  const roomCanJoin = session?.status === "live" || (session?.status === "scheduled" && session.allowJoinBeforeTutor !== false && Date.now() >= new Date(session.startsAt).getTime() - (session.earlyJoinMinutes ?? 30) * 60_000);
  const attendees = roster.filter((record) => record.role !== "tutor");

  const content = <div className="min-h-[calc(100vh-5rem)] bg-slate-950 p-3 text-white"><div className="mx-auto max-w-[1800px]">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-black">{session?.title ?? "Live classroom"}</h1><p className="text-sm text-slate-300">{session?.courseUnitTitle}</p></div><button onClick={() => navigate("/live-classes")} className="rounded-xl border border-slate-600 px-4 py-2">Leave classroom</button></div>
    {error && <div role="alert" className="mb-3 rounded-xl bg-red-950 p-4 text-red-100">{error}</div>}
    {!entered ? <section className="mx-auto mt-8 max-w-2xl rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
      <h2 className="text-2xl font-black">Prepare for your live class</h2><p className="mt-2 text-slate-600">Choose how you want to enter. Your microphone starts muted unless you turn it on.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => setMicOn((value) => !value)} className={`flex min-h-24 items-center justify-center gap-3 rounded-2xl border-2 font-black ${micOn ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-300 bg-slate-50 text-slate-700"}`}>{micOn ? <Mic size={28}/> : <MicOff size={28}/>} Microphone {micOn ? "on" : "off"}</button>
        <button type="button" onClick={() => setVideoOn((value) => !value)} className={`flex min-h-24 items-center justify-center gap-3 rounded-2xl border-2 font-black ${videoOn ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-300 bg-slate-50 text-slate-700"}`}>{videoOn ? <Camera size={28}/> : <CameraOff size={28}/>} Camera {videoOn ? "on" : "off"}</button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2"><button disabled={connecting || !roomCanJoin} onClick={() => void enterClassroom()} className="rounded-xl bg-blue-700 px-5 py-4 font-black text-white disabled:opacity-50">{connecting ? "Connecting…" : "Enter classroom"}</button><button disabled={connecting || !roomCanJoin} onClick={() => void openInNewTab()} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-4 font-bold disabled:opacity-50"><ExternalLink size={18}/> Open in new tab</button></div>
      {!roomCanJoin && <p className="mt-3 text-center text-sm text-slate-600">This classroom opens {session?.earlyJoinMinutes ?? 30} minutes before the scheduled start.</p>}
      <details className="mt-5 rounded-xl bg-slate-100 p-4"><summary className="cursor-pointer font-bold">Camera or microphone blocked?</summary><p className="mt-3 text-sm text-slate-700">Open the site-controls icon beside the browser address bar, set Camera and Microphone to Allow, then reload. On Android, also check Phone Settings → Apps → Chrome → Permissions.</p></details>
    </section> : <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div><div className="relative h-[72vh] overflow-hidden rounded-2xl bg-black"><div ref={frameHostRef} className="h-full w-full"/>{connecting && <div className="absolute inset-0 grid place-items-center bg-black/80 text-slate-200">Connecting securely…</div>}</div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-slate-900 p-3">
          <button type="button" aria-pressed={micOn} onClick={() => void toggleMicrophone()} className={`flex min-h-12 items-center gap-2 rounded-full px-5 font-bold ${micOn ? "bg-slate-700" : "bg-red-700"}`}>{micOn ? <Mic/> : <MicOff/>}<span className="hidden sm:inline">{micOn ? "Mute" : "Unmute"}</span></button>
          <button type="button" aria-pressed={videoOn} onClick={() => void toggleCamera()} className={`flex min-h-12 items-center gap-2 rounded-full px-5 font-bold ${videoOn ? "bg-slate-700" : "bg-red-700"}`}>{videoOn ? <Camera/> : <CameraOff/>}<span className="hidden sm:inline">{videoOn ? "Stop video" : "Start video"}</span></button>
          <button type="button" onClick={() => void retryDevices()} className="flex min-h-12 items-center gap-2 rounded-full bg-slate-700 px-5 font-bold"><RefreshCw size={19}/><span className="hidden sm:inline">Retry devices</span></button>
          <button type="button" aria-pressed={presenting} onClick={() => void togglePresentation()} className={`flex min-h-12 items-center gap-2 rounded-full px-5 font-bold ${presenting ? "bg-amber-600" : "bg-emerald-700"}`}>{presenting ? <MonitorX size={19}/> : <MonitorUp size={19}/>}<span className="hidden sm:inline">{presenting ? "Stop presenting" : "Share screen"}</span></button>
          <button type="button" onClick={() => void openInNewTab()} className="flex min-h-12 items-center gap-2 rounded-full bg-blue-700 px-5 font-bold"><MonitorUp size={19}/><span className="hidden sm:inline">New tab</span></button>
        </div></div>
      <aside className="space-y-3">
        {session?.presentationUrl && <section className="rounded-2xl bg-slate-900 p-4"><h2 className="flex items-center gap-2 font-black"><FileText size={18}/>Class presentation</h2><p className="mt-2 text-sm text-slate-300">{session.presentationName}</p><a href={session.presentationUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-bold">Open presentation <ExternalLink size={16}/></a>{tutor && <><label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl bg-slate-800 p-3 text-sm"><input type="checkbox" checked={hideCameraWhilePresenting} disabled={presenting} onChange={(event) => setHideCameraWhilePresenting(event.target.checked)} className="mt-1 h-4 w-4"/><span><strong className="block">Hide my camera while presenting</strong><span className="text-slate-400">Your camera is restored automatically when sharing ends.</span></span></label><button type="button" onClick={() => void togglePresentation()} className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold ${presenting ? "bg-amber-600" : "bg-emerald-700"}`}>{presenting ? <MonitorX size={18}/> : <MonitorUp size={18}/>} {presenting ? "Stop presenting" : "Share presentation / screen"}</button></>}<p className="mt-2 text-xs text-slate-400">Open the presentation first, select Share presentation, then choose its tab or window. Mobile screen sharing appears only when the device and browser support screen capture; use desktop Chrome or Edge for dependable presenting.</p></section>}
        {session?.activeQuizId ? <section className="rounded-2xl bg-emerald-950 p-4"><h2 className="font-black">Live test in progress</h2><p className="mt-1 text-sm text-emerald-100">{session.activeQuizTitle}</p><button onClick={() => window.open(`/assessments/quizzes/${session.activeQuizId}`, "_blank")} className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3 font-black">Open live test</button></section> : tutor && session?.quizId ? <section className="rounded-2xl bg-slate-900 p-4"><h2 className="font-black">Attached test</h2><p className="mt-1 text-sm text-slate-300">{session.quizTitle}</p><div className="mt-3 flex gap-2"><input type="number" min={1} max={240} value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} className="w-20 rounded-xl bg-slate-800 px-3 py-2"/><button onClick={() => void launchTest()} className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 font-bold">Launch test</button></div></section> : null}
        {tutor && <section className="max-h-[40vh] overflow-auto rounded-2xl bg-slate-900 p-4"><h2 className="flex items-center gap-2 font-black"><Users size={18}/>Attendance ({attendees.length})</h2>{attendees.map((record) => <div key={record.id} className="mt-3 border-t border-slate-700 pt-3"><p className="font-bold">{record.studentName || record.studentUid} {record.role === "guest" && <span className="ml-1 rounded bg-blue-900 px-2 py-0.5 text-xs">Guest</span>}</p>{record.studentEmail && <p className="text-xs text-slate-400">{record.studentEmail}</p>}{record.institutionName && <p className="text-xs text-slate-400">{record.institutionName}</p>}<select value={record.status || "present"} onChange={(event) => void mark(record, event.target.value as LiveClassAttendance["status"])} className="mt-1 w-full rounded-lg bg-slate-800 px-2 py-2 text-sm"><option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option><option value="excused">Excused</option></select></div>)}</section>}
      </aside>
    </div>}
  </div></div>;
  return tutor ? <TutorLayout title="Live Classroom">{content}</TutorLayout> : content;
}


