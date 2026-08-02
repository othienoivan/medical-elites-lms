# V1 Student Self-Read Registration Link Hotfix

## Problem
Registration-link claiming failed with `Missing or insufficient permissions` while reading `students/{authenticatedStudentUid}` inside the Firestore transaction.

## Root cause
The student read rule depended only on fields in `resource.data`. When the canonical student document did not yet exist, `resource.data` was unavailable and the preliminary transaction read was denied before the transaction could create the document.

## Fix
The `students/{studentId}` read rule now permits an authenticated user to read the canonical path where `studentId == request.auth.uid`. This permits existence checks for the learner's own record while preserving all existing ownership, tutor, and administrator access controls.

Students still cannot read another learner's canonical document through this condition.
