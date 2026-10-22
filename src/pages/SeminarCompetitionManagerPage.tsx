import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TutorLayout from "../components/layout/TutorLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import useAuth from "../hooks/useAuth";
import { uploadFileToStorage } from "../firebase/storage";
import {
  addCompetitionEvent,
  addParticipant,
  addSeminarResource,
  saveJudgeScore,
  watchCompetitionEvents,
  watchJudgeScores,
  watchParticipants,
  watchSeminarResources,
  type CompetitionEvent,
  type JudgeScore,
  type Participant,
  type SeminarResource,
} from "../firebase/seminarCompetition";
const field = "w-full rounded-xl border px-3 py-3";
export default function SeminarCompetitionManagerPage() {
  const { seminarId = "" } = useParams();
  const { currentUser, userProfile } = useAuth();
  const [events, setEvents] = useState<CompetitionEvent[]>([]),
    [people, setPeople] = useState<Participant[]>([]),
    [scores, setScores] = useState<JudgeScore[]>([]),
    [resources, setResources] = useState<SeminarResource[]>([]);
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
    [message, setMessage] = useState("");
  useEffect(() => {
    const un = [
      watchCompetitionEvents(seminarId,setEvents),
      watchParticipants(seminarId,setPeople),
      watchJudgeScores(seminarId,setScores),
      watchSeminarResources(seminarId,setResources),
    ];
    return () => un.forEach((x) => x());
  }, [seminarId]);
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
        <Link className="rounded-xl border px-5 py-3 font-bold" to={`/seminar/${seminarId}`}>
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
      </div>
    </TutorLayout>
  );
}
