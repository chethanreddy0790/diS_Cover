import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { create } from 'zustand';
import { db, auth } from '../services/firebase';
import { createId } from '../services/serviceUtils';
import { removeUndefined, safeFirestoreCall } from '../utils/firestoreUtils';
import { runTransaction } from 'firebase/firestore';
import type { Comment, Event } from './useStore';
import { useStore } from './useStore';

interface EventStoreState {
  events: Event[];
  isLoading: boolean;
  subscribeToEvents: () => () => void;
  addEvent: (event: Omit<Event, 'id' | 'likes' | 'comments' | 'likedBy'>) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  toggleLike: (eventId: string) => Promise<void>;
  addComment: (eventId: string, text: string) => Promise<void>;
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  events: [],
  isLoading: false,

  subscribeToEvents: () => {
    // Guard: do not subscribe if auth is signed out
    if (!auth.currentUser) {
      console.log('[EventStore] subscribeToEvents skipped — user not authenticated');
      return () => {};
    }
    set({ isLoading: true });
    // Add where('deleted', '!=', true) to filter out soft-deleted events
    const q = query(
      collection(db, 'events'), 
      orderBy('date', 'desc')
    );
    let unsubscribe: () => void;

    const startListener = () => {
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const events = snapshot.docs
            .map((d) => {
              const data = d.data();
              return {
                id: d.id,
                ...data,
                likes: typeof data.likes === 'number' ? data.likes : 0,
                likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
                comments: Array.isArray(data.comments) ? data.comments : [],
              } as Event;
            })
            .filter(e => !e.deleted);

          console.log('[EventStore] Realtime events received:', events.length);
          set({ events, isLoading: false });
        },
        (error) => {
          set({ isLoading: false });
          if (error?.code === 'permission-denied') {
            console.log('[EventStore] permission-denied — likely logged out, stopping listener.');
          } else {
            console.warn('[EventStore] onSnapshot error — code:', error?.code, '| message:', error?.message);
            setTimeout(() => {
              if (auth.currentUser) {
                console.log('[EventStore] Attempting onSnapshot reconnect...');
                startListener();
              }
            }, 5000);
          }
        }
      );
    };

    startListener();
    return () => unsubscribe?.();
  },

  // ✅ Optimistic addEvent — doesn't block the UI
  addEvent: async (eventData) => {
    const id = createId('event');

    let imageUrl = eventData.image;

    // Handle image upload if it's a local file
    if (eventData.image && !eventData.image.startsWith('http')) {
      try {
        const { uploadImage } = await import('../services/storageUtils');
        console.log('[useEventStore] Uploading event image to Cloudinary...');
        imageUrl = await uploadImage(eventData.image);
        console.log('[useEventStore] Image uploaded successfully:', imageUrl);
      } catch (error) {
        console.error('[useEventStore] Image upload failed during addEvent:', error);
        throw error; 
      }
    }

    const newEvent: Event = {
      ...eventData,
      id,
      image: imageUrl || 'https://via.placeholder.com/800x450?text=No+Image',
      imageAspectRatio: eventData.imageAspectRatio,
      organizerId: eventData.createdBy?.id || auth.currentUser?.uid,
      likes: 0,
      likedBy: [],
      comments: [],
      deleted: false,
    };

    console.log('[useEventStore] Saving event to Firestore with image:', newEvent.image);

    console.log("Current UID:", auth.currentUser?.uid);
    console.log("Event Payload:", removeUndefined({ 
        ...newEvent, 
        createdAt: "serverTimestamp" 
    }));
    console.log("Firestore Path:", `events/${id}`);

    await safeFirestoreCall(
      () => setDoc(doc(db, 'events', id), removeUndefined({ 
        ...newEvent, 
        createdAt: serverTimestamp() 
      })),
      'addEvent'
    );
  },

  updateEvent: async (updatedEvent) => {
    const currentUserId = useStore.getState().currentUser?.id;
    if (!currentUserId || currentUserId !== updatedEvent.createdBy?.id) {
      console.error('[EventStore] Unauthorized event update attempt blocked.');
      return;
    }
    
    await safeFirestoreCall(
      () => setDoc(doc(db, 'events', updatedEvent.id), removeUndefined({ 
        ...updatedEvent, 
        updatedAt: serverTimestamp() 
      }), { merge: true }),
      'updateEvent'
    );
  },

  deleteEvent: async (eventId) => {
    const events = get().events;
    const eventToDelete = events.find((e) => e.id === eventId);
    const currentUserId = useStore.getState().currentUser?.id;
    if (!eventToDelete || !currentUserId || currentUserId !== eventToDelete.createdBy?.id) {
      console.error('[EventStore] Unauthorized event delete attempt blocked.');
      return;
    }

    // Soft delete strategy
    await safeFirestoreCall(
      () => setDoc(doc(db, 'events', eventId), { 
        deleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: currentUserId
      }, { merge: true }),
      'deleteEvent'
    );
  },

  toggleLike: async (eventId) => {
    const currentUser = useStore.getState().currentUser;
    const userId = currentUser?.id;
    
    if (!userId || !eventId) return;

    await safeFirestoreCall(
      () => runTransaction(db, async (transaction) => {
        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await transaction.get(eventRef);

        if (!eventSnap.exists()) return;

        const data = eventSnap.data();
        const likedBy = Array.isArray(data.likedBy) ? data.likedBy : [];
        const likes = typeof data.likes === 'number' ? data.likes : likedBy.length;

        const alreadyLiked = likedBy.includes(userId);

        transaction.set(
          eventRef,
          {
            likedBy: alreadyLiked
              ? likedBy.filter((id) => id !== userId)
              : [...likedBy, userId],
            likes: alreadyLiked
              ? Math.max(0, likes - 1)
              : likes + 1,
          },
          { merge: true }
        );
      }),
      'toggleLike'
    );
  },

  addComment: async (eventId, text) => {
    const commentText = text.trim();
    if (!commentText) return;
    
    const currentUser = useStore.getState().currentUser;
    const userId = currentUser?.id;

    if (!userId || !eventId) return;

    const newComment: Comment = {
      id: `${Date.now()}-${userId}`,
      userId,
      userName: useStore.getState().currentUser?.username || "User",
      userAvatar: useStore.getState().currentUser?.image || null,
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    await safeFirestoreCall(
      () => setDoc(doc(db, 'events', eventId), {
        comments: arrayUnion(removeUndefined(newComment)),
      }, { merge: true }),
      'addComment'
    );
  },

  deleteComment: async (eventId, commentId) => {
    const currentUserId = useStore.getState().currentUser?.id;
    if (!currentUserId || !eventId || !commentId) return;

    const event = get().events.find(e => e.id === eventId);
    if (!event) return;

    const comment = event.comments.find(c => c.id === commentId);
    if (!comment || comment.userId !== currentUserId) return;

    await safeFirestoreCall(
      () => setDoc(doc(db, 'events', eventId), {
        comments: arrayRemove(comment),
      }, { merge: true }),
      'deleteComment'
    );
  },

  editComment: async (eventId, commentId, newText) => {
    const currentUserId = useStore.getState().currentUser?.id;
    if (!currentUserId || !eventId || !commentId || !newText.trim()) return;

    const event = get().events.find(e => e.id === eventId);
    if (!event) return;

    const comments = [...event.comments];
    const index = comments.findIndex(c => c.id === commentId);
    
    if (index === -1 || comments[index].userId !== currentUserId) return;

    comments[index] = {
      ...comments[index],
      text: newText.trim(),
      edited: true,
      updatedAt: new Date().toISOString()
    };

    await safeFirestoreCall(
      () => setDoc(doc(db, 'events', eventId), {
        comments: comments,
      }, { merge: true }),
      'editComment'
    );
  },
}));
