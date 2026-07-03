import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";

import { auth } from "../config/firebase";

type AuthContextValue = {
  currentUser: FirebaseUser | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  loading: true,
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] =
    useState<FirebaseUser | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}