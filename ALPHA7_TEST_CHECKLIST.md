# Alpha 7 Test Checklist

## Automated checks

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run build`

## Administrator pages

- [ ] `/admin/programmes` loads and refreshes records.
- [ ] `/admin/course-units` loads and refreshes records.
- [ ] `/admin/modules` loads and refreshes records.
- [ ] `/admin/semesters` loads and refreshes records.
- [ ] `/admin/tutors` loads and activation/deactivation still works.

## Founder diagnostics

- [ ] Founder account can open `/founder/diagnostics`.
- [ ] Non-founder account is denied.
- [ ] Core diagnostics run successfully.
- [ ] Medi diagnostic succeeds.
- [ ] Exported report shows version `1.1.0-alpha.7`.

## Vite development server

- [ ] Place or retain a `.rar` or `.zip` file in the project root.
- [ ] Run `npm run dev`.
- [ ] Confirm Vite no longer crashes with `EBUSY` while watching the archive.

## Regression checks

- [ ] Academic Year activation still enforces one active record.
- [ ] Semester activation still enforces one active semester per academic year.
- [ ] Programme, Course Unit, and Module CRUD remain functional.
