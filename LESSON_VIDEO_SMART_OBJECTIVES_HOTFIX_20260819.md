# Lesson Builder Video + SMART Objectives Hotfix — 2026-08-19

## Added
- New `video` lesson block type in the Visual Lesson Builder.
- Tutors can upload HTML5 video files to Firebase Storage using the existing tenant/user storage namespaces and quota reservation flow.
- Supported browser-oriented formats include MP4, WebM, OGV/OGG and MOV where the browser supplies a valid video MIME type.
- Uploaded videos preview directly in the builder and play with native controls in the student Lesson Viewer.
- New **Generate SMART Objectives with AI** action in the Lesson Saving Panel.
- AI reads current lesson content, excludes existing objective blocks from its source context, and proposes 3–5 SMART objectives using measurable Bloom action verbs.
- Generated objectives are inserted into (or replace the first) Objective block for tutor review. They are not silently finalized; the tutor reviews/edits and saves the lesson.
- Uploaded PDF, DOCX, HTML, TXT/CSV/Markdown resources now capture readable text client-side where supported and store it in block metadata for AI lesson context.
- Builder shows an indicator when readable uploaded-resource text is available to AI.

## SMART objective constraints
Each generated objective is prompted to be Specific, Measurable, Achievable, Relevant and Time-bound to completion of the lesson, and to begin with: “By the end of this lesson, the learner will be able to…”

## Deployment
Frontend/source changes only. Run the normal root dependency install, typecheck/build and Firebase Hosting deployment. No new Cloud Function is required because the existing authenticated `medicalElitesAi` callable is reused.

## Validation note
This packaged environment does not contain root `node_modules`, so local TypeScript validation stops at missing `vite/client` and `node` type definitions before project checking. Run `npm ci`, `npm run typecheck`, and `npm run build` on the deployment machine before Firebase deployment.
