import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  setDoc,
} from "firebase/firestore";

import { College, SearchResult, StudentProfile } from "../types";
import { db, isFirebaseConfigured } from "./firebase";
import { mutateMockDb, readMockDb, simulateLatency } from "./mockDb";

export const fetchColleges = async (): Promise<College[]> => {
  if (isFirebaseConfigured) {
    if (!db) {
      throw new Error("Firebase is not available.");
    }

    const snapshot = await getDocs(collection(db, "colleges"));
    return snapshot.docs.map((item) => item.data() as College);
  }

  await simulateLatency();
  const mockDb = await readMockDb();
  return [...mockDb.colleges].sort((left, right) => left.name.localeCompare(right.name));
};

export const searchDirectory = async (
  query: string,
  currentUserId: string,
): Promise<SearchResult> => {
  const normalized = query.trim().toLowerCase();

  if (isFirebaseConfigured) {
    if (!db) {
      throw new Error("Firebase is not available.");
    }

    const [profilesSnapshot, collegesSnapshot] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "colleges")),
    ]);

    const students = profilesSnapshot.docs
      .map((item) => item.data() as StudentProfile)
      .filter(
        (profile) =>
          profile.id !== currentUserId &&
          (!normalized ||
            profile.name.toLowerCase().includes(normalized) ||
            profile.headline.toLowerCase().includes(normalized)),
      );

    const colleges = collegesSnapshot.docs
      .map((item) => item.data() as College)
      .filter(
        (college) =>
          !normalized ||
          college.name.toLowerCase().includes(normalized) ||
          college.city.toLowerCase().includes(normalized),
      );

    return { students, colleges };
  }

  await simulateLatency();
  const mockDb = await readMockDb();
  return {
    students: mockDb.profiles.filter(
      (profile) =>
        profile.id !== currentUserId &&
        (!normalized ||
          profile.name.toLowerCase().includes(normalized) ||
          profile.headline.toLowerCase().includes(normalized) ||
          profile.collegeName.toLowerCase().includes(normalized)),
    ),
    colleges: mockDb.colleges.filter(
      (college) =>
        !normalized ||
        college.name.toLowerCase().includes(normalized) ||
        college.city.toLowerCase().includes(normalized),
    ),
  };
};

export const toggleFollowStudent = async (currentUserId: string, targetUserId: string) => {
  if (isFirebaseConfigured) {
    if (!db) {
      throw new Error("Firebase is not available.");
    }

    const currentDoc = doc(db, "users", currentUserId);
    const targetDoc = doc(db, "users", targetUserId);
    const currentSnapshot = await getDoc(currentDoc);
    const currentProfile = currentSnapshot.data() as StudentProfile | undefined;
    const isFollowing = currentProfile?.followingStudents.includes(targetUserId);

    await Promise.all([
      setDoc(currentDoc, {
        followingStudents: isFollowing
          ? arrayRemove(targetUserId)
          : arrayUnion(targetUserId),
      }, { merge: true }),
      setDoc(targetDoc, {
        followers: isFollowing ? arrayRemove(currentUserId) : arrayUnion(currentUserId),
      }, { merge: true }),
    ]);

    return !isFollowing;
  }

  await simulateLatency();
  const { result } = await mutateMockDb((mockDb) => {
    const current = mockDb.profiles.find((profile) => profile.id === currentUserId);
    const target = mockDb.profiles.find((profile) => profile.id === targetUserId);
    if (!current || !target) {
      throw new Error("We could not update the follow state.");
    }

    const isFollowing = current.followingStudents.includes(targetUserId);

    current.followingStudents = isFollowing
      ? current.followingStudents.filter((id) => id !== targetUserId)
      : [...current.followingStudents, targetUserId];

    target.followers = isFollowing
      ? target.followers.filter((id) => id !== currentUserId)
      : [...target.followers, currentUserId];

    return !isFollowing;
  });

  return result;
};

export const toggleFollowCollege = async (currentUserId: string, collegeId: string) => {
  if (isFirebaseConfigured) {
    if (!db) {
      throw new Error("Firebase is not available.");
    }

    const currentDoc = doc(db, "users", currentUserId);
    const currentSnapshot = await getDoc(currentDoc);
    const currentProfile = currentSnapshot.data() as StudentProfile | undefined;
    const isFollowing = currentProfile?.followingColleges.includes(collegeId);

    await Promise.all([
      setDoc(currentDoc, {
        followingColleges: isFollowing ? arrayRemove(collegeId) : arrayUnion(collegeId),
      }, { merge: true }),
      setDoc(doc(db, "colleges", collegeId), {
        followers: increment(isFollowing ? -1 : 1),
      }, { merge: true }),
    ]);

    return !isFollowing;
  }

  await simulateLatency();
  const { result } = await mutateMockDb((mockDb) => {
    const current = mockDb.profiles.find((profile) => profile.id === currentUserId);
    const college = mockDb.colleges.find((item) => item.id === collegeId);
    if (!current || !college) {
      throw new Error("We could not update the college follow.");
    }

    const isFollowing = current.followingColleges.includes(collegeId);
    current.followingColleges = isFollowing
      ? current.followingColleges.filter((id) => id !== collegeId)
      : [...current.followingColleges, collegeId];
    college.followers += isFollowing ? -1 : 1;

    return !isFollowing;
  });

  return result;
};
