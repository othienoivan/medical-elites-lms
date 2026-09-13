# v3.2.5 Document Download & Course Content Gating

- Removes Word/Office browser preview from lesson delivery. Word files are download-only using the trusted lesson-resource URL resolver.
- Canonicalizes public course-unit route resolution before module loading.
- Strictly filters modules by the active course-unit ID/legacy alias so modules from another course unit cannot leak into the page.
- Learners without assigned, purchased or elevated access see Buy Course Unit and Subscribe actions instead of open module content.
- Matching published marketplace course products link directly to the product purchase page.
