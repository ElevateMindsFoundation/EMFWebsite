import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { verifyAccessToken } from '../lib/jwt';
import { forbidden, unauthorized } from '../lib/errors';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Verifies the "Authorization: Bearer <token>" access token and attaches the
// decoded user to req.user. Does not hit the database — callers that need
// fresh user data (e.g. GET /api/auth/me) should look it up separately.
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw unauthorized('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    throw unauthorized('Invalid or expired access token');
  }
}

// Must run after requireAuth. Restricts a route to a set of roles.
export function requireRole(roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw forbidden('You do not have permission to perform this action');
    }
    next();
  };
}
