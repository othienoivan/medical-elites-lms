# Lesson Builder Navigation Refactor

## Change

The standalone **Lesson Builder** entry has been removed from the tutor sidebar.

Tutors now open the builder only from **Tutor → Lessons → Open Builder**, ensuring that a valid lesson is selected before the authoring workspace opens.

## Routing safeguard

The legacy route:

`/tutor/lessons/builder`

now redirects to:

`/tutor/lessons`

The contextual builder route remains available:

`/tutor/lessons/:lessonId/builder`

## Dashboard

The direct Lesson Builder shortcut has also been replaced with a link to the Lessons module.
