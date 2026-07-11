import {
<<<<<<< HEAD
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
=======
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
import {
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
<<<<<<< HEAD
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../config/firebase";
import type { AppUser, UserRole } from "../models/User";
import { synchronizeStudentIdentity } from "../firebase/identitySync";
import { AuthContext, type AuthContextValue } from "./auth-context";
=======

import { auth } from "../config/firebase";

type AuthContextValue = {
  currentUser: FirebaseUser | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  loading: true,
});
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d

type AuthProviderProps = {
  children: ReactNode;
};

<<<<<<< HEAD
function isUserRole(value: unknown): value is UserRole {
  return value === "student" || value === "tutor" || value === "admin";
}

async function loadUserProfile(user: FirebaseUser): Promise<AppUser> {
  const profileSnapshot = await getDoc(doc(db, "users", user.uid));

  if (!profileSnapshot.exists()) {
    return {
      uid: user.uid,
      fullName: user.displayName || user.email || "User",
      email: user.email || "",
      role: "student",
      profilePhoto: user.photoURL || "",
      enrolledCourses: [],
      isActive: true,
      createdAt: null,
      updatedAt: null,
    };
  }

  const data = profileSnapshot.data();

  return {
    uid: user.uid,
    fullName:
      typeof data.fullName === "string" && data.fullName.trim()
        ? data.fullName
        : user.displayName || user.email || "User",
    email:
      typeof data.email === "string" ? data.email : user.email || "",
    role: isUserRole(data.role) ? data.role : "student",
    profilePhoto:
      typeof data.profilePhoto === "string" ? data.profilePhoto : "",
    enrolledCourses: Array.isArray(data.enrolledCourses)
      ? data.enrolledCourses.filter(
          (courseId): courseId is string => typeof courseId === "string"
        )
      : [],
    isActive: data.isActive !== false,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(
    auth.currentUser
  );
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setUserProfile(null);
      setProfileError(null);

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const profile = await loadUserProfile(user);

        if (profile.role === "student") {
          try {
            await synchronizeStudentIdentity(user.uid, user.email);
          } catch (identityError) {
            console.error("Failed to synchronize student identity:", identityError);
          }
        }

        setUserProfile(profile);
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setProfileError("Your account profile could not be loaded.");
      } finally {
        setLoading(false);
      }
=======
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] =
    useState<FirebaseUser | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
    });

    return unsubscribe;
  }, []);

<<<<<<< HEAD
  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      userProfile,
      role: userProfile?.role ?? null,
      loading,
      profileError,
    }),
    [currentUser, userProfile, loading, profileError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
=======
  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
