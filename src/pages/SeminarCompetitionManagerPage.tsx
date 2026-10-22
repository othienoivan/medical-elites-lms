import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TutorLayout from "../components/layout/TutorLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import useAuth from "../hooks/useAuth";
import { uploadFileToStorage } from "../firebase/storage";
import {
  watchCommittee,
  watchSeminar,
  type CommitteeMember,
} from "../firebase/seminars";
import {
  addCompetitionEvent,
  addParticipant,
  addSeminarQuestion,
  addSeminarResource,
  addSeminarSession,
  saveJudgeScore,
  verifySeminarAttendance,
  watchSeminarAttendance,
  watchCompetitionEvents,
  watchJudgeScores,
  watchParticipants,
  watchSeminarQuestions,
  watchSeminarResources,
  watchSeminarSessions,
  type CompetitionEvent,
  type JudgeScore,
  type Participant,
  type SeminarAttendance,
  type SeminarQuestion,
  type SeminarResource,
  type SeminarSession,
} from "../firebase/seminarCompetition";
const field = "w-full rounded-xl border px-3 py-3";
export default function SeminarCompetitionManagerPage() {
  const { seminarId = "" } = useParams();
  const { currentUser, userProfile } = useAuth();
  const [events, setEvents] = useState<CompetitionEvent[]>([]),
    [people, setPeople] = useState<Participant[]>([]),
    [scores, setScores] = useState<JudgeScore[]>([]),
    [resources, setResources] = useState<SeminarResource[]>([]),
    [sessions, setSessions] = useState<SeminarSession[]>([]),
    [attendance, setAttendance] = useState<SeminarAttendance[]>([]),
    [questions, setQuestions] = useState<SeminarQuestion[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]),
    [ownerUid, setOwnerUid] = useState("");
  const [eventTitle, setEventTitle] = useState(""),
    [person, setPerson] = useState({
      eventId: "",
      name: "",
      department: "Nursing",
      category: "Departmental",
    }),
    [selected, setSelected] = useState(""),
    [criteria, setCriteria] = useState([
      {
        criterion: "Knowledge and accuracy",
        score: 0,
        maximum: 20,
        comment: "",
      },
      { criterion: "Case analysis", score: 0, maximum: 25, comment: "" },
      {
        criterion: "Communication / teach-back",
        score: 0,
        maximum: 15,
        comment: "",
      },
      { criterion: "Practical safety", score: 0, maximum: 30, comment: "" },
      { criterion: "Teamwork", score: 0, maximum: 10, comment: "" },
    ]),
    [upload, setUpload] = useState({
      eventId: "",
      kind: "questions" as SeminarResource["kind"],
      title: "",
    }),
    [file, setFile] = useState<File | null>(null),
    [session, setSession] = useState({
      title: "",
      date: "",
      startTime: "",
      status: "open" as SeminarSession["status"],
    }),
    [question, setQuestion] = useState({
      eventId: "",
      type: "mcq" as SeminarQuestion["type"],
      prompt: "",
      optionsText: "",
      correctOption: "",
      markingGuide: "",
      marks: 1,
      published: true,
    }),
    [message, setMessage] = useState("");
  useEffect(() => {
    const un = [
      watchCompetitionEvents(seminarId, setEvents),
      watchParticipants(seminarId, setPeople),
      watchJudgeScores(seminarId, setScores),
      watchSeminarResources(seminarId, setResources),
      watchSeminarSessions(seminarId, setSessions),
      watchSeminarAttendance(seminarId, setAttendance),
      watchSeminarQuestions(seminarId, setQuestions),
    ];
    return () => un.forEach((x) => x());
  }, [seminarId]);
  useEffect(() => {
    const memberWatch = watchCommittee(seminarId, setCommittee);
    const seminarWatch = watchSeminar(
      seminarId,
      (value) => setOwnerUid(value?.ownerUid || ""),
      () => setOwnerUid(""),
    );
    return () => {
      memberWatch();
      seminarWatch();
    };
  }, [seminarId]);
  const canVerifyAttendance =
    ownerUid === currentUser?.uid ||
    committee.some(
      (member) =>
        member.uid === currentUser?.uid &&
        member.active &&
        member.role === "Attendance Officer",
    );
  const current = people.find((x) => x.id === selected);
  const total = criteria.reduce((s, x) => s + x.score, 0),
    maximum = criteria.reduce((s, x) => s + x.maximum, 0);
  const leaderboard = useMemo(
    () =>
      people
        .map((p) => {
          const js = scores.filter((s) => s.participantId === p.id);
          return {
            p,
            js,
            official:
              js.length === 2
                ? js.reduce((n, s) => n + (s.total / s.maximum) * 100, 0) / 2
                : null,
          };
        })
        .sort((a, b) => (b.official ?? -1) - (a.official ?? -1)),
    [people, scores],
  );
  async function submitJudge() {
    if (!currentUser || !current) return;
    await saveJudgeScore(seminarId, {
      participantId: current.id,
      eventId: current.eventId,
      judgeUid: currentUser.uid,
      judgeName: String(
        (userProfile as Record<string, unknown> | null)?.fullName ||
          currentUser.email ||
          "Judge",
      ),
      total,
      maximum,
      checklist: criteria,
    });
    setMessage("Judge score and checklist published.");
  }
  async function uploadResource(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setMessage("Uploading...");
    const result = await uploadFileToStorage({ file, folder: "documents" });
    await addSeminarResource(seminarId, {
      ...upload,
      fileUrl: result.downloadUrl,
      fileName: result.fileName,
    });
    setMessage("Resource uploaded and published.");
    setFile(null);
  }
  return (
    <TutorLayout
      title="Seminar Competition Control"
      subtitle="Manage events, participants, resources, judge scoring and the public leaderboard."
    >
      <div className="mb-5 flex flex-wrap gap-3">
        <Link
          className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white"
          to={`/seminar/${seminarId}/live`}
          target="_blank"
        >
          Open public leaderboard
        </Link>
        <Button
          variant="outline"
          onClick={async () => {
            const url = `${window.location.origin}/seminar/${seminarId}/live`;
            await navigator.clipboard.writeText(url);
            setMessage("Audience participation link copied.");
          }}
        >
          Copy audience link
        </Button>
        <Link
          className="rounded-xl border px-5 py-3 font-bold"
          to={`/seminar/${seminarId}`}
        >
          Back to seminar management
        </Link>
      </div>
      {message && (
        <p className="mb-4 rounded-xl bg-blue-50 p-4 font-semibold text-blue-900">
          {message}
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">Events and participants</h2>
          <form
            className="mt-4 flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await addCompetitionEvent(seminarId, {
                title: eventTitle,
                status: "live",
                order: events.length + 1,
              });
              setEventTitle("");
            }}
          >
            <input
              className={field}
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Event name"
            />
            <Button type="submit">Add event</Button>
          </form>
          <form
            className="mt-5 grid gap-3 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await addParticipant(seminarId, person);
              setPerson({ ...person, name: "" });
            }}
          >
            <select
              required
              className={field}
              value={person.eventId}
              onChange={(e) =>
                setPerson({ ...person, eventId: e.target.value })
              }
            >
              <option value="">Select event</option>
              {events.map((x) => (
                <option value={x.id} key={x.id}>
                  {x.title}
                </option>
              ))}
            </select>
            <input
              required
              className={field}
              value={person.name}
              onChange={(e) => setPerson({ ...person, name: e.target.value })}
              placeholder="Participant/team name"
            />
            <input
              className={field}
              value={person.department}
              onChange={(e) =>
                setPerson({ ...person, department: e.target.value })
              }
              placeholder="Department"
            />
            <Button type="submit">Add participant</Button>
          </form>
          <div className="mt-5 space-y-2">
            {leaderboard.map((x, i) => (
              <button
                key={x.p.id}
                onClick={() => setSelected(x.p.id)}
                className="flex w-full justify-between rounded-xl border p-3 text-left"
              >
                <span>
                  <b>
                    {i + 1}. {x.p.name}
                  </b>
                  <small className="block text-slate-500">
                    {x.p.department}
                  </small>
                </span>
                <b>
                  {x.official == null
                    ? `${x.js.length}/2 judges`
                    : `${x.official.toFixed(1)}%`}
                </b>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Judge scoring</h2>
          <select
            className={`${field} mt-4`}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Select participant</option>
            {people.map((x) => (
              <option value={x.id} key={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          {current && (
            <div className="mt-4 space-y-3">
              {criteria.map((c, i) => (
                <div className="rounded-xl border p-3" key={c.criterion}>
                  <div className="flex justify-between">
                    <b>{c.criterion}</b>
                    <span>/{c.maximum}</span>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-[100px_1fr]">
                    <input
                      className={field}
                      type="number"
                      min="0"
                      max={c.maximum}
                      value={c.score}
                      onChange={(e) =>
                        setCriteria((v) =>
                          v.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  score: Math.min(
                                    Number(e.target.value),
                                    x.maximum,
                                  ),
                                }
                              : x,
                          ),
                        )
                      }
                    />
                    <input
                      className={field}
                      value={c.comment}
                      onChange={(e) =>
                        setCriteria((v) =>
                          v.map((x, j) =>
                            j === i ? { ...x, comment: e.target.value } : x,
                          ),
                        )
                      }
                      placeholder="Judge comment"
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <b className="text-xl">
                  Total: {total}/{maximum}
                </b>
                <Button onClick={() => void submitJudge()}>
                  Publish judge score
                </Button>
              </div>
              <p className="text-sm text-slate-500">
                Each signed-in judge can publish one score per participant.
                Their latest score replaces their earlier one.
              </p>
            </div>
          )}
        </Card>
        <Card>
          <h2 className="text-xl font-black">
            Upload questions and scoring resources
          </h2>
          <form className="mt-4 space-y-3" onSubmit={uploadResource}>
            <select
              required
              className={field}
              value={upload.eventId}
              onChange={(e) =>
                setUpload({ ...upload, eventId: e.target.value })
              }
            >
              <option value="">Select event</option>
              {events.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.title}
                </option>
              ))}
            </select>
            <select
              className={field}
              value={upload.kind}
              onChange={(e) =>
                setUpload({
                  ...upload,
                  kind: e.target.value as SeminarResource["kind"],
                })
              }
            >
              <option value="questions">Questions</option>
              <option value="marking-guide">Marking guide</option>
              <option value="checklist">Checklist / rubric</option>
            </select>
            <input
              required
              className={field}
              value={upload.title}
              onChange={(e) => setUpload({ ...upload, title: e.target.value })}
              placeholder="Resource title"
            />
            <input
              required
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button type="submit">Upload resource</Button>
          </form>
          <div className="mt-4 space-y-2">
            {resources.map((x) => (
              <a
                className="block rounded-xl border p-3 font-semibold text-blue-700"
                href={x.fileUrl}
                target="_blank"
                rel="noreferrer"
                key={x.id}
              >
                {x.title} · {x.kind}
              </a>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Set questions in the browser</h2>
          <p className="mt-1 text-sm text-slate-600">
            MCQs are marked automatically. Short and long answers retain the
            browser-authored marking guide for committee review.
          </p>
          <form
            className="mt-4 space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const options =
                question.type === "mcq"
                  ? question.optionsText
                      .split("\n")
                      .map((value) => value.trim())
                      .filter(Boolean)
                  : [];
              if (question.type === "mcq" && options.length < 2) {
                setMessage("Enter at least two MCQ options, one per line.");
                return;
              }
              await addSeminarQuestion(seminarId, {
                eventId: question.eventId,
                type: question.type,
                prompt: question.prompt,
                options,
                correctOption:
                  question.type === "mcq" ? question.correctOption : "",
                markingGuide: question.markingGuide,
                marks: question.marks,
                published: question.published,
              });
              setQuestion({
                ...question,
                prompt: "",
                optionsText: "",
                correctOption: "",
                markingGuide: "",
              });
              setMessage("Question and marking guide saved.");
            }}
          >
            <select
              required
              className={field}
              value={question.eventId}
              onChange={(event) =>
                setQuestion({ ...question, eventId: event.target.value })
              }
            >
              <option value="">Select competition event</option>
              {events.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <select
              className={field}
              value={question.type}
              onChange={(event) =>
                setQuestion({
                  ...question,
                  type: event.target.value as SeminarQuestion["type"],
                })
              }
            >
              <option value="mcq">Multiple-choice question</option>
              <option value="short-answer">Short-answer question</option>
              <option value="long-answer">Long-answer question</option>
            </select>
            <textarea
              required
              className={`${field} min-h-28`}
              value={question.prompt}
              onChange={(event) =>
                setQuestion({ ...question, prompt: event.target.value })
              }
              placeholder="Question text"
            />
            {question.type === "mcq" && (
              <>
                <textarea
                  required
                  className={`${field} min-h-28`}
                  value={question.optionsText}
                  onChange={(event) =>
                    setQuestion({
                      ...question,
                      optionsText: event.target.value,
                    })
                  }
                  placeholder={"Enter one option per line\nOption A\nOption B"}
                />
                <input
                  required
                  className={field}
                  value={question.correctOption}
                  onChange={(event) =>
                    setQuestion({
                      ...question,
                      correctOption: event.target.value,
                    })
                  }
                  placeholder="Correct option — copy it exactly"
                />
              </>
            )}
            <textarea
              required
              className={`${field} min-h-28`}
              value={question.markingGuide}
              onChange={(event) =>
                setQuestion({ ...question, markingGuide: event.target.value })
              }
              placeholder="Marking guide / expected answer"
            />
            <input
              required
              className={field}
              type="number"
              min="0.5"
              step="0.5"
              value={question.marks}
              onChange={(event) =>
                setQuestion({ ...question, marks: Number(event.target.value) })
              }
              placeholder="Marks"
            />
            <label className="flex items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={question.published}
                onChange={(event) =>
                  setQuestion({ ...question, published: event.target.checked })
                }
              />
              Publish to audience immediately
            </label>
            <Button type="submit">Save question</Button>
          </form>
          <p className="mt-4 text-sm font-semibold text-slate-600">
            {questions.length} browser-authored question
            {questions.length === 1 ? "" : "s"}
          </p>
        </Card>
        <Card>
          <h2 className="text-xl font-black">
            Sessions and verified attendance
          </h2>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              await addSeminarSession(seminarId, session);
              setSession({ ...session, title: "" });
              setMessage("Attendance session published.");
            }}
          >
            <input
              required
              className={field}
              value={session.title}
              onChange={(event) =>
                setSession({ ...session, title: event.target.value })
              }
              placeholder="Session title"
            />
            <input
              required
              className={field}
              type="date"
              value={session.date}
              onChange={(event) =>
                setSession({ ...session, date: event.target.value })
              }
            />
            <input
              className={field}
              type="time"
              value={session.startTime}
              onChange={(event) =>
                setSession({ ...session, startTime: event.target.value })
              }
            />
            <select
              className={field}
              value={session.status}
              onChange={(event) =>
                setSession({
                  ...session,
                  status: event.target.value as SeminarSession["status"],
                })
              }
            >
              <option value="scheduled">Scheduled</option>
              <option value="open">Open for registration</option>
              <option value="closed">Closed</option>
            </select>
            <Button type="submit">Create session</Button>
          </form>
          <div className="mt-5 space-y-3">
            {sessions.map((item) => (
              <div key={item.id} className="rounded-xl border p-3">
                <b>{item.title}</b>
                <p className="text-sm text-slate-500">
                  {item.date} {item.startTime} · {item.status}
                </p>
              </div>
            ))}
          </div>
          <h3 className="mt-6 font-black">Attendance awaiting verification</h3>
          <p className="mt-1 text-sm text-slate-600">
            Only the seminar owner or a committee member assigned as Attendance
            Officer can confirm these records.
          </p>
          <div className="mt-3 space-y-3">
            {attendance.map((record) => (
              <div key={record.id} className="rounded-xl border p-3">
                <b>{record.attendeeName}</b>
                <p className="text-sm text-slate-500">
                  {record.attendeeEmail} · {record.sessionTitle} ·{" "}
                  {record.status}
                </p>
                {record.status === "pending" && canVerifyAttendance && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      onClick={() =>
                        void verifySeminarAttendance(record.id, "confirmed")
                      }
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        void verifySeminarAttendance(record.id, "rejected")
                      }
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {attendance.length === 0 && (
              <p className="text-sm text-slate-500">
                No registrations recorded yet.
              </p>
            )}
          </div>
        </Card>
      </div>
    </TutorLayout>
  );
}
