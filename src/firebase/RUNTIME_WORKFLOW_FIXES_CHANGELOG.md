# Runtime Workflow Fixes

## Fixed
- Added working tutor routes for assessment details and assessment editing.
- Added working tutor routes for examination preview and examination editing.
- Quiz Builder now loads and updates an existing quiz when opened with `:quizId`.
- Examination Builder now loads and updates an existing examination when opened with `:examId`.
- Student dashboard now excludes already submitted assessments from Available/Upcoming lists.
- Submission Inbox now shows `Marked` after result release and changes the action to `Remark`.
- Needs Review count now excludes already marked/released submissions.
- PowerPoint loading now tries Firebase Storage SDK bytes first, then direct download as fallback.
- PowerPoint preview errors now expose the underlying reason for easier diagnosis.
- Buttons now have a clearer hover lift and shadow state.

## Verification
- `npm run lint` passes.
- `npm run build` passes.
