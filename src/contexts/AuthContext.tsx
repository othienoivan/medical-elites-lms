import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

import { auth, db } from "../config/firebase";
import type { AppUser, UserRole } from "../models/User";
import { synchronizeStudentIdentity } from "../firebase/identitySync";
import { AuthContext, type AuthContextValue } from "./auth-context";

type AuthProviderProps = {
  children: ReactNode;
};

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
    requestedRole: isUserRole(data.requestedRole) ? data.requestedRole : undefined,
    institutionId: typeof data.institutionId === "string" ? data.institutionId : undefined,
    institutionName: typeof data.institutionName === "string" ? data.institutionName : undefined,
    linkedTutorIds: Array.isArray(data.linkedTutorIds) ? data.linkedTutorIds.filter((id): id is string => typeof id === "string") : [],
    programmeIds: Array.isArray(data.programmeIds) ? data.programmeIds.filter((id): id is string => typeof id === "string") : [],
    assignedCourseUnitIds: Array.isArray(data.assignedCourseUnitIds) ? data.assignedCourseUnitIds.filter((id): id is string => typeof id === "string") : [],
    academicYear: typeof data.academicYear === "string" ? data.academicYear : undefined,
    yearOfStudy: typeof data.yearOfStudy === "string" ? data.yearOfStudy : undefined,
    semester: typeof data.semester === "string" ? data.semester : undefined,
    studentGroupId: typeof data.studentGroupId === "string" ? data.studentGroupId : undefined,
    onboardingSource: data.onboardingSource,
    registrationLinkId: typeof data.registrationLinkId === "string" ? data.registrationLinkId : undefined,
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
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeProfile?.();
      unsubscribeProfile = null;
      setCurrentUser(user);
      setUserProfile(null);
      setProfileError(null);

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        let profile = await loadUserProfile(user);

        if (profile.role === "student") {
          try {
            await synchronizeStudentIdentity(user.uid, user.email);
            profile = await loadUserProfile(user);
          } catch (identityError) {
            console.error("Failed to synchronize student identity:", identityError);
          }
        }

        setUserProfile(profile);
        setLoading(false);

        // Keep academic access fields current after registration-link claims,
        // tutor assignments and administrative changes. Without this listener,
        // the app retained the pre-claim profile until the next sign-in.
        unsubscribeProfile = onSnapshot(
          doc(db, "users", user.uid),
          async () => {
            try {
              setUserProfile(await loadUserProfile(user));
              setProfileError(null);
            } catch (profileLoadError) {
              console.error("Failed to refresh user profile:", profileLoadError);
            }
          },
          (snapshotError) => {
            console.error("Failed to observe user profile:", snapshotError);
          }
        );
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setProfileError("Your account profile could not be loaded.");
        setLoading(false);
      }
    });

    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, []);

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
