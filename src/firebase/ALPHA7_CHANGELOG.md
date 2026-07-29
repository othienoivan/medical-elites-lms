# Medical Elites LMS — Alpha 7 Changelog

Version: `1.1.0-alpha.7`

## Code-quality corrections

- Corrected all reported `react-hooks/set-state-in-effect` lint failures in the administrator Programme, Course Unit, Module, Semester, and Tutor pages.
- Initial data loading is now deferred to an asynchronous browser task while retaining the existing reusable reload functions.
- Corrected conditional Hook ordering in `FounderDiagnosticsPage.tsx` by ensuring `useMemo` runs before any authorization return.
- Updated Founder diagnostics version metadata to Alpha 7.

## Development hygiene

- Added Vite watcher exclusions for `.rar`, `.zip`, `.7z`, `.tar`, `.gz`, and backup directories.
- This prevents Windows `EBUSY` crashes caused by archive files stored inside the project directory.
- Updated `package.json` and `package-lock.json` to `1.1.0-alpha.7`.

## Verification

The following commands passed in the reviewed project:

```powershell
npm run lint
npm run typecheck
npm run build
```

The production build completed successfully with 2,258 modules transformed.
