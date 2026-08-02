# Medical Elites LMS — Professional Question Bank Core Upgrade

## Implemented

- Edit existing questions through `/tutor/questions/:questionId/edit`.
- Soft-delete questions instead of permanently removing them.
- Duplicate questions as unpublished drafts.
- Curriculum metadata retained: programme, course unit, module, topic and subtopic.
- Classification retained: question type, difficulty and Bloom level.
- Added estimated completion time and publication status.
- Added professional filtering by search, type, difficulty, Bloom level and publication status.
- Added CSV and JSON bulk import for up to 400 questions per batch.
- Added active, published and draft statistics.
- Existing Firestore ownership and institution access rules remain in force.

## CSV import format

Required columns:

- `questionText`
- `topic`
- `correctAnswer`

Supported optional columns:

- `subtopic`
- `type`: mcq, true-false, short-answer, essay, emq
- `difficulty`: easy, medium, hard
- `bloomLevel`: remember, understand, apply, analyze, evaluate, create
- `explanation`
- `marks`
- `estimatedTimeMinutes`
- `options` — separate options using `|`
- `tags` — separate tags using `|`
- `isPublished`
- `programmeId`, `programmeTitle`
- `courseUnitId`, `courseUnitTitle`
- `moduleId`, `moduleTitle`

Example:

```csv
questionText,topic,type,difficulty,bloomLevel,correctAnswer,explanation,marks,options,tags,isPublished
"Which drug is first-line for uncomplicated malaria?",Malaria,mcq,medium,apply,A,"ACT is recommended.",1,"Artemether-lumefantrine|Quinine|Doxycycline|Chloroquine","malaria|pharmacology",true
```

## Validation

- TypeScript project build passed.
- Vite production build passed.
