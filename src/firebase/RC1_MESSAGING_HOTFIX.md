# RC1 Messaging Permissions Hotfix

## Cause
Messages were written successfully, but the subsequent conversation refresh queried messages by `conversationId`. The previous Firestore rule authorized reads by `senderUid`/`recipientUid`, which did not match the query shape and caused `Missing or insufficient permissions` after the write.

## Fix
- Message reads now authorize through the parent conversation's `participantUids`.
- Message creates verify both sender and recipient belong to the referenced conversation.
- Read-status updates remain restricted to `readByUids`.
- The UI no longer reports a sent message as failed when only the post-send refresh fails.
