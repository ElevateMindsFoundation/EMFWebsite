export interface Innovation {
  id: string;
  title: string;
  domain: InnovationDomain;
  year: number;
  summary: string;
  description: string;
  impactMetric: string;
  team: string[];
}

export type InnovationDomain =
  | 'AI for Learning'
  | 'Assistive AI Devices'
  | 'Early Diagnosis & Intervention'
  | 'Community & Training'
  | 'Deaf & Hearing Support'
  | 'Non-Verbal / AAC Support';

export type ProgramAudience = 'Children' | 'Youth' | 'Families';

export interface EarlyInterventionProgram {
  id: string;
  name: string;
  audience: ProgramAudience;
  description: string;
  timeline: string;
  successIndicators: string[];
  registrationOpen: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  initials: string;
}

export type NewsEventType = 'news' | 'event';

export interface NewsEventItem {
  id: string;
  type: NewsEventType;
  title: string;
  date: string;
  summary: string;
  body: string;
}

export interface VolunteerOpportunity {
  id: string;
  title: string;
  category: string;
  location: string;
  remote: boolean;
  spotsAvailable: number;
  description: string;
}

// ---------------------------------------------------------------------------
// API response shapes (Phase D) — these mirror backend/prisma/schema.prisma
// field names exactly, which differ slightly from the mock-JSON shapes above
// (e.g. `team` -> `teamMembers`, `timeline` -> `timelineText`, and the
// audience/domain values are the Prisma enum's SCREAMING_CASE members rather
// than the JSON's title-cased strings). Used by pages that fetch live data
// instead of importing from src/data/*.json.
export interface ApiInnovation {
  id: string;
  title: string;
  description: string;
  domain: string;
  year: number;
  images: string[];
  videoUrl: string | null;
  impactMetric: string;
  teamMembers: string[];
  createdAt: string;
}

export type ApiProgramAudience = 'CHILDREN' | 'YOUTH' | 'FAMILIES';

export interface ApiEarlyInterventionProgram {
  id: string;
  name: string;
  description: string;
  audience: ApiProgramAudience;
  timelineText: string;
  successIndicators: string[];
  registrationOpen: boolean;
  startDate: string | null;
  endDate: string | null;
}

// ---------------------------------------------------------------------------
// Phase E (admin portal) — API response shapes for the remaining entities the
// public site still reads from mock JSON (news/events, team, testimonials,
// volunteer opportunities) plus admin-only entities (contact messages,
// volunteer hour approval queue, dashboard stats). These mirror
// backend/prisma/schema.prisma field names exactly, same convention as the
// ApiInnovation/ApiEarlyInterventionProgram shapes above.
export type ApiNewsEventType = 'NEWS' | 'EVENT';

export interface ApiNewsEvent {
  id: string;
  title: string;
  body: string;
  type: ApiNewsEventType;
  eventDate: string | null;
  imageUrl: string | null;
  publishedAt: string;
  isFeatured: boolean;
}

export interface ApiTeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string | null;
  sortOrder: number;
}

export interface ApiTestimonial {
  id: string;
  authorName: string;
  relationship: string;
  quote: string;
  photoUrl: string | null;
  isFeatured: boolean;
}

export interface ApiVolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  isRemote: boolean;
  spotsAvailable: number;
  tags: string[];
}

export type ApiStoryStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// A community-submitted story. Anyone can POST one (it lands as PENDING); the
// public site lists only APPROVED stories. authorEmail is optional and never
// exposed on the public list endpoint — it's for admins to follow up only.
export interface ApiStory {
  id: string;
  authorName: string;
  title: string;
  body: string;
  status: ApiStoryStatus;
  authorEmail: string | null;
  createdAt: string;
}

export interface ApiContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  isRead: boolean;
}

export type ApiHourLogStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// As returned by GET /api/volunteer/hours/all (admin). `hours` comes back as
// a string because Prisma's Decimal type serializes to JSON as a string, not
// a number — same note as the /hours/mine shape in pages/Volunteer.tsx.
export interface ApiAdminVolunteerHourLog {
  id: string;
  userId: string | null;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
  opportunityId: string;
  opportunity: { id: string; title: string };
  date: string;
  hours: string;
  notes: string | null;
  status: ApiHourLogStatus;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  pendingVolunteerHours: number;
  unreadContactMessages: number;
  pendingStories: number;
  totalDonations: number;
  totalDonationAmountCents: number;
}
