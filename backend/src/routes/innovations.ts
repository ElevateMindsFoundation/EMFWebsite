import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, notFound } from '../lib/errors';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/innovations?domain=...&year=...
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { domain, year } = req.query;
    const where: Record<string, unknown> = {};
    if (typeof domain === 'string') where.domain = domain;
    if (typeof year === 'string') {
      const parsedYear = Number(year);
      if (Number.isNaN(parsedYear)) throw badRequest('year must be a number');
      where.year = parsedYear;
    }

    const innovations = await prisma.innovation.findMany({
      where,
      orderBy: { year: 'desc' },
    });
    res.json({ innovations });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const innovation = await prisma.innovation.findUnique({ where: { id: req.params.id } });
    if (!innovation) throw notFound('Innovation not found');
    res.json({ innovation });
  }),
);

const innovationSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  domain: z.string().min(1),
  year: z.number().int(),
  images: z.array(z.string()).default([]),
  videoUrl: z.string().url().nullable().optional(),
  impactMetric: z.string().min(1),
  teamMembers: z.array(z.string()).default([]),
});

router.post(
  '/',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = innovationSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');
    const innovation = await prisma.innovation.create({ data: parsed.data });
    res.status(201).json({ innovation });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = innovationSchema.partial().safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');

    const existing = await prisma.innovation.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Innovation not found');

    const innovation = await prisma.innovation.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json({ innovation });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const existing = await prisma.innovation.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Innovation not found');

    await prisma.innovation.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

export default router;
