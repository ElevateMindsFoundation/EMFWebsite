import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/admin/stats — a handful of cheap counts for the admin dashboard
// overview cards. Deliberately kept to simple prisma.count()/aggregate calls
// (no joins, no per-row scans) rather than a heavier analytics endpoint —
// the admin overview just needs "how many things need my attention", not
// trend charts or breakdowns.
router.get(
  '/stats',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (_req, res) => {
    const [
      totalUsers,
      pendingVolunteerHours,
      unreadContactMessages,
      pendingStories,
      totalDonations,
      donationTotal,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.volunteerHourLog.count({ where: { status: 'PENDING' } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.story.count({ where: { status: 'PENDING' } }),
      prisma.donation.count(),
      prisma.donation.aggregate({
        _sum: { amountCents: true },
        where: { status: 'SUCCEEDED', type: 'MONETARY' },
      }),
    ]);

    res.json({
      totalUsers,
      pendingVolunteerHours,
      unreadContactMessages,
      pendingStories,
      totalDonations,
      totalDonationAmountCents: donationTotal._sum.amountCents ?? 0,
    });
  }),
);

export default router;
