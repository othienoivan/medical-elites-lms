Medical Elites LMS - Student Lesson Permissions Fix

Replace these files in the project:
1. src/firebase/lessons.tsx
2. src/firebase/firestore.rules
3. firestore.rules

Then run:
npm install
npm run release:check
firebase deploy --only firestore:rules,hosting

Important: deploying hosting alone will NOT apply this fix. Firestore rules must be deployed.
