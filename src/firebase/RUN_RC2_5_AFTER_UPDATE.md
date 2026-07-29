# Run RC2.5 After Update

From the project root:

```powershell
npm install
npm run lint
npm run typecheck
npm run build
firebase deploy --only firestore:rules
```

Install Google Cloud CLI if `gcloud` is not recognized:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\install-google-cloud-cli.ps1
```

Close and reopen PowerShell, then:

```powershell
gcloud init
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\deploy-office-converter.ps1
```

Process Office files uploaded before deployment:

```powershell
.\scripts\backfill-office-documents.ps1
```
