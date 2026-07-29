import { FirebaseError } from "firebase/app";

const messages: Record<string, string> = {
  "auth/email-already-in-use": "An account already exists with this email address.",
  "auth/invalid-credential": "Invalid email address or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/network-request-failed": "Network connection failed. Check your internet connection and try again.",
  "auth/operation-not-allowed": "This sign-in method is not enabled.",
  "auth/too-many-requests": "Too many attempts. Wait briefly and try again.",
  "auth/user-disabled": "This account has been disabled. Contact an administrator.",
  "auth/user-not-found": "No account was found with those details.",
  "auth/weak-password": "Use a stronger password with at least six characters.",
  "auth/wrong-password": "Incorrect password.",
  "permission-denied": "You do not have permission to perform this action.",
  unavailable: "The service is temporarily unavailable. Try again shortly.",
};

export function getFirebaseErrorMessage(
  error: unknown,
  fallback = "The operation could not be completed. Please try again."
): string {
  if (error instanceof FirebaseError) {
    return messages[error.code] || fallback;
  }

  if (error instanceof Error && import.meta.env.DEV) {
    return error.message || fallback;
  }

  return fallback;
}
