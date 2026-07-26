# Clean Firebase Functions Package

## Fixed

- Removed the package lock that referenced the private OpenAI build registry.
- Added a local `.npmrc` pinned to `https://registry.npmjs.org/`.
- Split the AI backend into typed access, validation, prompt, provider, and function modules.
- Added an explicitly typed callable request to eliminate the implicit `any` error.
- Kept the Firebase deployment runtime on Node.js 20.
- Added a PowerShell cleanup/install script for Windows.
- Added request validation, tutor-role authorization, usage logging, bounded output, and provider-safe errors.

## Important

The patch intentionally does not contain `functions/package-lock.json`. Run `CLEAN_FUNCTIONS_INSTALL.ps1` once to generate a clean lockfile on your computer from the public npm registry.
