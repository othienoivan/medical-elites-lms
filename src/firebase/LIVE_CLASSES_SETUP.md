# Live Classes deployment

The Live Classes module uses Daily's managed WebRTC service. The browser never receives the provider API key. Firebase Functions creates private rooms and short-lived participant or tutor tokens.

## Required one-time setup

1. Create a Daily account and copy its API key.
2. From the project root run `firebase functions:secrets:set DAILY_API_KEY` and paste the key.
3. Deploy the backend and application: `firebase deploy --only functions,hosting`.

After deployment, confirm that Firebase lists all six endpoints:

`firebase functions:list --project medical-elites-lms`

The expected names are `saveLiveClass`, `listLiveClasses`, `manageLiveClass`, `joinLiveClass`, `updateLiveClassPresence`, and `getLiveClassRoster`. A browser CORS message with no callable response commonly means the endpoint was not deployed or is not publicly invokable; do not treat that symptom as proof that frontend CORS code is the root cause.

Cloud recording is enabled in the room configuration. It is available only when the connected Daily account/plan supports it. Video, audio, chat, reactions, screen sharing, participant controls and pre-join device checks are supplied by Daily Prebuilt.

## Live-class flow

- Tutors open **Live Classes**, schedule a class for a course unit, and optionally attach a presentation and a published assessment.
- Assigned students receive an LMS notification.
- **Start class** provisions a private room and sends a second notification.
- Joining records attendance immediately; a 30-second heartbeat updates `lastSeenAt`, and leaving records `leftAt`.
- Tutors can amend Present/Late/Absent/Excused status from the room roster.
- **Launch test** exposes the attached assessment to participants and notifies the assigned students.
- **End class** prevents the LMS from issuing additional join tokens.

The module's Firestore collections (`liveClasses`, `liveClassAttendance`) are server-mediated through callable functions. Do not add broad client write rules for them.


