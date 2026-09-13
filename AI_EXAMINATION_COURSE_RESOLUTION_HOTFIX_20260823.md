# AI Examination Course Unit Resolution Hotfix — 2026-08-23

## Problem
`createAiExaminationQuestionsTrusted` returned `Course Unit not found` even when the Course Unit was visible in the Professional Examination Builder.

## Root cause
The frontend Course Unit catalogue is backed by the canonical Firestore `courses` collection, while the trusted callable incorrectly queried `courseUnits/{courseUnitId}`.

## Fix
- Resolve the selected Course Unit from `courses/{id}` first.
- Fall back to legacy `courseId` and stored `id` aliases.
- Preserve tutor/admin authorization checks.
- Save AI-generated Professional Medical Question Bank records against the resolved canonical `courses` document ID.

## Deployment
Run the normal Functions and frontend build, then deploy Hosting + Functions.
