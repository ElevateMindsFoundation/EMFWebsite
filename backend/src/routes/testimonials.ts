import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, notFound } from '../lib/errors';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/testimonials?featured=true
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { featured } = req.query;
    const where: Record<string, unknown> = {};
    if (typeof featured === 'string') where.isFeatured = featured === 'true';
    const testimonials = await prisma.testimonial.findMany({ where });
    res.json({ testimonials });
  }),
);

const testimonialSchema = z.object({
  authorName: z.string().min(1),
  relationship: z.string().min(1),
  quote: z.string().min(1),
  photoUrl: z.string().url().nullable().optional(),
  isFeatured: z.boolean().default(false),
});

router.post(
  '/',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = testimonialSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');
    const testimonial = await prisma.testimonial.create({ data: parsed.data });
    res.status(201).json({ testimonial });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = testimonialSchema.partial().safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');

    const existing = await prisma.testimonial.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Testimonial not found');

    const testimonial = await prisma.testimonial.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ testimonial });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const existing = await prisma.testimonial.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Testimonial not found');
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

export default router;
