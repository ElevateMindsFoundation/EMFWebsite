import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, notFound } from '../lib/errors';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

// POST /api/contact — public contact form submission
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');
    const message = await prisma.contactMessage.create({ data: parsed.data });
    res.status(201).json({ message });
  }),
);

// GET /api/contact — admin: list all contact messages
router.get(
  '/',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (_req, res) => {
    const messages = await prisma.contactMessage.findMany({ orderBy: { submittedAt: 'desc' } });
    res.json({ messages });
  }),
);

// POST /api/contact/:id/read — admin: mark a message as read
router.post(
  '/:id/read',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const existing = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Contact message not found');
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ message });
  }),
);

export default router;
