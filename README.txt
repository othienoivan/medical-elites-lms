Medical Elites LMS chunk-size fix

Replace these files in the project root:
1. vite.config.ts
2. src/utils/curriculumParser.ts

Then run:
  npm run typecheck
  npm run build

Expected result:
- CurriculumImportPanel becomes much smaller.
- PDF.js is emitted as a separate pdf-viewer chunk.
- Mammoth is emitted as a separate docx-parser chunk.
- PDF and DOCX parsers load only after the user selects that file type.
