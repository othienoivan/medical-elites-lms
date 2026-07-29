# RC3.2.2 Firebase Function Discovery Timeout Hotfix

## Cause
The Firebase CLI loads the compiled Functions bundle to discover exported functions before deployment. Importing the OpenAI SDK at module startup can make that discovery step exceed the CLI's default 10-second limit on some Windows/Node installations.

## Fix
- Removed the top-level OpenAI SDK import.
- OpenAI is now imported lazily only when an authenticated AI request actually runs.
- This keeps deployment discovery lightweight and preserves runtime behavior.

## Deployment
Use Node.js 20 for the Functions package, rebuild, then deploy. If the local CLI is still slow, temporarily set `FUNCTIONS_DISCOVERY_TIMEOUT=60` for the deployment command.
