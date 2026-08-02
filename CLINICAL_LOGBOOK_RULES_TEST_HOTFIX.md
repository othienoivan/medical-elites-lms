# Clinical Logbook Firestore Rules Test Hotfix

Removes the `assignedTutorIds is list` expression that breaks the array-contains compatibility regression test.

The replacement checks that the field exists before evaluating membership:

```rules
resource.data.keys().hasAny(['assignedTutorIds'])
&& request.auth.uid in resource.data.assignedTutorIds
```

Both canonical and mirrored Firestore rule files are included and identical.
