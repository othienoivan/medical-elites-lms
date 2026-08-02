# V1 Programme Visibility and Redirect Hotfix

## Symptoms fixed
- Clicking Create Programme redirected to the tutor dashboard.
- The newly created programme did not appear in the programme list.

## Root causes
1. Programme creation used two Firestore writes: create the document, then update it with its generated ID.
2. The programme loader executed three ownership queries with `Promise.all`; one denied legacy query caused the entire programme list to be cleared.
3. Firestore ownership helpers accessed optional legacy fields without first checking whether those fields existed.

## Changes
- Programme creation now uses one atomic `setDoc` write with a pre-generated document ID.
- Successful creation redirects directly to `/tutor/programmes`.
- Ownership queries use `Promise.allSettled`, preserving successful query results.
- Firestore `ownsRecord` and `assignedTutor` helpers safely check optional fields.

## Deployment
Deploy the web application and Firestore rules:

```bash
firebase deploy --only hosting,firestore:rules
```

Then sign out and sign in before retesting.
