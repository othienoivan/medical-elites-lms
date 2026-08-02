# RC2 PowerPoint Rendering Hotfix

## Problem
PowerPoint previews timed out after 30 seconds even when the presentation URL was valid.

## Root cause
The viewer attempted Firebase SDK `getBytes(ref(storage, url))` first, including when `url` was already a full Firebase HTTPS download URL. Full download URLs are not storage paths and can resolve incorrectly or stall. The 30-second timeout was also too short for large presentations or slower connections.

## Changes
- Fetch HTTPS download URLs directly before using the Firebase SDK.
- Added streamed download progress where `content-length` is available.
- Increased the download timeout to 180 seconds.
- Increased the render timeout to 120 seconds.
- Added a 120 MB browser-rendering safety limit.
- Added abort handling when navigating away or retrying.
- Preserved explicit-download-only behaviour; opening the lesson never triggers an automatic download.
- Improved errors so access, file-size and renderer failures are easier to distinguish.

## Firebase changes
None.
