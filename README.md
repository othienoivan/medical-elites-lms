# Medical Elites LMS — HTML5 Upload Type + Storage Patch

This patch completes the HTML5 lesson upload wiring introduced by the v3.1.3 next-release batch.

It updates:

- `LessonBlockRenderer.tsx` — permits `folder="html5"` in the resource upload block.
- `src/firebase/storage.tsx` — adds `html5` to `UploadFolder`, gives HTML uploads a 50 MB limit, recognizes `.html/.htm` as `text/html`, and validates HTML uploads.
- `storage.rules` and `src/firebase/storage.rules` — allow the `html5` upload folder while preserving the mirrored-rules requirement.

After applying, run:

```powershell
npm run typecheck
npm run build
npm test
```

Because Storage Rules are changed, deploy them together with Hosting after validation:

```powershell
firebase deploy --only storage,hosting
```
