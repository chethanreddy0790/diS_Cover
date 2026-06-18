import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  deleteDoc,
  where,
  addDoc,
  writeBatch,
  getDocs,
  getDoc,
  arrayUnion,
  arrayRemove,
  updateDoc,
} from 'firebase/firestore';
import { create } from 'zustand';
import { db, auth } from '../services/firebase';
import { createId } from '../services/serviceUtils';
import { removeUndefined, safeFirestoreCall } from '../utils/firestoreUtils';
import { sendPushNotification } from '../services/notificationService';
import type { GigConversation, GigConversationMessage } from './useStore';
import { useStore } from './useStore';

export interface PublishedGig {
  id: string;
  title: string;
  description: string;
  price: number;
  priceLabel: string;
  company: string;
  location: string;
  rating: string;
  companyMark: string;
  sellerName: string;
  sellerRole: string;
  sellerRating: string;
  createdAt: any;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  image?: string;
  imageAspectRatio?: number;
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: any;
  updatedAt: any;
}

interface GigStoreState {
  publishedGigs: PublishedGig[];
  gigConversations: GigConversation[];
  activeMessages: GigConversationMessage[];
  isLoading: boolean;
  userPresences: { [userId: string]: UserPresence };
  _activeListeners: Map<string, () => void>;

  subscribeToGigs: () => () => void;
  subscribeToConversations: (currentUserId: string) => () => void;
  subscribeToMessages: (conversationId: string) => () => void;
  subscribeToPresence: (userIds: string[]) => () => void;
  unsubscribeAll: () => void;

  addPublishedGig: (gig: { title: string; description: string; price: number; image?: string; imageAspectRatio?: number }) => Promise<PublishedGig | null>;
  deleteGig: (gigId: string) => Promise<void>;

  sendGigInquiry: (params: {
    gigId: string;
    gigTitle: string;
    sellerName: string;
    sellerRole?: string;
    sellerRating?: string;
    text: string;
    sellerId: string;
  }) => Promise<string | null>;

  sendGigConversationMessage: (params: {
    conversationId: string;
    text: string;
    receiverId: string;
    imageUrl?: string;
    type?: 'text' | 'image';
  }) => Promise<void>;

  markMessagesAsRead: (conversationId: string, currentUserId: string) => Promise<void>;
  setTypingState: (conversationId: string, currentUserId: string, isTyping: boolean) => Promise<void>;
  updateUserPresence: (currentUserId: string, isOnline: boolean) => Promise<void>;
  deleteConversation: (conversationId: string, currentUserId: string) => Promise<void>;
}

export const useGigStore = create<GigStoreState>((set, get) => ({
  publishedGigs: [],
  gigConversations: [],
  activeMessages: [],
  userPresences: {},
  isLoading: false,
  _activeListeners: new Map(),

  unsubscribeAll: () => {
    const { _activeListeners } = get();
    console.log(`[GigStore] Unsubscribing all ${_activeListeners.size} listeners`);
    _activeListeners.forEach(unsub => { try { unsub(); } catch (_) {} });
    _activeListeners.clear();
    set({ publishedGigs: [], gigConversations: [], activeMessages: [], userPresences: {}, isLoading: false });
  },

  subscribeToGigs: () => {
    // Guard: do not subscribe if auth is signed out
    if (!auth.currentUser) {
      console.log('[GigStore] subscribeToGigs skipped — user not authenticated');
      return () => {};
    }
    set({ isLoading: true });
    console.log('[GigStore] Subscribing to gigs...');

    try {
      const gigsRef = collection(db, 'gigs');
      const q = query(gigsRef, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const gigs = snapshot.docs
          .map(d => ({ 
            id: d.id, 
            ...d.data(),
            createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : d.data().createdAt
          } as PublishedGig))
          .filter(g => !g.deleted);
        
        console.log(`[GigStore] Realtime gigs received: ${gigs.length}`);
        set({ publishedGigs: gigs, isLoading: false });
      }, (error: any) => {
        if (error?.code === 'permission-denied') {
          console.log('[GigStore] subscribeToGigs: permission-denied — likely logged out, skipping retry');
        } else {
          console.error(`[GigStore] subscribeToGigs error on collection 'gigs':`, error?.code, error?.message);
        }
        set({ isLoading: false });
      });

      // Track listener for cleanup
      get()._activeListeners.set('gigs', unsubscribe);
      return () => {
        unsubscribe();
        get()._activeListeners.delete('gigs');
      };
    } catch (error) {
      console.error('[GigStore] subscribeToGigs setup failed:', error);
      set({ isLoading: false });
      return () => {};
    }
  },

  subscribeToConversations: (currentUserId: string) => {
    if (!currentUserId || !auth.currentUser) {
      console.log('[GigStore] subscribeToConversations skipped — missing userId or auth');
      return () => {};
    }

    console.log('[GigStore] Subscribing to conversations for user:', currentUserId);

    try {
      const q = query(
        collection(db, 'gigConversations'), 
        where('participants', 'array-contains', currentUserId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const allConversations = snapshot.docs.map(d => ({ 
          id: d.id, 
          ...d.data() 
        } as GigConversation));

        // ✅ Deterministic Filtering:
        // Hide if hiddenFor includes currentUserId AND updatedAt <= deletedAtBy[currentUserId]
        const conversations = allConversations.filter(c => {
          if (!c.hiddenFor?.includes(currentUserId)) return true;
          
          const deletedAt = c.deletedAtBy?.[currentUserId];
          if (!deletedAt) return true; 

          const deletedTime = deletedAt?.toDate ? deletedAt.toDate().getTime() : (typeof deletedAt === 'number' ? deletedAt : new Date(deletedAt).getTime());
          const updatedTime = c.updatedAt?.toDate ? c.updatedAt.toDate().getTime() : (typeof c.updatedAt === 'number' ? c.updatedAt : new Date(c.updatedAt).getTime());

          // If conversation has new activity since deletion, unhide it
          return updatedTime > deletedTime;
        });

        conversations.sort((a, b) => {
          const timeA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : (typeof a.updatedAt === 'number' ? a.updatedAt : new Date(a.updatedAt).getTime());
          const timeB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : (typeof b.updatedAt === 'number' ? b.updatedAt : new Date(b.updatedAt).getTime());
          return timeB - timeA;
        });

        console.log(`[GigStore] Received ${conversations.length} active conversations`);
        set({ gigConversations: conversations });
      }, (error: any) => {
        if (error?.code === 'permission-denied') {
          console.log('[GigStore] subscribeToConversations: permission-denied — likely logged out');
        } else {
          console.error(`[GigStore] subscribeToConversations error on collection 'gigConversations':`, error?.code, error?.message);
        }
      });

      // Track listener for cleanup
      get()._activeListeners.set('conversations', unsubscribe);
      return () => {
        unsubscribe();
        get()._activeListeners.delete('conversations');
      };
    } catch (error) {
      console.error('[GigStore] subscribeToConversations setup failed:', error);
      return () => {};
    }
  },

  subscribeToMessages: (conversationId: string) => {
    const currentUserId = useStore.getState().currentUser?.id;
    if (!conversationId || !currentUserId) return () => {};

    console.log('[GigChat] Subscribing to messages for:', conversationId);
    console.log('[GigChat] conversationId:', conversationId);
    
    try {
      const q = query(
        collection(db, 'gigConversations', conversationId, 'messages'),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        // Fetch conversation to check deletedAtBy
        getDoc(doc(db, 'gigConversations', conversationId)).then(convDoc => {
          if (!convDoc.exists()) return;
          const convData = convDoc.data() as GigConversation;
          const deletedAt = convData.deletedAtBy?.[currentUserId];
          const deletedTime = deletedAt?.toDate ? deletedAt.toDate().getTime() : (typeof deletedAt === 'number' ? deletedAt : (deletedAt ? new Date(deletedAt).getTime() : 0));

          const allMessages = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : d.data().createdAt
          } as GigConversationMessage));

          // Filter messages created after deletedTime
          const visibleMessages = allMessages.filter(msg => {
            const msgTime = msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
            return msgTime > deletedTime;
          });

          console.log(`[GigChat] visible messages after clear for ${currentUserId}: ${visibleMessages.length}`);
          set({ activeMessages: visibleMessages });
        });
      }, (error: any) => {
        console.error(`[GigChat] subscribeToMessages error on collection 'gigConversations/${conversationId}/messages':`, error?.code, error?.message);
      });

      return unsubscribe;
    } catch (error) {
      console.error('[GigChat] subscribeToMessages setup failed:', error);
      return () => {};
    }
  },

  subscribeToPresence: (userIds: string[]) => {
    if (!userIds || userIds.length === 0) return () => {};
    
    console.log('[Presence] Subscribing to user IDs:', userIds.length);
    
    const unsubscribeFns = userIds.map(uid => {
      return onSnapshot(doc(db, 'userPresence', uid), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserPresence;
          set(state => ({
            userPresences: { ...state.userPresences, [uid]: data }
          }));
        }
      }, (error: any) => {
        console.error(`[Presence] subscribeToPresence error on document 'userPresence/${uid}':`, error?.code, error?.message);
      });
    });

    return () => unsubscribeFns.forEach(fn => fn());
  },

  addPublishedGig: async ({ title, description, price, image, imageAspectRatio }) => {
    const currentUser = useStore.getState().currentUser;
    if (!currentUser?.id) return null;

    let finalImageUrl: string | null = null;
    if (image && typeof image === 'string') {
      if (image.startsWith('http')) {
        finalImageUrl = image;
      } else {
        try {
          const { uploadImage } = await import('../services/storageUtils');
          finalImageUrl = await uploadImage(image);
        } catch (error) {
          console.error('[GigStore] Image upload failed:', error);
          throw error;
        }
      }
    }

    const id = createId('gig');
    const username = (currentUser.fullName || currentUser.username) || 'Creative Partner';
    
    const companyMark = currentUser.collegeName
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0))
      .join('')
      .slice(0, 3)
      .toUpperCase() || 'YOU';

    const gigData = removeUndefined({
      id,
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      priceLabel: `₹${price}`,
      company: currentUser.collegeName || 'Independent Creator',
      location: 'Remote',
      rating: 'New',
      companyMark,
      sellerName: username,
      sellerRole: currentUser.designation || 'Creator',
      sellerRating: 'New',
      image: finalImageUrl,
      imageAspectRatio,
      createdBy: {
        id: currentUser.id,
        name: username,
        role: currentUser.designation || 'Student',
      },
      createdAt: serverTimestamp(),
      deleted: false,
    });

    console.log("[GigStore] Creating gig payload:", gigData);

    await safeFirestoreCall(
      () => setDoc(doc(db, 'gigs', id), gigData),
      'addPublishedGig'
    );

    console.log("[GigStore] Gig created successfully");

    return { ...gigData, createdAt: new Date().toISOString() };
  },

  updateGig: async (gigId, updates) => {
    if (!gigId) return;
    const currentUser = useStore.getState().currentUser;
    const gig = get().publishedGigs.find(g => g.id === gigId);
    
    if (!gig || !currentUser?.id || gig.createdBy?.id !== currentUser.id) return;

    await safeFirestoreCall(
      () => setDoc(doc(db, 'gigs', gigId), { 
        ...updates, 
        updatedAt: serverTimestamp() 
      }, { merge: true }),
      'updateGig'
    );
  },

  deleteGig: async (gigId) => {
    if (!gigId) return;
    const currentUser = useStore.getState().currentUser;
    const gig = get().publishedGigs.find(g => g.id === gigId);
    
    if (!gig || !currentUser?.id || gig.createdBy?.id !== currentUser.id) return;

    // Soft delete strategy
    await safeFirestoreCall(
      () => setDoc(doc(db, 'gigs', gigId), { 
        deleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: currentUser.id
      }, { merge: true }),
      'deleteGig'
    );
  },

  sendGigInquiry: async ({ gigId, gigTitle, sellerName, sellerRole, sellerRating, text, sellerId }) => {
    let userId = useStore.getState().currentUser?.id;
    let username = (useStore.getState().currentUser?.username || useStore.getState().currentUser?.fullName) || 'Creative Partner';

    if (!userId && auth.currentUser?.uid) {
      userId = auth.currentUser.uid;
      username = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'User';
    }

    if (!userId || !gigId || !sellerId || !text.trim()) return null;

    // ✅ Deterministic Conversation ID
    const conversationId = `${gigId}_${userId}_${sellerId}`;
    console.log("[ConversationID] Generating deterministic ID:", conversationId);

    const messageData = removeUndefined({
      id: createId('msg'),
      conversationId,
      senderId: userId,
      senderName: username,
      receiverId: sellerId,
      text: text.trim(),
      type: 'text',
      readBy: [userId],
      createdAt: serverTimestamp(),
    });

    const conversationData = removeUndefined({
      id: conversationId,
      gigId,
      gigTitle,
      sellerName,
      sellerId,
      buyerId: userId,
      buyerName: username,
      sellerRole: sellerRole || 'Seller',
      sellerRating: sellerRating || 'New',
      participants: [userId, sellerId],
      hiddenFor: arrayRemove(userId, sellerId), // ✅ Unhide both on new message
      lastMessage: text.trim(),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    await safeFirestoreCall(async () => {
      // ✅ Reuse existing doc if present
      await setDoc(doc(db, 'gigConversations', conversationId), conversationData, { merge: true });
      await addDoc(collection(db, 'gigConversations', conversationId, 'messages'), messageData);
      
      // Trigger notification
      const receiverDoc = await getDoc(doc(db, 'users', sellerId));
      if (receiverDoc.exists()) {
        const token = receiverDoc.data().expoPushToken;
        if (token) {
          sendPushNotification(token, username as string, text.trim(), { conversationId });
          console.log('[Push] notification sent to seller');
        }
      }
    }, 'sendGigInquiry');

    return conversationId;
  },

  sendGigConversationMessage: async ({ conversationId, text, receiverId, imageUrl, type = 'text' }) => {
    let userId = useStore.getState().currentUser?.id;
    let username = (useStore.getState().currentUser?.username || useStore.getState().currentUser?.fullName) || 'Creative Partner';

    if (!userId && auth.currentUser?.uid) {
      userId = auth.currentUser.uid;
      username = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'User';
    }

    if (!userId || !conversationId || !receiverId) return;

    const messageData = removeUndefined({
      id: createId('msg'),
      conversationId,
      senderId: userId,
      senderName: username,
      receiverId,
      text: text.trim(),
      imageUrl,
      type,
      readBy: [userId],
      createdAt: serverTimestamp(),
    });

    await safeFirestoreCall(async () => {
      await addDoc(collection(db, 'gigConversations', conversationId, 'messages'), messageData);
      
      // ✅ Reuse and Unhide in one call
      await setDoc(doc(db, 'gigConversations', conversationId), {
        lastMessage: type === 'image' ? 'Sent an image' : text.trim(),
        hiddenFor: arrayRemove(userId, receiverId),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Trigger notification
      const receiverDoc = await getDoc(doc(db, 'users', receiverId));
      if (receiverDoc.exists()) {
        const token = receiverDoc.data().expoPushToken;
        if (token) {
          const body = type === 'image' ? '📷 Sent you an image' : text.trim();
          sendPushNotification(token, username as string, body, { conversationId });
          console.log('[Push] notification sent');
        }
      }
    }, 'sendGigConversationMessage');
  },

  markMessagesAsRead: async (conversationId, currentUserId) => {
    if (!conversationId || !currentUserId) return;

    try {
      const q = query(
        collection(db, 'gigConversations', conversationId, 'messages'),
        where('receiverId', '==', currentUserId)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      let count = 0;

      snapshot.docs.forEach((d) => {
        const data = d.data();
        const readBy = data.readBy || [];
        if (!readBy.includes(currentUserId)) {
          batch.update(d.ref, {
            readBy: arrayUnion(currentUserId),
            seenAt: { [currentUserId]: serverTimestamp() }
          });
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
        console.log(`[ReadReceipt] marked ${count} messages read`);
      }
    } catch (error) {
      console.error('[GigStore] markMessagesAsRead error:', error);
    }
  },

  setTypingState: async (conversationId, currentUserId, isTyping) => {
    if (!conversationId || !currentUserId) return;

    try {
      await setDoc(doc(db, 'gigConversations', conversationId), {
        typing: { [currentUserId]: isTyping }
      }, { merge: true });
    } catch (error) {
      console.error('[GigStore] setTypingState error:', error);
    }
  },

  updateUserPresence: async (currentUserId, isOnline) => {
    if (!currentUserId) return;

    // Guard: skip if auth is no longer valid (e.g. during/after logout)
    if (!auth.currentUser) {
      console.log('[Logout] Skipping presence update because user is signed out');
      return;
    }

    try {
      const presenceData = removeUndefined({
        userId: currentUserId,
        isOnline,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'userPresence', currentUserId), presenceData, { merge: true });
      console.log(`[Presence] ${isOnline ? 'online' : 'offline'}`);
    } catch (error: any) {
      if (error?.code === 'permission-denied') {
        console.log('[Logout] Skipping presence update — permission denied (user likely signed out)');
      } else {
        console.error('[GigStore] updateUserPresence error:', error);
      }
    }
  },

  deleteConversation: async (conversationId, currentUserId) => {
    if (!conversationId || !currentUserId) return;
    
    console.log('[GigChat] Clear chat for user:', currentUserId);
    console.log('[GigChat] conversationId:', conversationId);
    
    const now = serverTimestamp();
    
    await safeFirestoreCall(
      () => setDoc(doc(db, 'gigConversations', conversationId), {
        hiddenFor: arrayUnion(currentUserId),
        [`deletedAtBy.${currentUserId}`]: now
      }, { merge: true }),
      'deleteConversation'
    );
    
    console.log('[GigChat] deletedAtBy updated for user');
  },
}));
