import { Router } from 'express';
import { z } from 'zod';
import { HourLogStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, notFound } from '../lib/errors';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/volunteer/opportunities?category=...&remote=true
router.get(
  '/opportunities',
  asyncHandler(async (req, res) => {
    const { category, remote } = req.query;
    const where: Record<string, unknown> = {};
    if (typeof category === 'string') where.category = category;
    if (typeof remote === 'string') where.isRemote = remote === 'true';

    const opportunities = await prisma.volunteerOpportunity.findMany({ where, orderBy: { title: 'asc' } });
    res.json({ opportunities });
  }),
);

router.get(
  '/opportunities/:id',
  asyncHandler(async (req, res) => {
    const opportunity = await prisma.volunteerOpportunity.findUnique({ where: { id: req.params.id } });
    if (!opportunity) throw notFound('Volunteer opportunity not found');
    res.json({ opportunity });
  }),
);

const opportunitySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  location: z.string().min(1),
  isRemote: z.boolean().default(false),
  spotsAvailable: z.number().int().min(0),
  tags: z.array(z.string()).default([]),
});

router.post(
  '/opportunities',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = opportunitySchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');
    const opportunity = await prisma.volunteerOpportunity.create({ data: parsed.data });
    res.status(201).json({ opportunity });
  }),
);

router.put(
  '/opportunities/:id',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = opportunitySchema.partial().safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');

    const existing = await prisma.volunteerOpportunity.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Volunteer opportunity not found');

    const opportunity = await prisma.volunteerOpportunity.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json({ opportunity });
  }),
);

router.delete(
  '/opportunities/:id',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const existing = await prisma.volunteerOpportunity.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Volunteer opportunity not found');
    await prisma.volunteerOpportunity.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

// ---------------------------------------------------------------------------
// Hour logs
// ---------------------------------------------------------------------------

const hourLogSchema = z.object({
  opportunityId: z.string().min(1),
  date: z.string().datetime(),
  hours: z.number().positive().max(24),
  notes: z.string().optional(),
});

// POST /api/volunteer/hours — log hours for the authenticated user
router.post(
  '/hours',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = hourLogSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');

    const opportunity = await prisma.volunteerOpportunity.findUnique({
      where: { id: parsed.data.opportunityId },
    });
    if (!opportunity) throw notFound('Volunteer opportunity not found');

    const hourLog = await prisma.volunteerHourLog.create({
      data: {
        userId: req.user!.id,
        opportunityId: parsed.data.opportunityId,
        date: new Date(parsed.data.date),
        hours: parsed.data.hours,
        notes: parsed.data.notes,
      },
    });
    res.status(201).json({ hourLog });
  }),
);

// GET /api/volunteer/hours — the authenticated user's own logged hours
// GET /api/volunteer/hours/mine — identical alias, named to match the
// /donations/mine convention used elsewhere; CSV export is done client-side
// from this same JSON (see frontend/src/pages/Volunteer.tsx) rather than as
// a separate server-rendered export endpoint, so there's only one query here.
const listOwnHourLogs = asyncHandler(async (req, res) => {
  const hourLogs = await prisma.volunteerHourLog.findMany({
    where: { userId: req.user!.id },
    orderBy: { date: 'desc' },
    include: { opportunity: true },
  });
  res.json({ hourLogs });
});

router.get('/hours', requireAuth, listOwnHourLogs);
router.get('/hours/mine', requireAuth, listOwnHourLogs);

// GET /api/volunteer/hours/all — admin view of every logged hour (optionally filter by status)
router.get(
  '/hours/all',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const where: Record<string, unknown> = {};
    if (typeof status === 'string') {
      if (!Object.values(HourLogStatus).includes(status as HourLogStatus)) {
        throw badRequest('Invalid status filter');
      }
      where.status = status;
    }
    const hourLogs = await prisma.volunteerHourLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      // Select only safe user fields — `user: true` would also serialize
      // passwordHash and reset/verification tokens into this admin JSON
      // response, which is exactly the kind of leak this endpoint should
      // never produce even though it's admin-only.
      include: {
        opportunity: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    res.json({ hourLogs });
  }),
);

const approveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

// POST /api/volunteer/hours/:id/approve — admin approves/rejects a logged hour entry
router.post(
  '/hours/:id/approve',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = approveSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');

    const existing = await prisma.volunteerHourLog.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Hour log not found');

    const hourLog = await prisma.volunteerHourLog.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });
    res.json({ hourLog });
  }),
);

export default router;
