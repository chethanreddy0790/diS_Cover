import { College, EventPost, FeedPage, StudentProfile } from "../types";
import { PAGE_SIZE } from "../utils/constants";
import { getEmailDomain, inferCollegeNameFromDomain } from "../utils/validation";

export const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const resolveCollegeFromEmail = (colleges: College[], email: string) => {
  const domain = getEmailDomain(email);
  const directMatch = colleges.find((college) => college.domain === domain);

  if (directMatch) {
    return directMatch;
  }

  return {
    id: domain.replace(/[^a-z0-9]+/gi, "-"),
    name: inferCollegeNameFromDomain(domain),
    domain,
    city: "Campus",
    color: "#2563EB",
    description: "Imported from a verified college email domain.",
    followers: 0,
  } satisfies College;
};

const scorePost = (post: EventPost, profile: StudentProfile | null) => {
  if (!profile) {
    return new Date(post.createdAt).getTime();
  }

  let score = 0;
  const eventDelta = new Date(post.eventDate).getTime() - Date.now();

  if (profile.followingStudents.includes(post.authorId)) {
    score += 60;
  }

  if (profile.followingColleges.includes(post.collegeId)) {
    score += 40;
  }

  if (profile.collegeId === post.collegeId) {
    score += 24;
  }

  if (eventDelta > 0) {
    score += Math.max(0, 30 - Math.round(eventDelta / 86400000) * 4);
  }

  score += post.likes.length * 2;
  score += post.comments.length * 3;
  score += post.rsvpCount;

  return score;
};

export const personalizeFeed = (
  posts: EventPost[],
  profile: StudentProfile | null,
  filter: string,
) => {
  const filtered = posts.filter((post) => {
    if (filter === "all") {
      return true;
    }

    if (filter === "following") {
      if (!profile) {
        return true;
      }

      return (
        profile.followingStudents.includes(post.authorId) ||
        profile.followingColleges.includes(post.collegeId)
      );
    }

    return post.collegeId === filter;
  });

  return filtered.sort((left, right) => {
    const scoreDelta = scorePost(right, profile) - scorePost(left, profile);
    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    const eventDelta =
      new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime();
    if (eventDelta !== 0) {
      return eventDelta;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
};

export const paginate = <T>(items: T[], page: number, pageSize = PAGE_SIZE): FeedPage => {
  const start = page * pageSize;
  const nextItems = items.slice(start, start + pageSize);
  const nextPage = start + pageSize < items.length ? page + 1 : null;

  return {
    items: nextItems as never[],
    hasMore: nextPage !== null,
    nextPage,
  };
};

/**
 * Resolves a user's avatar URL from various possible fields.
 * Order: avatar -> photoURL -> profilePic -> image -> initials fallback
 */
export const resolveUserAvatar = (user: any) => {
  if (!user) return null;
  
  const avatarUrl = user.avatar || user.photoURL || user.profilePic || user.image;
  
  if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  
  // Fallback to initials avatar
  const name = user.username || user.name || user.fullName || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=150`;
};
