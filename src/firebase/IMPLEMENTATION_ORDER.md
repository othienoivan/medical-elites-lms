# Medical Elites LMS — Implementation Order

## Batch 1: Build Recovery

Files likely requiring coordinated changes:

- `src/models/Quiz.tsx`
- `src/components/lesson/QuizPlayer.tsx`
- `src/data/quizzes.tsx`
- `src/models/Lesson.tsx`
- `src/data/lessons.tsx`
- `src/models/Module.tsx`
- `src/data/modules.tsx`
- `src/models/Enrollment.tsx`
- `src/firebase/dashboard.tsx`
- `src/pages/DashboardPage.tsx`
- `src/firebase/seedCourses.tsx`
- `src/pages/CourseUnitDetailsPage.tsx`

Exit criterion: `npm run build` passes.

## Batch 2: Lint and Runtime Stability

- split `AuthContext` into context and provider files
- revise data-loading hook patterns
- replace explicit `any`
- stabilize quiz submission callback dependencies

Exit criterion: `npm run lint` passes.

## Batch 3: Canonical Data Layer

- one model per entity
- one Firebase repository per entity
- hooks consume repositories rather than duplicating Firestore code
- shared Firestore timestamp conversion
- remove incorrectly named `Enrolment.tsx`

## Batch 4: Identity and Roles

- `users/{uid}` profile model
- roles: administrator, tutor, student
- `authUid` link on students
- role-aware routes
- role-aware dashboards

## Batch 5: Security and Deployment

- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`
- environment-based Firebase configuration
- deployment checklist

## Batch 6: Semester Launch Workflows

Tutor journey:

1. create programme hierarchy
2. register students
3. enroll students
4. create lesson
5. create and publish assessment
6. view submissions
7. mark and release results
8. review gradebook and analytics

Student journey:

1. register/login
2. access assigned programme and lessons
3. take assessment
4. view released results and transcript

Exit criterion: both journeys pass end-to-end testing without manual database editing.
