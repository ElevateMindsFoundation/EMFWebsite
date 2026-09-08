import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, notFound } from '../lib/errors';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Fields safe to expose on the PUBLIC story list. authorEmail is intentionally
// omitted so a submitter's email is never leaked to site visitors.
const PUBLIC_STORY_SELECT = {
  id: true,
  authorName: true,
  title: true,
  body: true,
  status: true,
  createdAt: true,
} as const;

// GET /api/stories — public: only APPROVED stories, newest first.
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const stories = await prisma.story.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      select: PUBLIC_STORY_SELECT,
    });
    res.json({ stories });
  }),
);

const storySubmissionSchema = z.object({
  authorName: z.string().min(1).max(120),
  authorEmail: z.string().email().nullable().optional(),
  title: z.string().min(1).max(160),
  body: z.string().min(1).max(8000),
});

// POST /api/stories — public: anyone can submit a story. It lands as PENDING
// and is not shown publicly until an admin approves it. The 201 response only
// echoes the public fields (no status-changing power, no email leak).
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = storySubmissionSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');
    const { authorName, authorEmail, title, body } = parsed.data;
    const story = await prisma.story.create({
      data: { authorName, authorEmail: authorEmail ?? null, title, body },
      select: PUBLIC_STORY_SELECT,
    });
    res.status(201).json({ story });
  }),
);

// GET /api/stories/all?status=PENDING — admin: every story, optionally
// filtered by status, newest first. Includes authorEmail for follow-up.
router.get(
  '/all',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const where: Record<string, unknown> = {};
    if (status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED') {
      where.status = status;
    }
    const stories = await prisma.story.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ stories });
  }),
);

const moderateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING']),
});

// POST /api/stories/:id/moderate — admin: approve/reject (or reset) a story.
router.post(
  '/:id/moderate',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = moderateSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');

    const existing = await prisma.story.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Story not found');

    const story = await prisma.story.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });
    res.json({ story });
  }),
);

// DELETE /api/stories/:id — admin: permanently remove a story.
router.delete(
  '/:id',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const existing = await prisma.story.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Story not found');
    await prisma.story.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

export default router;
