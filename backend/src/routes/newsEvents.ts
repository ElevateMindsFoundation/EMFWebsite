import { Router } from 'express';
import { z } from 'zod';
import { NewsEventType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, notFound } from '../lib/errors';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/news-events?type=NEWS|EVENT&featured=true
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { type, featured } = req.query;
    const where: Record<string, unknown> = {};
    if (typeof type === 'string') {
      const upper = type.toUpperCase();
      if (!Object.values(NewsEventType).includes(upper as NewsEventType)) {
        throw badRequest('Invalid type filter');
      }
      where.type = upper;
    }
    if (typeof featured === 'string') where.isFeatured = featured === 'true';

    const items = await prisma.newsEvent.findMany({ where, orderBy: { publishedAt: 'desc' } });
    res.json({ items });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await prisma.newsEvent.findUnique({ where: { id: req.params.id } });
    if (!item) throw notFound('News/event item not found');
    res.json({ item });
  }),
);

const newsEventSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  type: z.nativeEnum(NewsEventType),
  eventDate: z.string().datetime().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  isFeatured: z.boolean().default(false),
});

router.post(
  '/',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = newsEventSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');
    const { eventDate, ...rest } = parsed.data;
    const item = await prisma.newsEvent.create({
      data: { ...rest, eventDate: eventDate ? new Date(eventDate) : undefined },
    });
    res.status(201).json({ item });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = newsEventSchema.partial().safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');

    const existing = await prisma.newsEvent.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('News/event item not found');

    const { eventDate, ...rest } = parsed.data;
    const item = await prisma.newsEvent.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        eventDate: eventDate === undefined ? undefined : eventDate ? new Date(eventDate) : null,
      },
    });
    res.json({ item });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const existing = await prisma.newsEvent.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('News/event item not found');
    await prisma.newsEvent.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

export default router;
