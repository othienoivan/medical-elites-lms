# RC2.5 Office Conversion Test Checklist

## Local checks

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] Firestore rules deploy successfully

## Infrastructure

- [ ] Google Cloud CLI installed
- [ ] `gcloud init` completed
- [ ] Office converter deployment script completed
- [ ] Cloud Run service health endpoint responds
- [ ] Eventarc trigger exists

## PowerPoint

- [ ] Upload a new `.pptx`
- [ ] Firestore record appears in `officeDocumentPreviews`
- [ ] Status changes from processing to ready
- [ ] Generated PDF appears in `office-previews/`
- [ ] Student opens PDF in the browser
- [ ] Original PowerPoint downloads only after clicking Download PowerPoint

## Word

- [ ] Upload a new `.docx`
- [ ] Conversion reaches ready state
- [ ] Student opens generated PDF
- [ ] Original Word document downloads only after clicking Download Word document

## Backfill

- [ ] Existing `.pptx` and `.docx` files process through the backfill script
