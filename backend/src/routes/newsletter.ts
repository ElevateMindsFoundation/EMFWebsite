import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, conflict } from '../lib/errors';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

const subscribeSchema = z.object({ email: z.string().email() });

// POST /api/newsletter — public subscribe
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = subscribeSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('A valid email is required');

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: parsed.data.email } });
    if (existing) throw conflict('This email is already subscribed');

    const subscriber = await prisma.newsletterSubscriber.create({ data: { email: parsed.data.email } });
    res.status(201).json({ subscriber });
  }),
);

// GET /api/newsletter — admin: list all subscribers
router.get(
  '/',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (_req, res) => {
    const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { subscribedAt: 'desc' } });
    res.json({ subscribers });
  }),
);

export default router;
