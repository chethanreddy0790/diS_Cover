import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import {
  AuthCredentials,
  AuthSession,
  ProfileSetupInput,
  StudentProfile,
} from "../types";
import { isStrongEnoughPassword, isCollegeEmail } from "../utils/validation";
import { auth, db, isFirebaseConfigured } from "./firebase";
import { mutateMockDb, readMockDb, simulateLatency } from "./mockDb";
import { createId, resolveCollegeFromEmail } from "./serviceUtils";

const assertAllowedEmail = (email: string) => {
  if (!isCollegeEmail(email)) {
    throw new Error("Use a verified college email address ending in .edu.");
  }
};

const getFirebaseProfile = async (userId: string) => {
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, "users", userId));
  return snapshot.exists() ? (snapshot.data() as StudentProfile) : null;
};

const waitForFirebaseUser = async () =>
  new Promise<{ uid: string; email: string | null } | null>((resolve) => {
    if (!auth) {
      resolve(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user ? { uid: user.uid, email: user.email } : null);
    });
  });

export const getCurrentSession = async (): Promise<{
  session: AuthSession | null;
  profile: StudentProfile | null;
}> => {
  if (isFirebaseConfigured) {
    const user = await waitForFirebaseUser();
    if (!user) {
      return { session: null, profile: null };
    }

    const profile = await getFirebaseProfile(user.uid);
    return {
      session: {
        id: user.uid,
        email: user.email ?? "",
        profileCompleted: profile?.profileCompleted ?? false,
      },
      profile,
    };
  }

  await simulateLatency();
  const mockDb = await readMockDb();
  if (!mockDb.sessionUserId) {
    return { session: null, profile: null };
  }

  const profile = mockDb.profiles.find((item) => item.id === mockDb.sessionUserId) ?? null;
  if (!profile) {
    return { session: null, profile: null };
  }

  return {
    session: {
      id: profile.id,
      email: profile.email,
      profileCompleted: profile.profileCompleted,
    },
    profile,
  };
};

export const signIn = async (credentials: AuthCredentials) => {
  assertAllowedEmail(credentials.email);

  if (isFirebaseConfigured) {
    if (!auth) {
      throw new Error("Firebase Auth is not available.");
    }
    if (!db) {
      throw new Error("Firestore is not available.");
    }

    const result = await signInWithEmailAndPassword(
      auth,
      credentials.email.trim().toLowerCase(),
      credentials.password,
    );
    
    let profile: StudentProfile | null = null;
    
    try {
      const snapshot = await getDoc(doc(db, "users", result.user.uid));
      
      if (snapshot.exists()) {
        profile = snapshot.data() as StudentProfile;
      } else {
        const email = result.user.email ?? credentials.email.trim().toLowerCase();
        const resolvedCollege = resolveCollegeFromEmail([], email);
        
        profile = {
          id: result.user.uid,
          email,
          name: "",
          collegeId: resolvedCollege.id,
          collegeName: resolvedCollege.name,
          bio: "",
          headline: "",
          avatarUrl: null,
          graduationYear: null,
          followers: [],
          followingStudents: [],
          followingColleges: [resolvedCollege.id],
          profileCompleted: false,
        };
        
        await setDoc(doc(db, "users", result.user.uid), profile);
      }
    } catch (error) {
      console.warn("Firestore error fetching/creating profile:", error);
      const email = result.user.email ?? credentials.email.trim().toLowerCase();
      profile = {
        id: result.user.uid,
        email,
        name: "",
        collegeId: "",
        collegeName: "",
        bio: "",
        headline: "",
        avatarUrl: null,
        graduationYear: null,
        followers: [],
        followingStudents: [],
        followingColleges: [],
        profileCompleted: false,
      };
    }

    return {
      session: {
        id: result.user.uid,
        email: result.user.email ?? credentials.email,
        profileCompleted: profile.profileCompleted,
      },
      profile,
    };
  }

  await simulateLatency();
  const { result } = await mutateMockDb(async (mockDb) => {
    const email = credentials.email.trim().toLowerCase();
    const password = mockDb.credentials[email];
    if (!password || password !== credentials.password) {
      throw new Error("Invalid email or password.");
    }

    const profile = mockDb.profiles.find((item) => item.email === email);
    if (!profile) {
      throw new Error("We could not find a profile for this account.");
    }

    mockDb.sessionUserId = profile.id;

    return {
      session: {
        id: profile.id,
        email: profile.email,
        profileCompleted: profile.profileCompleted,
      },
      profile,
    };
  });

  return result;
};

export const signUp = async (credentials: AuthCredentials) => {
  assertAllowedEmail(credentials.email);

  if (!isStrongEnoughPassword(credentials.password)) {
    throw new Error("Use at least 8 characters for your password.");
  }

  if (isFirebaseConfigured) {
    if (!auth || !db) {
      throw new Error("Firebase is not available.");
    }

    const created = await createUserWithEmailAndPassword(
      auth,
      credentials.email.trim().toLowerCase(),
      credentials.password,
    );
    const email = created.user.email ?? credentials.email.trim().toLowerCase();
    const resolvedCollege = resolveCollegeFromEmail([], email);
    const placeholderProfile: StudentProfile = {
      id: created.user.uid,
      email,
      name: "",
      collegeId: resolvedCollege.id,
      collegeName: resolvedCollege.name,
      bio: "",
      headline: "",
      avatarUrl: null,
      graduationYear: null,
      followers: [],
      followingStudents: [],
      followingColleges: [resolvedCollege.id],
      profileCompleted: false,
    };

    await setDoc(doc(db, "users", created.user.uid), placeholderProfile);

    return {
      session: {
        id: created.user.uid,
        email,
        profileCompleted: false,
      },
      profile: placeholderProfile,
    };
  }

  await simulateLatency();
  const { result } = await mutateMockDb(async (mockDb) => {
    const email = credentials.email.trim().toLowerCase();
    if (mockDb.credentials[email]) {
      throw new Error("An account with this college email already exists.");
    }

    const college = resolveCollegeFromEmail(mockDb.colleges, email);
    if (!mockDb.colleges.some((item) => item.id === college.id)) {
      mockDb.colleges.unshift(college);
    }

    const newProfile: StudentProfile = {
      id: createId("student"),
      email,
      name: "",
      collegeId: college.id,
      collegeName: college.name,
      avatarUrl: null,
      bio: "",
      headline: "",
      graduationYear: null,
      followers: [],
      followingStudents: [],
      followingColleges: [college.id],
      profileCompleted: false,
    };

    mockDb.credentials[email] = credentials.password;
    mockDb.profiles.unshift(newProfile);
    mockDb.sessionUserId = newProfile.id;

    return {
      session: {
        id: newProfile.id,
        email,
        profileCompleted: false,
      },
      profile: newProfile,
    };
  });

  return result;
};

export const completeProfile = async (
  userId: string,
  email: string,
  input: ProfileSetupInput,
) => {
  if (isFirebaseConfigured) {
    if (!db || !auth) {
      throw new Error("Firebase is not available.");
    }

    const current = await getFirebaseProfile(userId);
    const selectedCollege = await getDoc(doc(db, "colleges", input.collegeId));
    const collegeName =
      (selectedCollege.exists() ? (selectedCollege.data() as { name?: string }).name : undefined) ??
      current?.collegeName ??
      input.collegeId;

    const merged: StudentProfile = {
      id: userId,
      email,
      name: input.name.trim(),
      collegeId: input.collegeId,
      collegeName,
      bio: input.bio.trim(),
      headline: input.headline.trim(),
      avatarUrl: input.avatarUrl ?? current?.avatarUrl,
      graduationYear: input.graduationYear ?? null,
      followers: current?.followers ?? [],
      followingStudents: current?.followingStudents ?? [],
      followingColleges: Array.from(
        new Set([...(current?.followingColleges ?? []), input.collegeId]),
      ),
      profileCompleted: true,
    };

    await setDoc(doc(db, "users", userId), merged, { merge: true });
    if (auth.currentUser) {
      await updateFirebaseProfile(auth.currentUser, {
        displayName: merged.name,
        photoURL: merged.avatarUrl,
      });
    }

    return merged;
  }

  await simulateLatency();
  const { result } = await mutateMockDb(async (mockDb) => {
    const college = mockDb.colleges.find((item) => item.id === input.collegeId);
    const profile = mockDb.profiles.find((item) => item.id === userId);
    if (!profile) {
      throw new Error("We could not finish setting up this profile.");
    }

    profile.name = input.name.trim();
    profile.bio = input.bio.trim();
    profile.headline = input.headline.trim();
    profile.avatarUrl = input.avatarUrl ?? profile.avatarUrl;
    profile.collegeId = input.collegeId;
    profile.collegeName = college?.name ?? profile.collegeName;
    profile.graduationYear = input.graduationYear ?? null;
    profile.profileCompleted = true;
    profile.followingColleges = Array.from(
      new Set([...profile.followingColleges, input.collegeId]),
    );

    return profile;
  });

  return result;
};

export const signOut = async () => {
  if (isFirebaseConfigured) {
    if (!auth) {
      return;
    }

    await firebaseSignOut(auth);
    return;
  }

  await simulateLatency();
  await mutateMockDb((mockDb) => {
    mockDb.sessionUserId = null;
  });
};
