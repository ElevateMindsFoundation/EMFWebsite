import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, notFound } from '../lib/errors';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/team — public list, ordered for display
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const members = await prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ members });
  }),
);

const teamMemberSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  bio: z.string().min(1),
  photoUrl: z.string().url().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

router.post(
  '/',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = teamMemberSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');
    const member = await prisma.teamMember.create({ data: parsed.data });
    res.status(201).json({ member });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = teamMemberSchema.partial().safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');

    const existing = await prisma.teamMember.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Team member not found');

    const member = await prisma.teamMember.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ member });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const existing = await prisma.teamMember.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Team member not found');
    await prisma.teamMember.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

export default router;
