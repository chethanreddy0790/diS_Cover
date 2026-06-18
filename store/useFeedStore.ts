import { Share } from "react-native";
import { create } from "zustand";

import { addCommentToPost, createPost, fetchFeedPage, fetchPostsByAuthor, incrementShareCount, toggleLikePost, togglePostRsvp } from "../services/postService";
import { fetchNotifications, markNotificationsRead } from "../services/notificationService";
import { fetchColleges, searchDirectory, toggleFollowCollege, toggleFollowStudent } from "../services/profileService";
import { AppNotification, College, CollegeFilter, CreatePostInput, EventPost, SearchResult } from "../types";
import { useAuthStore } from "./useAuthStore";

interface FeedState {
  posts: EventPost[];
  userPosts: EventPost[];
  notifications: AppNotification[];
  colleges: College[];
  searchResults: SearchResult;
  searchQuery: string;
  collegeFilter: CollegeFilter;
  hasMore: boolean;
  nextPage: number | null;
  isLoadingInitial: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  isSubmitting: boolean;
  isSearching: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  loadInitialFeed: () => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  loadProfilePosts: () => Promise<void>;
  setCollegeFilter: (filter: CollegeFilter) => Promise<void>;
  runSearch: (query: string) => Promise<void>;
  publishPost: (input: CreatePostInput) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  commentOnPost: (postId: string, text: string) => Promise<void>;
  sharePost: (post: EventPost) => Promise<void>;
  toggleRsvp: (postId: string) => Promise<void>;
  followStudent: (targetUserId: string) => Promise<void>;
  followCollege: (collegeId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const emptySearchResults: SearchResult = {
  students: [],
  colleges: [],
};

const replacePost = (posts: EventPost[], nextPost: EventPost) =>
  posts.map((post) => (post.id === nextPost.id ? nextPost : post));

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  userPosts: [],
  notifications: [],
  colleges: [],
  searchResults: emptySearchResults,
  searchQuery: "",
  collegeFilter: "all",
  hasMore: true,
  nextPage: 0,
  isLoadingInitial: false,
  isRefreshing: false,
  isLoadingMore: false,
  isSubmitting: false,
  isSearching: false,
  error: null,

  hydrate: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) {
      return;
    }

    set({ isLoadingInitial: true, error: null });
    try {
      const [page, notifications, colleges, userPosts] = await Promise.all([
        fetchFeedPage(profile, 0, get().collegeFilter),
        fetchNotifications(profile.id),
        fetchColleges(),
        fetchPostsByAuthor(profile.id),
      ]);

      set({
        posts: page.items,
        hasMore: page.hasMore,
        nextPage: page.nextPage,
        notifications,
        colleges,
        userPosts,
        isLoadingInitial: false,
      });
    } catch (error) {
      set({
        isLoadingInitial: false,
        error: error instanceof Error ? error.message : "Unable to load your feed.",
      });
    }
  },

  loadInitialFeed: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) {
      return;
    }

    set({ isLoadingInitial: true, error: null });
    try {
      const page = await fetchFeedPage(profile, 0, get().collegeFilter);
      set({
        posts: page.items,
        hasMore: page.hasMore,
        nextPage: page.nextPage,
        isLoadingInitial: false,
      });
    } catch (error) {
      set({
        isLoadingInitial: false,
        error: error instanceof Error ? error.message : "Unable to load your feed.",
      });
    }
  },

  loadMoreFeed: async () => {
    const profile = useAuthStore.getState().profile;
    const nextPage = get().nextPage;
    if (!profile || nextPage === null || get().isLoadingMore) {
      return;
    }

    set({ isLoadingMore: true, error: null });
    try {
      const page = await fetchFeedPage(profile, nextPage, get().collegeFilter);
      set((state) => ({
        posts: [...state.posts, ...page.items],
        hasMore: page.hasMore,
        nextPage: page.nextPage,
        isLoadingMore: false,
      }));
    } catch (error) {
      set({
        isLoadingMore: false,
        error: error instanceof Error ? error.message : "Unable to load more events.",
      });
    }
  },

  refreshFeed: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) {
      return;
    }

    set({ isRefreshing: true, error: null });
    try {
      const [page, notifications, userPosts] = await Promise.all([
        fetchFeedPage(profile, 0, get().collegeFilter),
        fetchNotifications(profile.id),
        fetchPostsByAuthor(profile.id),
      ]);

      set({
        posts: page.items,
        notifications,
        userPosts,
        hasMore: page.hasMore,
        nextPage: page.nextPage,
        isRefreshing: false,
      });
    } catch (error) {
      set({
        isRefreshing: false,
        error: error instanceof Error ? error.message : "Unable to refresh your feed.",
      });
    }
  },

  loadNotifications: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) {
      return;
    }

    try {
      const notifications = await fetchNotifications(profile.id);
      set({ notifications });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to load notifications.",
      });
    }
  },

  markAllNotificationsRead: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) {
      return;
    }

    try {
      await markNotificationsRead(profile.id);
      set((state) => ({
        notifications: state.notifications.map((item) => ({ ...item, read: true })),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to mark notifications as read.",
      });
    }
  },

  loadProfilePosts: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) {
      return;
    }

    try {
      const userPosts = await fetchPostsByAuthor(profile.id);
      set({ userPosts });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to load your posts.",
      });
    }
  },

  setCollegeFilter: async (filter) => {
    set({ collegeFilter: filter });
    await get().loadInitialFeed();
  },

  runSearch: async (query) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) {
      return;
    }

    set({ isSearching: true, searchQuery: query, error: null });
    try {
      const searchResults = await searchDirectory(query, profile.id);
      set({
        searchResults,
        isSearching: false,
      });
    } catch (error) {
      set({
        isSearching: false,
        error: error instanceof Error ? error.message : "Search failed.",
      });
    }
  },

  publishPost: async (input) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) {
      throw new Error("No active student profile found.");
    }

    set({ isSubmitting: true, error: null });
    try {
      const newPost = await createPost(profile, input);
      set((state) => ({
        posts: [newPost, ...state.posts],
        userPosts: [newPost, ...state.userPosts],
        isSubmitting: false,
      }));
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : "We could not publish this post.",
      });
      throw error;
    }
  },

  likePost: async (postId) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) {
      return;
    }

    try {
      const updatedPost = await toggleLikePost(postId, profile);
      set((state) => ({
        posts: replacePost(state.posts, updatedPost),
        userPosts: replacePost(state.userPosts, updatedPost),
      }));
      await get().loadNotifications();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to like this event.",
      });
    }
  },

  commentOnPost: async (postId, text) => {
    const profile = useAuthStore.getState().profile;
    if (!profile || !text.trim()) {
      return;
    }

    try {
      const updatedPost = await addCommentToPost(postId, profile, text);
      set((state) => ({
        posts: replacePost(state.posts, updatedPost),
        userPosts: replacePost(state.userPosts, updatedPost),
      }));
      await get().loadNotifications();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to add your comment.",
      });
    }
  },

  sharePost: async (post) => {
    try {
      const updatedPost = await incrementShareCount(post.id);
      set((state) => ({
        posts: replacePost(state.posts, updatedPost),
        userPosts: replacePost(state.userPosts, updatedPost),
      }));

      await Share.share({
        message: `${post.title} at ${post.location} on ${new Date(post.eventDate).toLocaleString()}\n\n${post.description}`,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to share this event.",
      });
    }
  },

  toggleRsvp: async (postId) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) {
      return;
    }

    try {
      const updatedPost = await togglePostRsvp(postId, profile.id);
      set((state) => ({
        posts: replacePost(state.posts, updatedPost),
        userPosts: replacePost(state.userPosts, updatedPost),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to update your RSVP.",
      });
    }
  },

  followStudent: async (targetUserId) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) {
      return;
    }

    try {
      await toggleFollowStudent(profile.id, targetUserId);
      await useAuthStore.getState().refreshProfile();
      await get().runSearch(get().searchQuery);
      await get().loadInitialFeed();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to update follow state.",
      });
    }
  },

  followCollege: async (collegeId) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) {
      return;
    }

    try {
      await toggleFollowCollege(profile.id, collegeId);
      await useAuthStore.getState().refreshProfile();
      const colleges = await fetchColleges();
      set({ colleges });
      await get().runSearch(get().searchQuery);
      await get().loadInitialFeed();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to update college follow state.",
      });
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      posts: [],
      userPosts: [],
      notifications: [],
      colleges: [],
      searchResults: emptySearchResults,
      searchQuery: "",
      collegeFilter: "all",
      hasMore: true,
      nextPage: 0,
      isLoadingInitial: false,
      isRefreshing: false,
      isLoadingMore: false,
      isSubmitting: false,
      isSearching: false,
      error: null,
    }),
}));
