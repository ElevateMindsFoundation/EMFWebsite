import { Router } from 'express';
import { z } from 'zod';
import { ProgramAudience } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, notFound } from '../lib/errors';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { audience } = req.query;
    const where: Record<string, unknown> = {};
    if (typeof audience === 'string') {
      if (!Object.values(ProgramAudience).includes(audience as ProgramAudience)) {
        throw badRequest('Invalid audience filter');
      }
      where.audience = audience;
    }
    const programs = await prisma.earlyInterventionProgram.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ programs });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const program = await prisma.earlyInterventionProgram.findUnique({ where: { id: req.params.id } });
    if (!program) throw notFound('Program not found');
    res.json({ program });
  }),
);

const registrationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// POST /api/early-interventions/:id/register
router.post(
  '/:id/register',
  asyncHandler(async (req, res) => {
    const program = await prisma.earlyInterventionProgram.findUnique({ where: { id: req.params.id } });
    if (!program) throw notFound('Program not found');
    if (!program.registrationOpen) throw badRequest('Registration is not currently open for this program');

    const parsed = registrationSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');

    const registration = await prisma.programRegistration.create({
      data: {
        programId: program.id,
        userId: req.user?.id,
        name: parsed.data.name,
        email: parsed.data.email,
      },
    });
    res.status(201).json({ registration });
  }),
);

const programSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  audience: z.nativeEnum(ProgramAudience),
  timelineText: z.string().min(1),
  successIndicators: z.array(z.string()).default([]),
  registrationOpen: z.boolean().default(false),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
});

router.post(
  '/',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = programSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');
    const { startDate, endDate, ...rest } = parsed.data;
    const program = await prisma.earlyInterventionProgram.create({
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
    res.status(201).json({ program });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const parsed = programSchema.partial().safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');

    const existing = await prisma.earlyInterventionProgram.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Program not found');

    const { startDate, endDate, ...rest } = parsed.data;
    const program = await prisma.earlyInterventionProgram.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        startDate: startDate === undefined ? undefined : startDate ? new Date(startDate) : null,
        endDate: endDate === undefined ? undefined : endDate ? new Date(endDate) : null,
      },
    });
    res.json({ program });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (req, res) => {
    const existing = await prisma.earlyInterventionProgram.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Program not found');
    await prisma.earlyInterventionProgram.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

export default router;
