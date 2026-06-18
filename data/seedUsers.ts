import type { User } from '../store/useStore';

export const seedUsers: User[] = [
  { id: 'u1', username: 'rahul_codes', email: 'rahul@caias.in', password: 'password123', collegeName: 'CAIAS', designation: 'Student', bio: 'Full-stack developer with a passion for AI.', interests: ['AI', 'Tech'], savedEvents: [], savedGigs: [], image: 'https://i.pravatar.cc/150?u=u1' },
  { id: 'u2', username: 'priya_arts', email: 'priya@caias.in', password: 'password123', collegeName: 'CAIAS', designation: 'Student', bio: 'Digital artist and UI designer.', interests: ['Design', 'Cultural'], savedEvents: [], savedGigs: [], image: 'https://i.pravatar.cc/150?u=u2' },
  { id: 'u3', username: 'admin_tech', email: 'admin@caias.in', password: 'password123', collegeName: 'CAIAS', designation: 'Organizer', bio: 'Tech Club coordinator.', interests: ['Hackathons', 'Tech'], savedEvents: [], savedGigs: [], image: 'https://i.pravatar.cc/150?u=u3' },
  { id: 'u4', username: 'music_man', email: 'music@caias.in', password: 'password123', collegeName: 'CAIAS', designation: 'Student', bio: 'Aspiring musician and drummer.', interests: ['Music'], savedEvents: [], savedGigs: [], image: 'https://i.pravatar.cc/150?u=u4' },
  { id: 'u5', username: 'sports_star', email: 'aniket@caias.in', password: 'password123', collegeName: 'CAIAS', designation: 'Student', bio: 'Loves football and marathons.', interests: ['Sports'], savedEvents: [], savedGigs: [], image: 'https://i.pravatar.cc/150?u=u5' },
  { id: 'u6', username: 'design_diva', email: 'sara@caias.in', password: 'password123', collegeName: 'CAIAS', designation: 'Student', bio: 'Visual storyteller.', interests: ['Design'], savedEvents: [], savedGigs: [], image: 'https://i.pravatar.cc/150?u=u6' },
  { id: 'u7', username: 'hacker_x', email: 'hacker@caias.in', password: 'password123', collegeName: 'CAIAS', designation: 'Student', bio: 'Cybersecurity enthusiast.', interests: ['Hackathons'], savedEvents: [], savedGigs: [], image: 'https://i.pravatar.cc/150?u=u7' },
  { id: 'u8', username: 'event_guru', email: 'guru@caias.in', password: 'password123', collegeName: 'CAIAS', designation: 'Organizer', bio: 'Managing the biggest college events.', interests: ['Cultural', 'Music'], savedEvents: [], savedGigs: [], image: 'https://i.pravatar.cc/150?u=u8' },
];
