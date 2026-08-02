# Medical Elites LMS — Run After Update

## Windows PowerShell

```powershell
cd "$HOME\Desktop\medical-elites-lms"

npm config delete proxy
npm config delete https-proxy
npm config set registry https://registry.npmjs.org/

Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm cache verify
npm install

npm run build
npm run lint
npm run dev
```

The project includes a portable `package-lock.json` and a project `.npmrc` configured for the public npm registry.

## Expected result

- `npm install` completes without references to `internal.api.openai.org`.
- `npm run build` completes successfully.
- `npm run lint` completes successfully.
- Vite starts at `http://localhost:5173/`.
