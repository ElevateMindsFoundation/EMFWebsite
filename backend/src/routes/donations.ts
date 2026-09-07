import { Router } from 'express';
import type { Request } from 'express';
import { z } from 'zod';
import type Stripe from 'stripe';
import { DonationType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, serviceUnavailable } from '../lib/errors';
import { requireAuth, requireRole } from '../middleware/auth';
import { env } from '../lib/env';
import { getStripe, isStripeConfigured } from '../lib/stripe';

const router = Router();

// Phase C only supports pledge-style donations (no payment processing).
// MONETARY donations that require an actual charge are Phase D (Stripe).
const donationSchema = z.object({
  type: z.enum(['TIME_PLEDGE', 'PROJECT_PARTICIPATION']),
  targetProject: z.string().optional(),
  pledgeDescription: z.string().min(1),
});

// POST /api/donations — create a pledge-type donation record.
// userId is attached when the caller is authenticated; anonymous pledges are
// allowed (userId stays null) since a login isn't required to pledge time.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = donationSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');

    const donation = await prisma.donation.create({
      data: {
        type: parsed.data.type as DonationType,
        targetProject: parsed.data.targetProject,
        pledgeDescription: parsed.data.pledgeDescription,
        userId: req.user?.id,
        status: 'SUCCEEDED', // no payment step to wait on for a pledge
      },
    });
    res.status(201).json({ donation });
  }),
);

// GET /api/donations/mine — the authenticated user's own donations
router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const donations = await prisma.donation.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ donations });
  }),
);

// GET /api/donations — admin view of all donations
router.get(
  '/',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (_req, res) => {
    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: 'desc' },
      // Select only safe user fields — see the identical comment in
      // routes/volunteer.ts's admin hour-log listing for why `user: true`
      // (which would include passwordHash) is avoided here too.
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    res.json({ donations });
  }),
);

// ---------------------------------------------------------------------------
// Monetary donations (Stripe, test mode)
// ---------------------------------------------------------------------------

const createIntentSchema = z.object({
  amountCents: z.number().int().positive(),
  currency: z.string().min(3).max(3).default('usd'),
  targetProject: z.string().optional(),
});

// POST /api/donations/create-intent — creates a Stripe PaymentIntent plus a
// matching PENDING Donation record, and hands back the clientSecret the
// frontend needs to mount Stripe's PaymentElement. Works for guests too
// (userId stays null when unauthenticated), same as the pledge route above —
// this route has no requireAuth middleware, matching that existing pattern.
router.post(
  '/create-intent',
  asyncHandler(async (req, res) => {
    if (!isStripeConfigured()) throw serviceUnavailable('Stripe is not configured yet');

    const parsed = createIntentSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid payload');

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parsed.data.amountCents,
      currency: parsed.data.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        targetProject: parsed.data.targetProject ?? '',
        userId: req.user?.id ?? '',
      },
    });

    const donation = await prisma.donation.create({
      data: {
        type: 'MONETARY',
        amountCents: parsed.data.amountCents,
        currency: parsed.data.currency,
        stripePaymentIntentId: paymentIntent.id,
        status: 'PENDING',
        targetProject: parsed.data.targetProject,
        userId: req.user?.id,
      },
    });

    res.status(201).json({ clientSecret: paymentIntent.client_secret, donationId: donation.id });
  }),
);

// POST /api/donations/webhook — Stripe webhook receiver. Requires the RAW
// request body (not JSON-parsed) to verify the Stripe-Signature header, so
// this path is mounted with express.raw() ahead of the global express.json()
// middleware in src/index.ts — see the comment there. Local dev:
//   stripe listen --forward-to localhost:4000/api/donations/webhook
router.post(
  '/webhook',
  asyncHandler(async (req: Request, res) => {
    if (!isStripeConfigured()) throw serviceUnavailable('Stripe is not configured yet');

    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') throw badRequest('Missing Stripe-Signature header');
    if (!env.STRIPE_WEBHOOK_SECRET || env.STRIPE_WEBHOOK_SECRET.includes('placeholder')) {
      throw serviceUnavailable('Stripe webhook secret is not configured yet');
    }

    const stripe = getStripe();
    let event: Stripe.Event;
    try {
      // req.body is a raw Buffer here (see express.raw() mount in index.ts),
      // which is required for constructEvent's signature check to succeed.
      event = stripe.webhooks.constructEvent(req.body as Buffer, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      throw badRequest(`Webhook signature verification failed: ${(err as Error).message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await prisma.donation.updateMany({
          where: { stripePaymentIntentId: intent.id },
          data: { status: 'SUCCEEDED' },
        });
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await prisma.donation.updateMany({
          where: { stripePaymentIntentId: intent.id },
          data: { status: 'FAILED' },
        });
        break;
      }
      default:
        // Ignore other event types — nothing else about a Donation depends on them.
        break;
    }

    res.json({ received: true });
  }),
);

export default router;
