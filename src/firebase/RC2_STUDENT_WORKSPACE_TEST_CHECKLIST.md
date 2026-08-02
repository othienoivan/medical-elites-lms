# RC2 Student Workspace and Resource Viewer Test Checklist

## Student layout
- Log in as a student and open `/dashboard`.
- Confirm the desktop sidebar appears at large widths.
- Confirm the mobile menu opens and closes.
- Test Dashboard, My Courses, Assessments, History, Timetable, Attendance, Clinical Logbook, Finance, Messages, Notifications and Medi links.
- Confirm Messages and Notifications appear in the shared header.
- Confirm Logout returns to `/login`.
- Confirm focused quiz-taking mode does not show the sidebar.

## PPTX viewer
- Open a lesson containing a `.pptx` block.
- Confirm no download begins automatically.
- Confirm the presentation renders in the page.
- Test its slide controls, Fullscreen, Try Again and explicit Download PowerPoint.
- Test a large presentation and a presentation containing images and tables.

## PDF and DOCX
- Confirm PDFs open inside the embedded viewer.
- Confirm DOCX files open inside the embedded Office viewer when the Firebase URL is publicly reachable.
- Confirm neither file downloads automatically.
- Confirm Download works only after the user clicks it.

## Quality
- Run `npm run lint`.
- Run `npm run typecheck`.
- Run `npm run build`.
