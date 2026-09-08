/*
 * Seed script — populates the local Postgres database with the SAME mock
 * content already used by the frontend (frontend/src/data/*.json), plus a
 * small set of test users for exercising auth locally.
 *
 * Run with: npx prisma db seed   (requires a live DATABASE_URL — see README
 * note in backend/prisma/SEED_CREDENTIALS.md and docs/SEED_CONTENT_NOTES.md)
 */
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient, ProgramAudience, NewsEventType } from '@prisma/client';
import { hashPassword } from '../src/lib/password';

const prisma = new PrismaClient();

const FRONTEND_DATA_DIR = path.resolve(__dirname, '../../frontend/src/data');

function readJson<T>(filename: string): T {
  const filePath = path.join(FRONTEND_DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

interface InnovationJson {
  id: string;
  title: string;
  domain: string;
  year: number;
  summary: string;
  description: string;
  impactMetric: string;
  team: string[];
}

interface EarlyInterventionJson {
  id: string;
  name: string;
  audience: 'Children' | 'Youth' | 'Families';
  description: string;
  timeline: string;
  successIndicators: string[];
  registrationOpen: boolean;
}

interface TeamMemberJson {
  id: string;
  name: string;
  title: string;
  bio: string;
  initials: string;
}

interface NewsEventJson {
  id: string;
  type: 'news' | 'event';
  title: string;
  date: string;
  summary: string;
  body: string;
}

interface TestimonialJson {
  id: string;
  quote: string;
  name: string;
  role: string;
}

interface VolunteerOpportunityJson {
  id: string;
  title: string;
  category: string;
  location: string;
  remote: boolean;
  spotsAvailable: number;
  description: string;
}

const AUDIENCE_MAP: Record<EarlyInterventionJson['audience'], ProgramAudience> = {
  Children: ProgramAudience.CHILDREN,
  Youth: ProgramAudience.YOUTH,
  Families: ProgramAudience.FAMILIES,
};

async function seedInnovations() {
  const innovations = readJson<InnovationJson[]>('innovations.json');
  for (const item of innovations) {
    await prisma.innovation.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        title: item.title,
        description: item.description,
        domain: item.domain,
        year: item.year,
        images: [],
        videoUrl: null,
        impactMetric: item.impactMetric,
        teamMembers: item.team,
      },
    });
  }
  console.log(`Seeded ${innovations.length} innovations`);
}

async function seedEarlyInterventions() {
  const programs = readJson<EarlyInterventionJson[]>('earlyInterventions.json');
  for (const item of programs) {
    await prisma.earlyInterventionProgram.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        name: item.name,
        description: item.description,
        audience: AUDIENCE_MAP[item.audience],
        timelineText: item.timeline,
        successIndicators: item.successIndicators,
        registrationOpen: item.registrationOpen,
      },
    });
  }
  console.log(`Seeded ${programs.length} early intervention programs`);
}

async function seedTeam() {
  const members = readJson<TeamMemberJson[]>('team.json');
  for (const [index, item] of members.entries()) {
    await prisma.teamMember.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        name: item.name,
        title: item.title,
        bio: item.bio,
        photoUrl: null,
        sortOrder: index,
      },
    });
  }
  console.log(`Seeded ${members.length} team members`);
}

async function seedNewsEvents() {
  const items = readJson<NewsEventJson[]>('newsEvents.json');
  for (const item of items) {
    await prisma.newsEvent.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        title: item.title,
        body: item.body,
        type: item.type === 'event' ? NewsEventType.EVENT : NewsEventType.NEWS,
        eventDate: item.type === 'event' ? new Date(item.date) : null,
        imageUrl: null,
        publishedAt: new Date(item.date),
        isFeatured: false,
      },
    });
  }
  console.log(`Seeded ${items.length} news/event items`);
}

async function seedTestimonials() {
  const items = readJson<TestimonialJson[]>('testimonials.json');
  for (const item of items) {
    await prisma.testimonial.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        authorName: item.name,
        relationship: item.role,
        quote: item.quote,
        photoUrl: null,
        isFeatured: false,
      },
    });
  }
  console.log(`Seeded ${items.length} testimonials`);
}

async function seedVolunteerOpportunities() {
  const items = readJson<VolunteerOpportunityJson[]>('volunteerOpportunities.json');
  for (const item of items) {
    await prisma.volunteerOpportunity.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        isRemote: item.remote,
        spotsAvailable: item.spotsAvailable,
        tags: [],
      },
    });
  }
  console.log(`Seeded ${items.length} volunteer opportunities`);
}

// A few community stories so the public Stories page isn't empty on first
// run. Two are pre-APPROVED (visible publicly); one is left PENDING so the
// admin moderation queue has something to review out of the box.
async function seedStories() {
  const stories = [
    {
      id: 'story-maya-aac',
      authorName: 'Renee, parent',
      authorEmail: null,
      title: 'My daughter found her voice',
      body: "For years we struggled to communicate with Maya. The AAC tool from Elevate Minds gave her a way to tell us what she needs — and the first time she 'said' good morning, I cried. It costs us nothing, and it changed everything.",
      status: 'APPROVED' as const,
    },
    {
      id: 'story-james-volunteer',
      authorName: 'James, volunteer',
      authorEmail: null,
      title: 'Volunteering that actually helps',
      body: "I've volunteered in a lot of places, but here I can see exactly where my time goes. Helping test the early-screening tool with real families reminded me why this work matters.",
      status: 'APPROVED' as const,
    },
    {
      id: 'story-pending-example',
      authorName: 'A community member',
      authorEmail: 'submitter@example.com',
      title: 'A story awaiting review',
      body: "This is an example of a freshly submitted story. It stays hidden from the public Stories page until an admin approves it in the Stories moderation queue.",
      status: 'PENDING' as const,
    },
  ];

  for (const s of stories) {
    await prisma.story.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }
  console.log(`Seeded ${stories.length} stories`);
}

// Dev-only test accounts. Passwords are documented in
// backend/prisma/SEED_CREDENTIALS.md (gitignored, local use only).
async function seedUsers() {
  const users = [
    {
      email: 'admin@elevateminds.test',
      password: 'AdminDev!2026',
      firstName: 'Ada',
      lastName: 'Admin',
      role: 'ADMIN' as const,
    },
    {
      email: 'user@elevateminds.test',
      password: 'UserDev!2026',
      firstName: 'Uma',
      lastName: 'User',
      role: 'USER' as const,
    },
    {
      email: 'contributor@elevateminds.test',
      password: 'ContributorDev!2026',
      firstName: 'Cole',
      lastName: 'Contributor',
      role: 'CONTRIBUTOR' as const,
    },
  ];

  for (const u of users) {
    const passwordHash = await hashPassword(u.password);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        emailVerified: true,
      },
    });
  }
  console.log(`Seeded ${users.length} test users`);
}

async function main() {
  await seedInnovations();
  await seedEarlyInterventions();
  await seedTeam();
  await seedNewsEvents();
  await seedTestimonials();
  await seedVolunteerOpportunities();
  await seedStories();
  await seedUsers();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
