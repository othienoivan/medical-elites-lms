import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicPageShell from "../components/layout/PublicPageShell";
import Button from "../components/ui/Button";
import useAuth from "../hooks/useAuth";
import {
  saveAudienceAttempt,
  saveAudienceScore,
  getPublicSeminarQuestions,
  registerSeminarAttendance,
  submitSeminarAnswers,
  watchAudienceAttempts,
  watchAudienceScores,
  watchCompetitionEvents,
  watchJudgeScores,
  watchParticipants,
  watchSeminarResources,
  watchSeminarQuestionAttempts,
  watchSeminarSessions,
  type AudienceAttempt,
  type AudienceScore,
  type CompetitionEvent,
  type JudgeScore,
  type Participant,
  type SeminarResource,
  type SeminarQuestion,
  type SeminarQuestionAttempt,
  type SeminarSession,
} from "../firebase/seminarCompetition";
export default function SeminarLivePage() {
  const { seminarId = "" } = useParams();
  const seminarReturnPath = `/seminar/${encodeURIComponent(seminarId)}/live`;
  const seminarLoginPath = `/login?role=student&redirect=${encodeURIComponent(seminarReturnPath)}`;
  const { currentUser, userProfile } = useAuth();
  const [events, setEvents] = useState<CompetitionEvent[]>([]),
    [people, setPeople] = useState<Participant[]>([]),
    [judges, setJudges] = useState<JudgeScore[]>([]),
    [audience, setAudience] = useState<AudienceScore[]>([]),
    [attempts, setAttempts] = useState<AudienceAttempt[]>([]),
    [resources, setResources] = useState<SeminarResource[]>([]),
    [sessions, setSessions] = useState<SeminarSession[]>([]),
    [questionAttempts, setQuestionAttempts] = useState<
      SeminarQuestionAttempt[]
    >([]),
    [questions, setQuestions] = useState<SeminarQuestion[]>([]),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [selectedEvent, setSelectedEvent] = useState(""),
    [selectedSession, setSelectedSession] = useState(""),
    [participationMessage, setParticipationMessage] = useState(""),
    [vote, setVote] = useState({ participantId: "", total: 0 }),
    [challenge, setChallenge] = useState({
      eventId: "",
      score: 0,
      maximum: 20,
    });
  useEffect(() => {
    const u = [
      watchCompetitionEvents(seminarId, setEvents),
      watchParticipants(seminarId, setPeople),
      watchJudgeScores(seminarId, setJudges),
      watchAudienceScores(seminarId, setAudience),
      watchAudienceAttempts(seminarId, setAttempts),
      watchSeminarResources(seminarId, setResources),
      watchSeminarSessions(seminarId, setSessions),
      watchSeminarQuestionAttempts(seminarId, setQuestionAttempts),
    ];
    return () => u.forEach((x) => x());
  }, [seminarId]);
  useEffect(() => {
    void getPublicSeminarQuestions(seminarId, selectedEvent)
      .then(setQuestions)
      .catch(() => setQuestions([]));
  }, [seminarId, selectedEvent]);
  const board = useMemo(
    () =>
      people
        .map((p) => {
          const j = judges.filter((x) => x.participantId === p.id),
            a = audience.filter((x) => x.participantId === p.id);
          return {
            p,
            j,
            official:
              j.length === 2
                ? j.reduce((s, x) => s + (x.total / x.maximum) * 100, 0) / 2
                : null,
            audience: a.length
              ? a.reduce((s, x) => s + (x.total / x.maximum) * 100, 0) /
                a.length
              : null,
            votes: a.length,
          };
        })
        .sort((a, b) => (b.official ?? -1) - (a.official ?? -1)),
    [people, judges, audience],
  );
  const name = String(
    (userProfile as Record<string, unknown> | null)?.fullName ||
      currentUser?.email ||
      "Audience member",
  );
  return (
    <PublicPageShell>
      <section className="bg-gradient-to-br from-slate-950 to-blue-800 px-5 py-14 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="font-bold uppercase tracking-widest text-blue-200">
            Live seminar results
          </p>
          <h1 className="mt-3 text-4xl font-black">Seminar Leaderboard</h1>
          <p className="mt-3 max-w-2xl text-blue-100">
            Official marks are the average of two judges. Audience scoring is
            published separately and never changes the official rank.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-8">
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">
              Register and record attendance
            </h2>
            {!currentUser ? (
              <p className="mt-3 text-slate-600">
                <Link className="font-bold text-blue-700" to={seminarLoginPath}>
                  Sign in or create an account
                </Link>{" "}
                before registering. This prevents duplicate attendance records.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                <select
                  className="w-full rounded-xl border p-3"
                  value={selectedSession}
                  onChange={(event) => setSelectedSession(event.target.value)}
                >
                  <option value="">Select today&apos;s session</option>
                  {sessions
                    .filter((item) => item.status === "open")
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title} · {item.date} {item.startTime}
                      </option>
                    ))}
                </select>
                <Button
                  disabled={!selectedSession}
                  onClick={async () => {
                    const session = sessions.find(
                      (item) => item.id === selectedSession,
                    );
                    if (!session || !currentUser) return;
                    await registerSeminarAttendance(seminarId, {
                      sessionId: session.id,
                      sessionTitle: session.title,
                      userId: currentUser.uid,
                      attendeeName: name,
                      attendeeEmail: currentUser.email || "",
                    });
                    setParticipationMessage(
                      "Attendance captured and sent to the attendance officer for confirmation.",
                    );
                  }}
                >
                  Register attendance
                </Button>
              </div>
            )}
            {participationMessage && (
              <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                {participationMessage}
              </p>
            )}
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Audience question challenge</h2>
            <select
              className="mt-4 w-full rounded-xl border p-3"
              value={selectedEvent}
              onChange={(event) => setSelectedEvent(event.target.value)}
            >
              <option value="">Select event questions</option>
              {events.filter((item) => item.status === "live").map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            {questions.length > 0 && (
              <form
                className="mt-4 space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!currentUser) {
                    setParticipationMessage(
                      "Sign in before submitting answers.",
                    );
                    return;
                  }
                  const attempt = await submitSeminarAnswers(
                    seminarId,
                    selectedEvent,
                    answers,
                  );
                  setParticipationMessage(
                    attempt.pendingSubjective
                      ? `MCQ score: ${attempt.score}/${attempt.maximum}. Written answers are awaiting committee review.`
                      : `Result submitted: ${attempt.score}/${attempt.maximum}.`,
                  );
                }}
              >
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="rounded-xl border bg-slate-50 p-4"
                  >
                    <p className="font-black">
                      {index + 1}. {question.prompt}{" "}
                      <span className="text-sm text-slate-500">
                        ({question.marks} marks)
                      </span>
                    </p>
                    {question.type === "mcq" ? (
                      <div className="mt-3 space-y-2">
                        {question.options.map((option) => (
                          <label key={option} className="flex gap-2">
                            <input
                              required
                              name={question.id}
                              type="radio"
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={(event) =>
                                setAnswers({
                                  ...answers,
                                  [question.id]: event.target.value,
                                })
                              }
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        required
                        className="mt-3 min-h-28 w-full rounded-xl border bg-white p-3"
                        value={answers[question.id] || ""}
                        onChange={(event) =>
                          setAnswers({
                            ...answers,
                            [question.id]: event.target.value,
                          })
                        }
                        placeholder={
                          question.type === "short-answer"
                            ? "Enter your short answer"
                            : "Enter your detailed answer"
                        }
                      />
                    )}
                  </div>
                ))}
                <Button type="submit">Submit answers</Button>
              </form>
            )}
            {selectedEvent && questions.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">
                No published questions for this event.
              </p>
            )}
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-black">Audience question leaderboard</h2>
          <p className="mt-1 text-sm text-slate-600">
            Objective scores appear immediately. Attempts containing short or
            long answers remain marked as awaiting review.
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3">Rank</th>
                  <th className="p-3">Participant</th>
                  <th className="p-3">Event</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...questionAttempts]
                  .sort(
                    (a, b) =>
                      (b.maximum ? b.score / b.maximum : 0) -
                      (a.maximum ? a.score / a.maximum : 0),
                  )
                  .map((attempt, index) => (
                    <tr key={attempt.id} className="border-b">
                      <td className="p-3 font-black">{index + 1}</td>
                      <td className="p-3 font-semibold">
                        {attempt.participantName}
                      </td>
                      <td className="p-3">
                        {events.find((item) => item.id === attempt.eventId)
                          ?.title || "Event"}
                      </td>
                      <td className="p-3 font-black">
                        {attempt.maximum > 0
                          ? `${attempt.score}/${attempt.maximum}`
                          : "Pending"}
                      </td>
                      <td className="p-3">
                        {attempt.pendingSubjective
                          ? "Written answers awaiting review"
                          : "Marked"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-black">Official leaderboard</h2>
          <div className="mt-4 space-y-4">
            {board.map((x, i) => (
              <article
                key={x.p.id}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-blue-700">
                      #{i + 1} ·{" "}
                      {events.find((e) => e.id === x.p.eventId)?.title ||
                        "Event"}
                    </p>
                    <h3 className="text-xl font-black">{x.p.name}</h3>
                    <p className="text-slate-500">{x.p.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black">
                      {x.official == null
                        ? "Pending"
                        : `${x.official.toFixed(1)}%`}
                    </p>
                    <p className="text-sm text-slate-500">
                      {x.j.length}/2 judge scores · Audience{" "}
                      {x.audience == null ? "—" : `${x.audience.toFixed(1)}%`} (
                      {x.votes})
                    </p>
                  </div>
                </div>
                {x.j.length > 0 && (
                  <details className="mt-4 rounded-xl bg-slate-50 p-4">
                    <summary className="cursor-pointer font-bold">
                      View published judge checklists
                    </summary>
                    {x.j.map((j) => (
                      <div className="mt-4 border-t pt-3" key={j.id}>
                        <b>
                          {j.judgeName}: {j.total}/{j.maximum}
                        </b>
                        {j.checklist.map((c) => (
                          <p className="mt-1 text-sm" key={c.criterion}>
                            {c.criterion}: {c.score}/{c.maximum}
                            {c.comment ? ` — ${c.comment}` : ""}
                          </p>
                        ))}
                      </div>
                    ))}
                  </details>
                )}
              </article>
            ))}
          </div>
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-black">Audience scoring</h2>
            {!currentUser ? (
              <p className="mt-3">
                Please{" "}
                <Link className="font-bold text-blue-700" to={seminarLoginPath}>
                  sign in
                </Link>{" "}
                to score. One score per participant is retained.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                <select
                  className="w-full rounded-xl border p-3"
                  value={vote.participantId}
                  onChange={(e) =>
                    setVote({ ...vote, participantId: e.target.value })
                  }
                >
                  <option value="">Select participant</option>
                  {people.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full rounded-xl border p-3"
                  type="number"
                  min="0"
                  max="100"
                  value={vote.total}
                  onChange={(e) =>
                    setVote({
                      ...vote,
                      total: Math.min(100, Number(e.target.value)),
                    })
                  }
                />
                <Button
                  onClick={async () => {
                    const p = people.find((x) => x.id === vote.participantId);
                    if (p && currentUser)
                      await saveAudienceScore(seminarId, {
                        participantId: p.id,
                        eventId: p.eventId,
                        userId: currentUser.uid,
                        voterName: name,
                        total: vote.total,
                        maximum: 100,
                      });
                  }}
                >
                  Submit audience score
                </Button>
              </div>
            )}
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-black">Audience challenge</h2>
            {!currentUser ? (
              <p className="mt-3">
                Sign in to submit your independent event result.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                <select
                  className="w-full rounded-xl border p-3"
                  value={challenge.eventId}
                  onChange={(e) =>
                    setChallenge({ ...challenge, eventId: e.target.value })
                  }
                >
                  <option value="">Select event</option>
                  {events.map((e) => (
                    <option value={e.id} key={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full rounded-xl border p-3"
                  type="number"
                  min="0"
                  max={challenge.maximum}
                  value={challenge.score}
                  onChange={(e) =>
                    setChallenge({
                      ...challenge,
                      score: Number(e.target.value),
                    })
                  }
                />
                <Button
                  onClick={async () => {
                    if (currentUser)
                      await saveAudienceAttempt(seminarId, {
                        eventId: challenge.eventId,
                        userId: currentUser.uid,
                        participantName: name,
                        score: challenge.score,
                        maximum: challenge.maximum,
                      });
                  }}
                >
                  Publish my result
                </Button>
              </div>
            )}
            <ol className="mt-5 space-y-2">
              {[...attempts]
                .sort((a, b) => b.score / b.maximum - a.score / a.maximum)
                .map((a, i) => (
                  <li className="flex justify-between border-b py-2" key={a.id}>
                    <span>
                      {i + 1}. {a.participantName}
                    </span>
                    <b>
                      {a.score}/{a.maximum}
                    </b>
                  </li>
                ))}
            </ol>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-black">
            Public questions and scoring resources
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <a
                className="rounded-xl border bg-white p-4 font-bold text-blue-700"
                href={r.fileUrl}
                target="_blank"
                rel="noreferrer"
                key={r.id}
              >
                {r.title}
                <small className="mt-1 block font-normal uppercase text-slate-500">
                  {r.kind}
                </small>
              </a>
            ))}
          </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
