# Seed content notes (Phase C)

`backend/prisma/seed.ts` populates the local database from two sources:

## 1. Doc-sourced / carried over from Phase A frontend mock data

These records are read directly from `frontend/src/data/*.json` (the same JSON already
used to render the static frontend in Phases A/B) and inserted into Postgres so the
frontend and backend agree on content once the frontend is wired up to the API in a
later phase:

- **Innovations** (`innovations.json` -> `Innovation` table) — 6 items: Adaptive Learning
  Paths, AI Communication Board, Eye-Tracking Access Kit, Early Signals Screening Model,
  Sign Language Avatar, Educator AI Literacy Toolkit. Titles, descriptions, impact metrics,
  and team member names are placeholder/representative content written for this build, not
  drawn from a real deployed program.
- **Early Intervention Programs** (`earlyInterventions.json` -> `EarlyInterventionProgram`)
  — 6 programs across Children/Youth/Families audiences.
- **Team members** (`team.json` -> `TeamMember`) — 5 placeholder staff bios/titles.
- **News & events** (`newsEvents.json` -> `NewsEvent`) — 5 items, mix of news posts and
  upcoming events with dates in 2026.
- **Testimonials** (`testimonials.json` -> `Testimonial`) — 4 quotes, attributed generically
  (e.g. "Parent of a program participant") rather than to named individuals.
- **Volunteer opportunities** (`volunteerOpportunities.json` -> `VolunteerOpportunity`) — 5
  roles across remote and Cary, NC on-site positions.

None of the above is real organizational data — Elevate Minds Foundation's actual programs,
staff, and impact numbers should replace all of it before any production launch. Treat every
seeded row as a content placeholder that mirrors the structure the real content will need to
fill.

## 2. Newly added for the backend (not present in frontend JSON)

- **Test user accounts** (`User` table) — one `ADMIN`, one `USER`, one `CONTRIBUTOR`, all with
  `emailVerified: true` and dev-only passwords. Credentials are documented in
  `backend/prisma/SEED_CREDENTIALS.md` (gitignored, local use only — never commit or reuse
  these passwords anywhere else).
- **Contact messages, newsletter subscribers, donations, volunteer hour logs, program
  registrations** are intentionally left empty by the seed script — these are
  transactional/user-generated tables that should start empty rather than pre-filled with
  fake submissions.

## Fields on the Prisma models with no frontend JSON equivalent

A few `Innovation` and `NewsEvent` fields exist in the schema but have no source data in the
frontend JSON, so the seed leaves them empty/null:

- `Innovation.images` — seeded as `[]` (frontend has no image URLs yet).
- `Innovation.videoUrl` — seeded as `null`.
- `TeamMember.photoUrl`, `Testimonial.photoUrl` — seeded as `null` (frontend uses generated
  initials/avatars instead of real photos, see `InitialsAvatar.tsx`).
- `NewsEvent.imageUrl` — seeded as `null`.
- `NewsEvent.isFeatured` — defaulted to `false` for all seeded items (no "featured" flag
  existed in the Phase A mock data).
