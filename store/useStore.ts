import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { auth, db } from '../services/firebase';
import { safeFirestoreCall } from '../utils/firestoreUtils';
import { isCollegeEmail } from '../utils/validation';

const requireAuth = () => {
  if (!auth) {
    throw new Error("Firebase Auth not initialized");
  }

  return auth;
};

const requireDb = () => {
  if (!db) {
    throw new Error("Firebase Firestore not initialized");
  }

  return db;
};
// ── Shared Types (consumed by domain stores) ──────────────────────

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface User {
  id: string;
  fullName?: string;
  username: string;
  email: string;
  phoneNumber?: string;
  collegeName: string;
  designation: string;
  bio: string;
  interests: string[];
  savedEvents: string[]; // Array of event IDs
  savedGigs: string[];
  image?: string;
  expoPushToken?: string;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userRole: string;
  media: string;
  caption: string;
  createdAt: string;
  expiresAt: string;
  viewerIds: string[]; // User IDs who watched this story
  imageAspectRatio?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  deadline: string;
  venue: string;
  image: string;
  imageAspectRatio?: number;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  organizerId?: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  tags: string[];
  rules: string[];
  registrationLink?: string;
}

export interface GigConversationMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  imageUrl?: string;
  type: 'text' | 'image';
  createdAt: string;
  readBy: string[]; // User IDs who have read this message
}

export interface GigConversation {
  id: string;
  gigId: string;
  gigTitle: string;
  sellerName: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  sellerRole?: string;
  sellerRating?: string;
  participants: string[];
  hiddenFor?: string[]; // User IDs who have hidden this chat
  deletedAtBy?: { [userId: string]: any }; // Timestamps of when each user deleted the chat
  lastMessage: string;
  typing?: { [userId: string]: boolean };
  updatedAt: any;
  createdAt: any;
}

// ── Store Interface ───────────────────────────────────────────────

interface StoreState {
  currentUser: User | null;
  isLoggedIn: boolean;
  registeredUsers: User[];
  partialSignupData: Partial<User & { password?: string }> | null;
  hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;

  // Auth
  signupStepOne: (userData: Pick<User, 'username' | 'email' | 'collegeName' | 'designation'> & { password?: string }) => { success: boolean, error?: string };
  completeSignup: (interests: string[]) => Promise<{ success: boolean, error?: string }>;
  localLogin: (userData: Pick<User, 'email'> & { password?: string }) => Promise<{ success: boolean, error?: string }>;
  logout: () => Promise<void>;
  initSession: () => Promise<void>;
  registerPushToken: (token: string) => Promise<void>;

  // Profile
  updateBio: (bio: string) => void;
  updatePersonalInfo: (updates: Pick<User, 'username' | 'collegeName'> & Partial<Pick<User, 'fullName' | 'phoneNumber' | 'image'>>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean, error?: string }>;
  updateProfileImage: (imageUri: string) => void;
  toggleSaveEvent: (eventId: string) => void;
  toggleSaveGig: (gigId: string) => void;
  syncGoogleUser: (firebaseUser: any) => Promise<{ success: boolean; error?: string }>;
  getUserProfile: (userId: string) => Promise<User | null>;
}

// ── Store ─────────────────────────────────────────────────────────

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isLoggedIn: false,
      registeredUsers: [],
      partialSignupData: null,
      hasHydrated: false,

      setHasHydrated: (val) => set({ hasHydrated: val }),

      initSession: async () => {
        // hasHydrated is now set by onRehydrateStorage automatically.
        // This is kept as a safety fallback for cold starts where storage is empty.
        set({ hasHydrated: true });
      },

      signupStepOne: (userData) => {
        // Firebase handles email duplication errors during creation
        set({ partialSignupData: userData });
        return { success: true };
      },

      completeSignup: async (interests) => {
        const { partialSignupData } = get();
        if (!partialSignupData) return { success: false, error: 'No signup data found' };

        if (!partialSignupData.password) {
          return { success: false, error: 'Your session expired. Please start the signup again.' };
        }

        if (!partialSignupData.email || !isCollegeEmail(partialSignupData.email)) {
          return { success: false, error: 'Please use a verified college email address.' };
        }

        try {
          const firebaseAuth = requireAuth();
          const firestore = requireDb();
          let firebaseUser = firebaseAuth.currentUser;

          if (!firebaseUser || firebaseUser.email !== partialSignupData.email) {
            try {
              const userCredential = await createUserWithEmailAndPassword(
                firebaseAuth,
                partialSignupData.email!,
                partialSignupData.password!
              );
              firebaseUser = userCredential.user;
            } catch (createError: any) {
              if (createError.code === 'auth/email-already-in-use') {
                // Try to log them in if the account was created on a previous tap
                try {
                  const signInCredential = await signInWithEmailAndPassword(
                    firebaseAuth,
                    partialSignupData.email!,
                    partialSignupData.password!
                  );
                  firebaseUser = signInCredential.user;
                } catch (signInError: any) {
                  return {
                    success: false,
                    error: 'An account with this email already exists. Please log in instead.',
                  };
                }
              } else {
                throw createError;
              }
            }
          }

          let finalUser: User = {
            id: firebaseUser!.uid,
            username: partialSignupData.username!,
            email: partialSignupData.email!,
            collegeName: partialSignupData.collegeName!,
            designation: partialSignupData.designation!,
            interests,
            bio: '',
            savedEvents: [],
            savedGigs: [],
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(partialSignupData.username!)}&background=random`,
          };

          try {
            // Wait for setDoc to ensure profile is created
            await setDoc(doc(firestore, 'users', firebaseUser!.uid), finalUser);
          } catch (firestoreError: any) {
            console.error('Firestore profile creation failed:', firestoreError);
            return { 
              success: false, 
              error: 'Account created, but profile setup failed. Code: ' + firestoreError.code 
            };
          }

          set({
            currentUser: finalUser,
            isLoggedIn: true,
            partialSignupData: null
          });

          await AsyncStorage.setItem('currentUser', JSON.stringify(finalUser));
          return { success: true };
        } catch (error: any) {
          console.error('Signup error:', error);
          let errorMessage = error.message || 'Failed to create account';
          return { success: false, error: errorMessage };
        }
      },

      localLogin: async (userData) => {
        const emailToCheck = userData.email.trim().toLowerCase();
        if (!isCollegeEmail(emailToCheck)) {
          return { success: false, error: 'Please use a verified college email address.' };
        }

        try {
          const firebaseAuth = requireAuth();
          const firestore = requireDb();

          const email = emailToCheck;
          const password = (userData.password ?? '').trim();

          console.log("[AuthHydration] Attempting login for:", email);
          const userCredential = await signInWithEmailAndPassword(
            firebaseAuth,
            email,
            password
          );
          const firebaseUser = userCredential.user;
          console.log("[AuthHydration] Firebase user:", firebaseUser.uid);

          // Initial fallback until Firestore doc is fetched
          const initialUser: User = {
            id: firebaseUser.uid,
            username: email.split('@')[0],
            email,
            collegeName: "My College",
            designation: "Student",
            bio: "",
            interests: [],
            savedEvents: [],
            savedGigs: [],
          };

          // Optimistically set to unblock navigation, but we'll update it soon
          set({ currentUser: initialUser, isLoggedIn: true });

          // Force full hydration from Firestore
          const userDoc = await safeFirestoreCall(
            () => getDoc(doc(firestore, 'users', firebaseUser.uid)),
            'login profile fetch'
          );

          if (userDoc.exists()) {
            const foundUser = userDoc.data() as User;
            console.log("[AuthHydration] Firestore user doc found:", foundUser.id);
            
            // Ensure all fields are present
            const finalUser: User = {
              ...foundUser,
              id: firebaseUser.uid,
              uid: firebaseUser.uid, // Add both for compatibility
            } as any;

            console.log("[AuthHydration] Final currentUser:", finalUser.username);
            set({ currentUser: finalUser });
            await AsyncStorage.setItem('currentUser', JSON.stringify(finalUser));
          } else {
            console.warn("[AuthHydration] User document missing in Firestore!");
            // Still logged in but with partial data
          }

          return { success: true };
        } catch (error: any) {
          console.error('Login error — code:', error?.code, '| message:', error?.message);

          let errorMessage = 'Invalid email or password';
          if (error?.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (error?.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please wait a moment and try again.';
          } else if (error?.code === 'auth/user-disabled') {
            errorMessage = 'This account has been disabled. Contact support.';
          }

          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        console.log('[Auth] Logging out...');
        const { currentUser } = get();
        const userId = currentUser?.id || (currentUser as any)?.uid;

        try {
          // Step 1: Set presence offline BEFORE signing out (while auth is still valid)
          if (userId) {
            const { useGigStore } = require('./useGigStore');
            await useGigStore.getState().updateUserPresence(userId, false);
          }

          // Step 2: Unsubscribe all Firestore listeners before auth changes
          try {
            const { useGigStore } = require('./useGigStore');
            useGigStore.getState().unsubscribeAll();
          } catch (_) {}
          try {
            const { useEventStore } = require('./useEventStore');
            // useEventStore doesn't have a global unsubscribe but its listeners
            // will gracefully handle permission-denied after logout
          } catch (_) {}

          // Step 3: Sign out from Firebase
          await signOut(requireAuth());
        } catch (error: any) {
          if (error?.code !== 'permission-denied') {
            console.error('[Auth] Logout error:', error);
          }
        }

        // Step 4: Clear local state regardless of any errors above
        await AsyncStorage.removeItem('currentUser');
        set({ currentUser: null, isLoggedIn: false });
      },

      registerPushToken: async (token) => {
        const { currentUser } = get();
        const userId = currentUser?.id || (currentUser as any)?.uid;
        if (!userId) return;
        
        const updatedUser = { ...currentUser, expoPushToken: token };
        set({ currentUser: updatedUser });
        
        const updates = { expoPushToken: token };
        safeFirestoreCall(
          () => setDoc(doc(requireDb(), 'users', userId), updates, { merge: true }),
          'registerPushToken'
        ).catch(console.error);
        AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser)).catch(console.error);
      },

      updateBio: (bio) => {
        const { currentUser } = get();
        const userId = currentUser?.id || (currentUser as any)?.uid;
        if (!userId) return;
        const updatedUser = { ...currentUser, bio };
        set({ currentUser: updatedUser });

        const updates = { bio };
        setDoc(doc(requireDb(), 'users', userId), updates, { merge: true }).catch(console.error);
        AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser)).catch(console.error);
      },

      updatePersonalInfo: async (updates) => {
        const { currentUser, registeredUsers } = get();
        const userId = currentUser?.id || (currentUser as any)?.uid;
        if (!userId) return;
        
        const sanitizedUpdates = Object.fromEntries(
          Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        
        const updatedUser = { ...currentUser, ...sanitizedUpdates };
        set({ currentUser: updatedUser as User });

        // Sync with Firebase Auth if username/displayName changed
        if (updates.username || updates.fullName) {
          const { updateProfile } = await import('firebase/auth');
          const firebaseAuth = requireAuth();
          if (firebaseAuth.currentUser) {
            try {
              await updateProfile(firebaseAuth.currentUser, {
                displayName: updates.username || updates.fullName
              });
              console.log("[UserStore] Firebase Auth profile updated");
            } catch (authError) {
              console.warn("[UserStore] Auth profile sync failed:", authError);
            }
          }
        }

        // Update local registeredUsers cache if exists
        if (registeredUsers && registeredUsers.length > 0) {
          const updatedRegisteredUsers = registeredUsers.map(u => 
            u.id === userId ? { ...u, ...sanitizedUpdates } : u
          );
          set({ registeredUsers: updatedRegisteredUsers });
        }

        await safeFirestoreCall(
          () => setDoc(doc(requireDb(), 'users', userId), sanitizedUpdates, { merge: true }),
          'updatePersonalInfo'
        ).catch(console.error);
        
        await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser)).catch(console.error);
      },

      updatePassword: async (currentPassword, newPassword) => {
        try {
          const firebaseAuth = requireAuth();
          const user = firebaseAuth.currentUser;
          if (!user || !user.email) return { success: false, error: 'Not logged in' };

          const { EmailAuthProvider, reauthenticateWithCredential, updatePassword: firebaseUpdatePassword } = await import('firebase/auth');
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);

          await firebaseUpdatePassword(user, newPassword);
          return { success: true };
        } catch (error: any) {
          let errorMessage = error.message || 'Failed to update password';
          if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
            errorMessage = 'Current password is incorrect.';
          } else if (error?.code === 'auth/too-many-requests') {
            errorMessage = 'Too many attempts. Please try again later.';
          }
          return { success: false, error: errorMessage };
        }
      },

      updateProfileImage: (image) => {
        const { currentUser } = get();
        const userId = currentUser?.id || (currentUser as any)?.uid;
        if (!userId) return;
        const updatedUser = { ...currentUser, image };
        set({ currentUser: updatedUser });

        const updates = { image };
        safeFirestoreCall(
          () => setDoc(doc(requireDb(), 'users', userId), updates, { merge: true }),
          'updateProfileImage'
        ).catch(console.error);
        AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser)).catch(console.error);
      },

      toggleSaveEvent: (eventId) => {
        const { currentUser } = get();
        const userId = currentUser?.id || (currentUser as any)?.uid;
        
        if (!userId || !eventId) {
          console.warn("[UserStore] toggleSaveEvent skipped: missing IDs", { userId, eventId });
          return;
        }

        const currentSaved = Array.isArray(currentUser!.savedEvents) ? currentUser!.savedEvents : [];
        const isSaved = currentSaved.includes(eventId);
        const newSaved = isSaved
          ? currentSaved.filter(id => id !== eventId)
          : [...currentSaved, eventId];

        const updatedUser = { ...currentUser!, savedEvents: newSaved };
        set({ currentUser: updatedUser });

        safeFirestoreCall(
          () => setDoc(doc(requireDb(), 'users', userId), { savedEvents: newSaved }, { merge: true }),
          'toggleSaveEvent'
        ).catch(console.error);
        AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser)).catch(console.error);
      },

      toggleSaveGig: (gigId) => {
        const { currentUser } = get();
        const userId = currentUser?.id || (currentUser as any)?.uid;
        
        if (!userId || !gigId) {
          console.warn("[UserStore] toggleSaveGig skipped: missing IDs", { userId, gigId });
          return;
        }

        const currentSaved = Array.isArray(currentUser!.savedGigs) ? currentUser!.savedGigs : [];
        
        console.log("[UserStore] toggleSaveGig debug", {
          userId,
          gigId,
          currentSaved,
        });

        const isSaved = currentSaved.includes(gigId);
        const newSaved = isSaved
          ? currentSaved.filter(id => id !== gigId)
          : [...currentSaved, gigId];

        const updatedUser = { ...currentUser!, savedGigs: newSaved };
        set({ currentUser: updatedUser });

        safeFirestoreCall(
          () => setDoc(doc(requireDb(), 'users', userId), { savedGigs: newSaved }, { merge: true }),
          'toggleSaveGig'
        ).catch(console.error);
        AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser)).catch(console.error);
      },

      syncGoogleUser: async (firebaseUser) => {
        console.log("[AuthHydration] Syncing Google user:", firebaseUser.uid);
        try {
          const firestore = requireDb();
          const userRef = doc(firestore, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          const { serverTimestamp } = await import('firebase/firestore');

          const removeUndefined = (obj: any) =>
            Object.fromEntries(
              Object.entries(obj).filter(([_, value]) => value !== undefined)
            );

          let userData: any;

          if (userDoc.exists()) {
            userData = userDoc.data();
            console.log("[AuthHydration] Existing user doc found:", userData.username);
            const updates = removeUndefined({
              name: firebaseUser.displayName || userData.name || userData.username || "User",
              email: firebaseUser.email || userData.email || "",
              photoURL: firebaseUser.photoURL || userData.photoURL || userData.image || null,
              avatar: firebaseUser.photoURL || userData.avatar || userData.image || null,
              authProvider: "google",
              updatedAt: serverTimestamp(),
            });
            await setDoc(userRef, updates, { merge: true });
            userData = { ...userData, ...updates, id: firebaseUser.uid, uid: firebaseUser.uid };
          } else {
            console.log("[AuthHydration] Creating new user doc for Google auth");
            userData = removeUndefined({
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              username: firebaseUser.email?.split('@')[0] || "User",
              name: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              photoURL: firebaseUser.photoURL || null,
              avatar: firebaseUser.photoURL || null,
              authProvider: "google",
              collegeName: "Not Specified",
              designation: "Student",
              bio: "",
              interests: [],
              savedEvents: [],
              savedGigs: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            await setDoc(userRef, userData);
          }

          const finalUser: User = {
            ...userData,
            id: firebaseUser.uid,
            username: userData.username || userData.name || "User",
          };

          console.log("[AuthHydration] Final currentUser:", finalUser.username);
          set({ currentUser: finalUser, isLoggedIn: true });
          await AsyncStorage.setItem('currentUser', JSON.stringify(finalUser));

          return { success: true };
        } catch (error: any) {
          console.error('[GoogleAuth] syncGoogleUser error:', error);
          return { success: false, error: error.message || 'Failed to sync user data' };
        }
      },

      getUserProfile: async (userId) => {
        if (!userId) return null;
        const { registeredUsers } = get();
        
        // 1. Check Cache
        const cached = registeredUsers.find(u => u.id === userId);
        if (cached) return cached;

        // 2. Fetch from Firestore
        try {
          const userDoc = await getDoc(doc(requireDb(), 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            // 3. Update Cache (non-blocking)
            set({ registeredUsers: [...registeredUsers, userData] });
            return userData;
          }
        } catch (error) {
          console.error('[UserStore] getUserProfile error:', error);
        }
        return null;
      },
    }),
    {
      name: 'dis-cover-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        registeredUsers: state.registeredUsers.map(({ ...rest }) => rest),
        currentUser: state.currentUser
          ? (({ ...rest }) => rest)(state.currentUser)
          : null,
        isLoggedIn: state.isLoggedIn,
        partialSignupData: state.partialSignupData
          ? (({ password, ...rest }) => rest)(state.partialSignupData as any)
          : null,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<StoreState> | undefined;
        if (!p) return current as StoreState;
        const merged = { ...current, ...p } as StoreState;

        if (merged.currentUser) {
          merged.currentUser = {
            ...merged.currentUser,
            savedEvents: merged.currentUser.savedEvents || [],
            savedGigs: merged.currentUser.savedGigs || [],
          };
        }
        return merged;
      },
      onRehydrateStorage: () => (state) => {
        // ✅ Called by Zustand persist as soon as AsyncStorage read completes.
        // Setting hasHydrated here eliminates the extra render cycle + the
        // useEffect delay that caused the blank screen before login appeared.
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
