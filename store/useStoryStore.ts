import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { create } from 'zustand';
import { db, auth } from '../services/firebase';
import { createId } from '../services/serviceUtils';
import { safeFirestoreCall } from '../utils/firestoreUtils';
import type { Story } from './useStore';
import { useStore } from './useStore';

interface StoryStoreState {
  stories: Story[];
  isLoading: boolean;
  subscribeToStories: () => () => void;
  addStory: (story: Omit<Story, 'id' | 'createdAt' | 'expiresAt' | 'userId' | 'username' | 'userRole' | 'viewerIds'>) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  cleanupStories: () => Promise<void>;
  recordStoryView: (storyId: string) => Promise<void>;
  subscribeToStoryViewers: (storyId: string, callback: (viewers: any[]) => void) => () => void;
}

export const useStoryStore = create<StoryStoreState>((set, get) => ({
  stories: [],
  isLoading: false,

  subscribeToStories: () => {
    // Guard: do not subscribe if auth is signed out
    if (!auth.currentUser) {
      console.log('[StoryStore] subscribeToStories skipped — user not authenticated');
      return () => {};
    }
    set({ isLoading: true });

    // Auto-cleanup on subscription
    get().cleanupStories();

    const q = query(
      collection(db, 'stories'), 
      where('expiresAt', '>', Timestamp.now()),
      orderBy('expiresAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stories = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        // Handle conversion from serverTimestamp to string if needed by the UI
        createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : d.data().createdAt,
        expiresAt: d.data().expiresAt?.toDate ? d.data().expiresAt.toDate().toISOString() : d.data().expiresAt
      } as Story));

      // Sort by createdAt desc client-side since Firestore ordering is restricted by the filter
      stories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      set({ stories, isLoading: false });
    }, (error: any) => {
      if (error?.code === 'permission-denied') {
        console.log('[StoryStore] permission-denied on \'stories\' — likely logged out, stopping listener.');
      } else {
        console.error(`[StoryStore] subscribe error on collection 'stories':`, error?.code, error?.message);
      }
      set({ isLoading: false });
    });

    return unsubscribe;
  },

  addStory: async (storyData) => {
    const currentUser = useStore.getState().currentUser;
    if (!currentUser) return;

    const id = createId('story');
    const newStory: any = {
      id,
      userId: currentUser.id,
      username: currentUser.username,
      userRole: currentUser.designation,
      viewerIds: [],
      ...storyData,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    };

    await safeFirestoreCall(
      () => setDoc(doc(db, 'stories', id), newStory),
      'addStory'
    );
  },

  deleteStory: async (storyId) => {
    const story = get().stories.find(s => s.id === storyId);
    const currentUserId = useStore.getState().currentUser?.id;
    if (!story || !currentUserId || currentUserId !== story.userId) {
      console.error('Unauthorized story delete attempt blocked.');
      return;
    }

    await safeFirestoreCall(
      () => deleteDoc(doc(db, 'stories', storyId)),
      'deleteStory'
    );
  },

  cleanupStories: async () => {
    const currentUser = useStore.getState().currentUser;
    const currentUserId = currentUser?.id || (currentUser as any)?.uid;
    if (!currentUserId) return;

    try {
      const { getDocs } = await import('firebase/firestore');
      const q = query(
        collection(db, 'stories'), 
        where('userId', '==', currentUserId)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return;

      const now = Timestamp.now();
      const expiredDocs = snapshot.docs.filter(d => {
        const data = d.data();
        return data.expiresAt && data.expiresAt.toDate() <= now.toDate();
      });

      if (expiredDocs.length === 0) return;

      console.log(`[StoryStore] Cleaning up ${expiredDocs.length} expired stories`);
      
      const deletePromises = expiredDocs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      
      // Note: Media cleanup would ideally happen here too if we had public_ids
    } catch (error: any) {
      console.error(`[StoryStore] Cleanup error for userId ${currentUserId}:`, error?.code, error?.message);
    }
  },

  recordStoryView: async (storyId) => {
    const currentUser = useStore.getState().currentUser;
    if (!currentUser) return;
    const viewerId = currentUser.id || (currentUser as any)?.uid;
    if (!viewerId) {
      console.warn("[StoryViewer] no viewerId available, skipping");
      return;
    }

    console.log("[StoryViewer] saving viewer:", viewerId);

    const removeUndefined = (obj: any) =>
      Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
      );

    // Try to get enriched data from Firestore users collection
    let viewerName = currentUser.username || currentUser.fullName || "User";
    let viewerAvatar = currentUser.image || null;

    try {
      const { getDoc } = await import('firebase/firestore');
      const userDoc = await getDoc(doc(db, 'users', viewerId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        viewerName = userData.username || userData.fullName || userData.name || viewerName;
        viewerAvatar = userData.image || userData.photoURL || userData.avatar || viewerAvatar;
      }
    } catch (e) {
      // Non-critical: fall back to local data
      console.warn("[StoryViewer] could not fetch user doc, using local data");
    }

    const viewerData = removeUndefined({
      userId: viewerId,
      name: viewerName,
      avatar: viewerAvatar,
      viewedAt: serverTimestamp(),
    });

    await safeFirestoreCall(
      async () => {
        // 1. Update the main story document's viewerIds array (for backward compatibility/counts)
        await setDoc(doc(db, 'stories', storyId), {
          viewerIds: arrayUnion(viewerId)
        }, { merge: true });

        // 2. Add/Update the viewer in the subcollection for rich realtime data
        await setDoc(doc(db, 'stories', storyId, 'viewers', viewerId), viewerData, { merge: true });
        console.log("[StoryViewer] viewer saved successfully:", viewerId);
      },
      'recordStoryView'
    );
  },

  subscribeToStoryViewers: (storyId: string, callback: (viewers: any[]) => void) => {
    const q = query(collection(db, 'stories', storyId, 'viewers'), orderBy('viewedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const viewers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("[StoryViewer] realtime viewers count:", viewers.length);
      callback(viewers);
    }, (error: any) => {
      console.error(`[StoryViewer] subscribe error on collection 'stories/${storyId}/viewers':`, error?.code, error?.message);
    });
    return unsubscribe;
  },
}));
