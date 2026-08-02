# Medical Elites LMS — Initial Technical Audit

## Executive status

The project is not currently release-ready because the production build fails and linting reports blocking errors. The codebase is substantial and has many useful modules, but its core data models have drifted out of alignment with the pages and seed data that consume them.

## Verified project checks

- Project extracted successfully from `Medical-elites-lms.zip`.
- `npm ci` completed successfully.
- `npm run build` failed with TypeScript errors.
- `npm run lint` failed with 9 errors and 1 warning.
- `npm audit --omit=dev` reported 1 high-severity direct dependency vulnerability in `xlsx`.

## P0 — Build blockers

### 1. Quiz model mismatch

`QuizQuestionRef` only contains identifiers and marks, but the lesson quiz player and local quiz data expect embedded fields such as:

- `question`
- `options`
- `correctAnswer`
- `explanation`

Affected files include:

- `src/components/lesson/QuizPlayer.tsx`
- `src/data/quizzes.tsx`
- `src/models/Quiz.tsx`

Decision required: use either normalized references or embedded question snapshots. For launch stability, use embedded question snapshots for published quizzes and references for authoring.

### 2. Lesson model mismatch

The lesson seed data uses plain string objectives and an `order` property on sections, while the current model expects structured objectives and does not expose that section property.

Affected files:

- `src/data/lessons.tsx`
- `src/models/Lesson.tsx`

### 3. Module model mismatch

The local module data and progress logic use `courseId`, while the current `Module` model uses a different hierarchy.

Affected files:

- `src/data/modules.tsx`
- `src/firebase/progress.tsx`
- `src/models/Module.tsx`

### 4. Enrollment model mismatch

The student dashboard expects enrollment fields that do not exist in the current `Enrollment` model:

- `courseTitle`
- `courseSlug`
- `progress`

Affected files:

- `src/firebase/dashboard.tsx`
- `src/pages/DashboardPage.tsx`
- `src/models/Enrollment.tsx`

### 5. Broken seed imports

`src/firebase/seedCourses.tsx` imports files that do not exist:

- `../data/courses`
- `./courses`

### 6. Course unit details hook mismatch

`CourseUnitDetailsPage.tsx` calls a hook or function with an argument although the current signature accepts none.

## P1 — Launch-critical architecture issues

### Authentication and authorization

`ProtectedRoute` verifies only that a user is signed in. It does not enforce tutor, student, or administrator roles. A signed-in student can currently navigate directly to tutor routes if Firestore rules also permit access.

Required before launch:

- user profile documents with role
- role-aware route guards
- role-aware Firestore rules
- an unauthorized page

### Firestore rules and indexes

The archive does not contain deployable `firestore.rules` or `firestore.indexes.json`. These are required for a real institutional deployment.

### Duplicate and conflicting source-of-truth files

The codebase contains overlapping layers and duplicate concepts:

- `Enrollment.tsx` and `Enrolment.tsx`, where `Enrolment.tsx` actually contains quiz types
- Firebase logic duplicated between hooks and `src/firebase/*`
- top-level UI components and `src/components/ui/*`
- multiple footer and navbar implementations
- `src/config/firebase.tsx`, `src/firebase/firebase.tsx`, and `src/firebase/firestore.tsx`

This increases the risk of drift and inconsistent behavior.

### Tutor analytics data scope

Several tutor pages rely on `useQuizAttempts`, which loads attempts for the current authenticated user. That is suitable for a student history page, but not for tutor-wide submissions, gradebooks, and class analytics.

A separate tutor query layer is required:

- all attempts for tutor-owned quizzes
- attempts by programme, course unit, class, or cohort
- pagination and Firestore indexes

### Student and enrollment identity

Student records use Firestore document IDs, while quiz attempts use Firebase Auth UIDs. These identities must be connected through a canonical field such as `authUid`.

Without this, student profiles, transcripts, gradebooks, and enrollments can fail to join correctly.

## P2 — Quality and maintainability

### Lint failures

Current lint errors include:

- context and component exported from the same Fast Refresh file
- effect patterns flagged in several hooks
- explicit `any` in login and registration pages
- missing dependency in `TakeQuizPage`

### Dependency risk

The installed `xlsx` package has known high-severity prototype-pollution and ReDoS advisories. Replace it with a maintained alternative or isolate export logic using a safer library.

### Firebase configuration

The Firebase web configuration is hard-coded in source. Firebase client configuration is not a private secret, but environment-based configuration is still preferable for multiple environments and safer deployment management.

### Data timestamps

Many models cast Firestore timestamps directly to `Date`. A shared converter is needed to normalize `Timestamp`, `Date`, string, and null values.

## Feature status summary

### Strong foundations

- programme, course unit, module, and lesson management screens
- lesson builder and preview
- question bank and assessment builders
- student quiz-taking flow
- submission, marking, result slip, transcript, and analytics screens
- student registration and directory connected to Firestore

### Partially connected

- student profile and transcript
- tutor gradebook and class analytics
- enrollment management
- student dashboard progress

### Missing or not production-safe

- role-based access control
- Firestore security rules
- canonical data schema
- tutor-wide attempt queries
- edit/archive workflows for student records
- attendance
- notification system
- audit logs
- backup/export strategy

## Recommended implementation order

1. Restore a clean production build.
2. Consolidate core models and remove duplicate definitions.
3. Separate student and tutor attempt queries.
4. Implement user profiles and role-based access control.
5. Add Firestore rules and index configuration.
6. Standardize student identity with `authUid`.
7. Connect enrollment data to the student dashboard and course access.
8. Run end-to-end tests for tutor and student journeys.
9. Replace vulnerable spreadsheet export dependency.
10. Only then add attendance, messaging, and advanced analytics.
