import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../lib/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  expiresInToMs,
} from '../lib/jwt';
import { emailService, buildVerificationEmailLink, buildPasswordResetLink } from '../lib/email';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, conflict, notFound, unauthorized } from '../lib/errors';
import { requireAuth } from '../middleware/auth';
import { env } from '../lib/env';

const router = Router();

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = expiresInToMs(env.JWT_REFRESH_EXPIRES_IN);

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/api/auth',
  };
}

function publicUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
}) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}

// ---------------------------------------------------------------------------
// POST /api/auth/signup
// ---------------------------------------------------------------------------

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid signup payload');
    }
    const { email, password, firstName, lastName } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw conflict('An account with that email already exists');
    }

    const passwordHash = await hashPassword(password);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    const link = buildVerificationEmailLink(`http://localhost:${env.PORT}`, emailVerificationToken);
    await emailService.send({
      to: user.email,
      subject: 'Verify your Elevate Minds Foundation account',
      text: `Welcome, ${user.firstName}! Verify your email by visiting:\n${link}\n\nThis link expires in 24 hours.`,
    });

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());

    res.status(201).json({ user: publicUser(user), accessToken });
  }),
);

// ---------------------------------------------------------------------------
// GET /api/auth/verify-email?token=...
// ---------------------------------------------------------------------------

router.get(
  '/verify-email',
  asyncHandler(async (req, res) => {
    const token = typeof req.query.token === 'string' ? req.query.token : undefined;
    if (!token) throw badRequest('Missing verification token');

    const user = await prisma.user.findFirst({ where: { emailVerificationToken: token } });
    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw badRequest('Verification link is invalid or has expired');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    res.json({ message: 'Email verified successfully' });
  }),
);

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid login payload');
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw unauthorized('Invalid email or password');

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw unauthorized('Invalid email or password');

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());

    res.json({ user: publicUser(user), accessToken });
  }),
);

// ---------------------------------------------------------------------------
// POST /api/auth/refresh
// ---------------------------------------------------------------------------

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!token) throw unauthorized('Missing refresh token');

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw unauthorized('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw unauthorized('User no longer exists');

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    const newRefreshToken = signRefreshToken({ sub: user.id });
    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions());

    res.json({ user: publicUser(user), accessToken });
  }),
);

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------

router.post(
  '/logout',
  asyncHandler(async (_req, res) => {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
    res.json({ message: 'Logged out' });
  }),
);

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// ---------------------------------------------------------------------------

const forgotPasswordSchema = z.object({ email: z.string().email() });

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('A valid email is required');

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

    // Always respond with 200 regardless of whether the account exists, so
    // this endpoint can't be used to enumerate registered emails.
    if (user) {
      const passwordResetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken, passwordResetExpires },
      });

      const link = buildPasswordResetLink(env.FRONTEND_URL, passwordResetToken);
      await emailService.send({
        to: user.email,
        subject: 'Reset your Elevate Minds Foundation password',
        text: `We received a request to reset your password. Visit:\n${link}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
      });
    }

    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  }),
);

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password
// ---------------------------------------------------------------------------

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid reset payload');
    }
    const { token, newPassword } = parsed.data;

    const user = await prisma.user.findFirst({ where: { passwordResetToken: token } });
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw badRequest('Reset link is invalid or has expired');
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({ message: 'Password reset successfully. You can now log in.' });
  }),
);

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw notFound('User not found');
    res.json({ user: publicUser(user) });
  }),
);

export default router;
