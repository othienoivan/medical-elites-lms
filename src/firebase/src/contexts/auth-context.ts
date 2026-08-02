import { createContext } from "react";
import type { User as FirebaseUser } from "firebase/auth";

import type { AppUser, UserRole } from "../models/User";

export type AuthContextValue = {
  currentUser: FirebaseUser | null;
  userProfile: AppUser | null;
  role: UserRole | null;
  loading: boolean;
  profileError: string | null;
};

export const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  userProfile: null,
  role: null,
  loading: true,
  profileError: null,
});
