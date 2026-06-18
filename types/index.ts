export interface College {
  id: string;
  name: string;
  domain: string;
  city: string;
  color: string;
  description: string;
  followers: number;
}

export interface StudentProfile {
  id: string;
  email: string;
  name: string;
  collegeId: string;
  collegeName: string;
  avatarUrl?: string;
  bio: string;
  headline: string;
  graduationYear?: number | null;
  followers: string[];
  followingStudents: string[];
  followingColleges: string[];
  profileCompleted: boolean;
}

export interface EventComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  text: string;
  createdAt: string;
}

export interface EventPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorHeadline?: string;
  collegeId: string;
  collegeName: string;
  title: string;
  description: string;
  imageUrl?: string;
  eventDate: string;
  location: string;
  createdAt: string;
  likes: string[];
  comments: EventComment[];
  shares: number;
  attendeeIds: string[];
  rsvpCount: number;
  tags: string[];
}

export interface AppNotification {
  id: string;
  recipientId: string;
  actorId: string;
  actorName: string;
  actorAvatarUrl?: string;
  type: "like" | "comment";
  postId: string;
  postTitle: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AuthSession {
  id: string;
  email: string;
  profileCompleted: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface ProfileSetupInput {
  name: string;
  collegeId: string;
  bio: string;
  headline: string;
  avatarUrl?: string;
  graduationYear?: number | null;
}

export interface CreatePostInput {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  imageUrl?: string;
  tags: string[];
}

export interface FeedPage {
  items: EventPost[];
  hasMore: boolean;
  nextPage: number | null;
}

export type CollegeFilter = "all" | "following" | string;

export interface SearchResult {
  students: StudentProfile[];
  colleges: College[];
}
