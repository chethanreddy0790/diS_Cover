import { AppNotification, College, EventPost, StudentProfile } from "../types";

export interface MockDbState {
  colleges: College[];
  profiles: StudentProfile[];
  posts: EventPost[];
  notifications: AppNotification[];
  credentials: Record<string, string>;
  sessionUserId: string | null;
}

const futureDate = (daysFromNow: number, hour: number, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const pastDate = (daysAgo: number, hour: number, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const colleges: College[] = [
  {
    id: "westfield",
    name: "Westfield University",
    domain: "westfield.edu",
    city: "Boston",
    color: "#2563EB",
    description: "A student-first campus known for design, entrepreneurship, and packed club calendars.",
    followers: 1320,
  },
  {
    id: "harbortech",
    name: "Harbor Tech Institute",
    domain: "harbortech.edu",
    city: "Seattle",
    color: "#0F766E",
    description: "Engineering-heavy campus with weekly hack nights and maker culture.",
    followers: 980,
  },
  {
    id: "greenridge",
    name: "Greenridge College",
    domain: "greenridge.edu",
    city: "Austin",
    color: "#EA580C",
    description: "Creative, community-driven campus with music, sports, and cultural events.",
    followers: 1102,
  },
];

const profiles: StudentProfile[] = [
  {
    id: "student-1",
    email: "maya@westfield.edu",
    name: "Maya Chen",
    collegeId: "westfield",
    collegeName: "Westfield University",
    avatarUrl: "https://i.pravatar.cc/300?img=32",
    bio: "CS senior building campus tools and documenting the best student-led events.",
    headline: "Product Design Club Lead",
    graduationYear: 2026,
    followers: ["student-2", "student-3"],
    followingStudents: ["student-2"],
    followingColleges: ["westfield", "greenridge"],
    profileCompleted: true,
  },
  {
    id: "student-2",
    email: "aarav@harbortech.edu",
    name: "Aarav Patel",
    collegeId: "harbortech",
    collegeName: "Harbor Tech Institute",
    avatarUrl: "https://i.pravatar.cc/300?img=12",
    bio: "Robotics builder, hackathon organizer, and espresso-powered systems thinker.",
    headline: "Robotics Society President",
    graduationYear: 2025,
    followers: ["student-1"],
    followingStudents: ["student-1", "student-3"],
    followingColleges: ["harbortech"],
    profileCompleted: true,
  },
  {
    id: "student-3",
    email: "sofia@greenridge.edu",
    name: "Sofia Alvarez",
    collegeId: "greenridge",
    collegeName: "Greenridge College",
    avatarUrl: "https://i.pravatar.cc/300?img=47",
    bio: "Culture committee volunteer sharing music nights, showcases, and wellness events.",
    headline: "Student Activities Ambassador",
    graduationYear: 2027,
    followers: ["student-1"],
    followingStudents: ["student-1"],
    followingColleges: ["greenridge", "westfield"],
    profileCompleted: true,
  },
];

const posts: EventPost[] = [
  {
    id: "post-1",
    authorId: "student-1",
    authorName: "Maya Chen",
    authorAvatarUrl: "https://i.pravatar.cc/300?img=32",
    authorHeadline: "Product Design Club Lead",
    collegeId: "westfield",
    collegeName: "Westfield University",
    title: "Spring Founder Showcase",
    description:
      "Student startups are pitching prototypes, live demos, and AI tools at the innovation hub. Recruiters and alumni mentors will join the Q&A.",
    imageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    eventDate: futureDate(2, 17, 30),
    location: "Innovation Hub, Block C",
    createdAt: pastDate(1, 10, 15),
    likes: ["student-2", "student-3"],
    comments: [
      {
        id: "comment-1",
        authorId: "student-2",
        authorName: "Aarav Patel",
        authorAvatarUrl: "https://i.pravatar.cc/300?img=12",
        text: "Bringing two first-year founders along. This looks strong.",
        createdAt: pastDate(1, 12, 0),
      },
    ],
    shares: 18,
    attendeeIds: ["student-2", "student-3"],
    rsvpCount: 64,
    tags: ["startup", "networking", "demo-day"],
  },
  {
    id: "post-2",
    authorId: "student-2",
    authorName: "Aarav Patel",
    authorAvatarUrl: "https://i.pravatar.cc/300?img=12",
    authorHeadline: "Robotics Society President",
    collegeId: "harbortech",
    collegeName: "Harbor Tech Institute",
    title: "Midnight Hardware Hack",
    description:
      "Build for six hours, ship a prototype before sunrise, and win sponsored parts kits. Hardware benches and soldering stations stay open all night.",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    eventDate: futureDate(4, 21, 0),
    location: "Engineering Lab 4A",
    createdAt: pastDate(1, 8, 45),
    likes: ["student-1"],
    comments: [
      {
        id: "comment-2",
        authorId: "student-1",
        authorName: "Maya Chen",
        authorAvatarUrl: "https://i.pravatar.cc/300?img=32",
        text: "The poster alone convinced me. See you there.",
        createdAt: pastDate(1, 9, 30),
      },
    ],
    shares: 12,
    attendeeIds: ["student-1"],
    rsvpCount: 41,
    tags: ["hackathon", "engineering", "night-event"],
  },
  {
    id: "post-3",
    authorId: "student-3",
    authorName: "Sofia Alvarez",
    authorAvatarUrl: "https://i.pravatar.cc/300?img=47",
    authorHeadline: "Student Activities Ambassador",
    collegeId: "greenridge",
    collegeName: "Greenridge College",
    title: "Open Air Music Night",
    description:
      "An acoustic sunset session with student bands, food trucks, and a curated thrift pop-up by the arts council.",
    imageUrl:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    eventDate: futureDate(1, 18, 0),
    location: "Central Lawn",
    createdAt: pastDate(0, 13, 20),
    likes: ["student-1", "student-2"],
    comments: [],
    shares: 24,
    attendeeIds: ["student-1", "student-2"],
    rsvpCount: 88,
    tags: ["music", "culture", "social"],
  },
  {
    id: "post-4",
    authorId: "student-1",
    authorName: "Maya Chen",
    authorAvatarUrl: "https://i.pravatar.cc/300?img=32",
    authorHeadline: "Product Design Club Lead",
    collegeId: "westfield",
    collegeName: "Westfield University",
    title: "Product Portfolio Review",
    description:
      "Design mentors are reviewing internship portfolios and giving live feedback on story arcs, decks, and case study framing.",
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    eventDate: futureDate(6, 15, 0),
    location: "Library Studio 2",
    createdAt: pastDate(2, 11, 10),
    likes: ["student-3"],
    comments: [],
    shares: 7,
    attendeeIds: [],
    rsvpCount: 23,
    tags: ["career", "design", "mentorship"],
  },
  {
    id: "post-5",
    authorId: "student-2",
    authorName: "Aarav Patel",
    authorAvatarUrl: "https://i.pravatar.cc/300?img=12",
    authorHeadline: "Robotics Society President",
    collegeId: "harbortech",
    collegeName: "Harbor Tech Institute",
    title: "Women in Systems Panel",
    description:
      "Faculty, alumni, and student builders are sharing paths into embedded systems, ML infra, and product leadership.",
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    eventDate: futureDate(8, 16, 30),
    location: "North Auditorium",
    createdAt: pastDate(3, 14, 5),
    likes: ["student-1", "student-3"],
    comments: [],
    shares: 16,
    attendeeIds: ["student-3"],
    rsvpCount: 37,
    tags: ["career", "panel", "community"],
  },
  {
    id: "post-6",
    authorId: "student-3",
    authorName: "Sofia Alvarez",
    authorAvatarUrl: "https://i.pravatar.cc/300?img=47",
    authorHeadline: "Student Activities Ambassador",
    collegeId: "greenridge",
    collegeName: "Greenridge College",
    title: "Basketball Watch Party",
    description:
      "Student union is screening the conference semi-final with free popcorn, halftime trivia, and merch giveaways.",
    imageUrl:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
    eventDate: futureDate(3, 19, 15),
    location: "Union Commons",
    createdAt: pastDate(0, 9, 10),
    likes: [],
    comments: [],
    shares: 5,
    attendeeIds: [],
    rsvpCount: 29,
    tags: ["sports", "community"],
  },
];

const notifications: AppNotification[] = [
  {
    id: "notification-1",
    recipientId: "student-1",
    actorId: "student-2",
    actorName: "Aarav Patel",
    actorAvatarUrl: "https://i.pravatar.cc/300?img=12",
    type: "comment",
    postId: "post-1",
    postTitle: "Spring Founder Showcase",
    message: "commented on your event post.",
    createdAt: pastDate(0, 12, 45),
    read: false,
  },
  {
    id: "notification-2",
    recipientId: "student-1",
    actorId: "student-3",
    actorName: "Sofia Alvarez",
    actorAvatarUrl: "https://i.pravatar.cc/300?img=47",
    type: "like",
    postId: "post-4",
    postTitle: "Product Portfolio Review",
    message: "liked your event post.",
    createdAt: pastDate(1, 18, 10),
    read: true,
  },
];

const credentials: Record<string, string> = {
  "maya@westfield.edu": "Password123!",
  "aarav@harbortech.edu": "Password123!",
  "sofia@greenridge.edu": "Password123!",
};

export const buildInitialMockState = (): MockDbState => ({
  colleges: JSON.parse(JSON.stringify(colleges)),
  profiles: JSON.parse(JSON.stringify(profiles)),
  posts: JSON.parse(JSON.stringify(posts)),
  notifications: JSON.parse(JSON.stringify(notifications)),
  credentials: { ...credentials },
  sessionUserId: "student-1",
});
