import { create } from "zustand";

import { AuthCredentials, AuthSession, ProfileSetupInput, StudentProfile } from "../types";
import {
  completeProfile as completeProfileService,
  getCurrentSession,
  signIn as signInService,
  signOut as signOutService,
  signUp as signUpService,
} from "../services/authService";

interface AuthState {
  status: "idle" | "authenticated" | "unauthenticated";
  session: AuthSession | null;
  profile: StudentProfile | null;
  isInitializing: boolean;
  isSubmitting: boolean;
  error: string | null;
  initializeApp: () => Promise<void>;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (credentials: AuthCredentials) => Promise<void>;
  completeProfile: (input: ProfileSetupInput) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const setAuthenticated = (
  session: AuthSession | null,
  profile: StudentProfile | null,
): Pick<AuthState, "session" | "profile" | "status"> => ({
  session,
  profile,
  status: session ? "authenticated" : "unauthenticated",
});

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "idle",
  session: null,
  profile: null,
  isInitializing: true,
  isSubmitting: false,
  error: null,

  initializeApp: async () => {
    set({ isInitializing: true, error: null });
    try {
      const { session, profile } = await getCurrentSession();
      set({
        ...setAuthenticated(session, profile),
        isInitializing: false,
      });
    } catch (error) {
      set({
        isInitializing: false,
        status: "unauthenticated",
        error: error instanceof Error ? error.message : "Failed to initialize the app.",
      });
    }
  },

  signIn: async (credentials) => {
    set({ isSubmitting: true, error: null });
    try {
      const { session, profile } = await signInService(credentials);
      set({
        ...setAuthenticated(session, profile),
        isSubmitting: false,
      });
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : "Sign in failed.",
      });
      throw error;
    }
  },

  signUp: async (credentials) => {
    set({ isSubmitting: true, error: null });
    try {
      const { session, profile } = await signUpService(credentials);
      set({
        ...setAuthenticated(session, profile),
        isSubmitting: false,
      });
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : "Sign up failed.",
      });
      throw error;
    }
  },

  completeProfile: async (input) => {
    const currentSession = get().session;
    if (!currentSession) {
      throw new Error("No active session found.");
    }

    set({ isSubmitting: true, error: null });
    try {
      const profile = await completeProfileService(
        currentSession.id,
        currentSession.email,
        input,
      );
      set({
        session: {
          ...currentSession,
          profileCompleted: true,
        },
        profile,
        status: "authenticated",
        isSubmitting: false,
      });
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : "Profile setup failed.",
      });
      throw error;
    }
  },

  refreshProfile: async () => {
    try {
      const { session, profile } = await getCurrentSession();
      set({
        ...setAuthenticated(session, profile),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to refresh your profile.",
      });
    }
  },

  signOut: async () => {
    set({ isSubmitting: true, error: null });
    try {
      await signOutService();
      set({
        session: null,
        profile: null,
        status: "unauthenticated",
        isSubmitting: false,
      });
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : "Sign out failed.",
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
