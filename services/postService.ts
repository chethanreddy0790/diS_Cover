import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import {
  AppNotification,
  CreatePostInput,
  EventComment,
  EventPost,
  FeedPage,
  StudentProfile,
} from "../types";
import { db, isFirebaseConfigured } from "./firebase";
import { mutateMockDb, readMockDb, simulateLatency } from "./mockDb";
import { createId, paginate, personalizeFeed } from "./serviceUtils";

const sortNewest = (posts: EventPost[]) =>
  posts.sort((left, right) => right.createdAt.localeCompare(left.createdAt));

const createNotificationPayload = (
  type: "like" | "comment",
  actor: StudentProfile,
  post: EventPost,
): AppNotification => ({
  id: createId("notification"),
  recipientId: post.authorId,
  actorId: actor.id,
  actorName: actor.name,
  actorAvatarUrl: actor.avatarUrl,
  type,
  postId: post.id,
  postTitle: post.title,
  message: type === "like" ? "liked your event post." : "commented on your event post.",
  createdAt: new Date().toISOString(),
  read: false,
});

export const fetchFeedPage = async (
  profile: StudentProfile | null,
  page: number,
  filter: string,
): Promise<FeedPage> => {
  if (isFirebaseConfigured) {
    if (!db) {
      throw new Error("Firebase is not available.");
    }

    const snapshot = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
    const posts = snapshot.docs.map((item) => item.data() as EventPost);
    return paginate(personalizeFeed(posts, profile, filter), page);
  }

  await simulateLatency();
  const mockDb = await readMockDb();
  return paginate(personalizeFeed(mockDb.posts, profile, filter), page);
};

export const fetchPostsByAuthor = async (authorId: string) => {
  if (isFirebaseConfigured) {
    if (!db) {
      throw new Error("Firebase is not available.");
    }

    const snapshot = await getDocs(
      query(collection(db, "posts"), where("authorId", "==", authorId), orderBy("createdAt", "desc")),
    );
    return snapshot.docs.map((item) => item.data() as EventPost);
  }

  await simulateLatency();
  const mockDb = await readMockDb();
  return sortNewest(mockDb.posts.filter((post) => post.authorId === authorId));
};

export const createPost = async (author: StudentProfile, input: CreatePostInput) => {
  const newPost: EventPost = {
    id: createId("post"),
    authorId: author.id,
    authorName: author.name,
    authorAvatarUrl: author.avatarUrl,
    authorHeadline: author.headline,
    collegeId: author.collegeId,
    collegeName: author.collegeName,
    title: input.title.trim(),
    description: input.description.trim(),
    imageUrl: input.imageUrl,
    eventDate: input.eventDate,
    location: input.location.trim(),
    createdAt: new Date().toISOString(),
    likes: [],
    comments: [],
    shares: 0,
    attendeeIds: [],
    rsvpCount: 0,
    tags: input.tags,
  };

  if (isFirebaseConfigured) {
    if (!db) {
      throw new Error("Firebase is not available.");
    }

    await setDoc(doc(db, "posts", newPost.id), newPost);
    return newPost;
  }

  await simulateLatency();
  await mutateMockDb((mockDb) => {
    mockDb.posts.unshift(newPost);
  });

  return newPost;
};

export const toggleLikePost = async (postId: string, actor: StudentProfile) => {
  if (isFirebaseConfigured) {
    if (!db) {
      throw new Error("Firebase is not available.");
    }

    const postRef = doc(db, "posts", postId);
    const postSnapshot = await getDoc(postRef);
    const post = postSnapshot.data() as EventPost | undefined;
    if (!post) {
      throw new Error("This event post no longer exists.");
    }

    const liked = post.likes.includes(actor.id);
    await setDoc(postRef, {
      likes: liked ? arrayRemove(actor.id) : arrayUnion(actor.id),
    }, { merge: true });

    if (!liked && post.authorId !== actor.id) {
      const notification = createNotificationPayload("like", actor, post);
      await setDoc(doc(db, "notifications", notification.id), notification);
    }

    const refreshed = await getDoc(postRef);
    return refreshed.data() as EventPost;
  }

  await simulateLatency();
  const { result } = await mutateMockDb((mockDb) => {
    const post = mockDb.posts.find((item) => item.id === postId);
    if (!post) {
      throw new Error("This event post no longer exists.");
    }

    const liked = post.likes.includes(actor.id);
    post.likes = liked
      ? post.likes.filter((id) => id !== actor.id)
      : [...post.likes, actor.id];

    if (!liked && post.authorId !== actor.id) {
      mockDb.notifications.unshift(createNotificationPayload("like", actor, post));
    }

    return post;
  });

  return result;
};

export const addCommentToPost = async (
  postId: string,
  actor: StudentProfile,
  text: string,
) => {
  const comment: EventComment = {
    id: createId("comment"),
    authorId: actor.id,
    authorName: actor.name,
    authorAvatarUrl: actor.avatarUrl,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured) {
    if (!db) {
      throw new Error("Firebase is not available.");
    }

    const postRef = doc(db, "posts", postId);
    const postSnapshot = await getDoc(postRef);
    const post = postSnapshot.data() as EventPost | undefined;
    if (!post) {
      throw new Error("This event post no longer exists.");
    }

    await setDoc(postRef, {
      comments: arrayUnion(comment),
    }, { merge: true });

    if (post.authorId !== actor.id) {
      const notification = createNotificationPayload("comment", actor, post);
      await setDoc(doc(db, "notifications", notification.id), notification);
    }

    const refreshed = await getDoc(postRef);
    return refreshed.data() as EventPost;
  }

  await simulateLatency();
  const { result } = await mutateMockDb((mockDb) => {
    const post = mockDb.posts.find((item) => item.id === postId);
    if (!post) {
      throw new Error("This event post no longer exists.");
    }

    post.comments = [...post.comments, comment];

    if (post.authorId !== actor.id) {
      mockDb.notifications.unshift(createNotificationPayload("comment", actor, post));
    }

    return post;
  });

  return result;
};

export const incrementShareCount = async (postId: string) => {
  if (isFirebaseConfigured) {
    if (!db) {
      throw new Error("Firebase is not available.");
    }

    const postRef = doc(db, "posts", postId);
    await setDoc(postRef, {
      shares: increment(1),
    }, { merge: true });
    const refreshed = await getDoc(postRef);
    return refreshed.data() as EventPost;
  }

  await simulateLatency();
  const { result } = await mutateMockDb((mockDb) => {
    const post = mockDb.posts.find((item) => item.id === postId);
    if (!post) {
      throw new Error("This event post no longer exists.");
    }

    post.shares += 1;
    return post;
  });

  return result;
};

export const togglePostRsvp = async (postId: string, userId: string) => {
  if (isFirebaseConfigured) {
    if (!db) {
      throw new Error("Firebase is not available.");
    }

    const postRef = doc(db, "posts", postId);
    const postSnapshot = await getDoc(postRef);
    const post = postSnapshot.data() as EventPost | undefined;
    if (!post) {
      throw new Error("This event post no longer exists.");
    }

    const attending = post.attendeeIds.includes(userId);
    await setDoc(postRef, {
      attendeeIds: attending ? arrayRemove(userId) : arrayUnion(userId),
      rsvpCount: increment(attending ? -1 : 1),
    }, { merge: true });

    const refreshed = await getDoc(postRef);
    return refreshed.data() as EventPost;
  }

  await simulateLatency();
  const { result } = await mutateMockDb((mockDb) => {
    const post = mockDb.posts.find((item) => item.id === postId);
    if (!post) {
      throw new Error("This event post no longer exists.");
    }

    const attending = post.attendeeIds.includes(userId);
    post.attendeeIds = attending
      ? post.attendeeIds.filter((id) => id !== userId)
      : [...post.attendeeIds, userId];
    post.rsvpCount += attending ? -1 : 1;

    return post;
  });

  return result;
};
