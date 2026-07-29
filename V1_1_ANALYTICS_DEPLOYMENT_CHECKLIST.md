# V1.1 Analytics Deployment Checklist

1. Copy production Firebase values into `.env.local`.
2. Run `npm install`.
3. Run `npm run release:check`.
4. Deploy rules, indexes and hosting:
   `firebase deploy --only firestore:rules,firestore:indexes,hosting`
5. Sign in as student, tutor and administrator and open `/analytics`.
6. Confirm institution isolation and that no browser user can write `analyticsSnapshots`.
7. Monitor the Firebase index console until new indexes report Ready.
