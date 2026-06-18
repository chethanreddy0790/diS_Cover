import type { Event } from '../store/useStore';

export const seedEvents: Event[] = [];

/** All unique categories derived from seed data, plus common ones */
export const EVENT_CATEGORIES = [
  'All',
  'Hackathons',
  'AI',
  'Music',
  'Cultural',
  'Sports',
  'Design',
  'Tech',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
