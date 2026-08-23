# Manual AI Approval Hotfix — 16 August 2026

## Purpose
Automatic AI approval has been disabled for marketplace course-unit submissions. AI is advisory only; a human reviewer must make the final publication decision.

## Implemented
- Removed the AI Auto Approve control and backend auto-publish path.
- Every AI review moves the product to the manual review queue (`review`) and never publishes it.
- Added server-side `decideMarketplaceProductApproval` callable for controlled review actions.
- Added Start Manual Review, Approve & Publish, and Reject actions to Platform Marketplace Operations.
- Added AI recommendation, score, reason, structural eligibility and AI-flagged indicators to the moderation UI.
- Human reviewers may override an AI recommendation. A reason is mandatory when rejecting or overriding AI.
- Course-unit approval cannot override the deterministic minimum publication requirements: real thumbnail, at least one active module and at least one active lesson.
- Final Approve/Reject is restricted to Super Admin and Platform Admin. Platform Support may run AI review/start manual review but cannot issue the final decision. Platform Finance is excluded from academic approval.
- Added `rejected` marketplace product status.
- Added latest human decision metadata on the product: reviewer UID/name, timestamp, reason, decision and whether AI was overridden.
- Added immutable server-written `marketplaceApprovalAudits` records for AI reviews and human decisions.
- Firestore client rules prevent direct client transitions to `published` or `rejected`; final decisions must use the trusted callable workflow.

## Validation
- `functions`: `npm run build` — PASS
- Generated `functions/lib/index.js`: `node --check` — PASS
- Root frontend dependencies are intentionally not bundled in the source archive, so run the established local deployment sequence after extracting the batch.

## Deployment sequence
1. Root: `npm ci`
2. `cd functions` then `npm ci`
3. Functions: `npm run build`
4. Root: `npm run typecheck`
5. Root: `npm run build`
6. `firebase deploy --only hosting,functions,firestore:rules --dry-run`
7. `firebase deploy --only hosting,functions,firestore:rules`

## Acceptance test
1. Submit a marketplace course unit.
2. Confirm it is not automatically published.
3. Platform reviewer runs AI Review; product stays in `review` regardless of AI recommendation.
4. Confirm AI recommendation/reason and any flag are visible.
5. Enter reviewer note and click Approve & Publish; eligible content publishes only through the manual callable.
6. For an AI `reject`/`manual_review` recommendation, approve with a reason and confirm `AI overridden` appears.
7. Reject another item with a reason and confirm status becomes `rejected`.
8. Confirm latest human reviewer, decision source, reason and decision time are shown.
9. Confirm an audit record exists in `marketplaceApprovalAudits` for both AI and human actions.
