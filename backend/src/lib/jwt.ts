import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from './env';

export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
  role: Role;
}

export interface RefreshTokenPayload {
  sub: string; // user id
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

// Rough ms conversion for the refresh cookie's maxAge. Supports the small set
// of suffixes we actually use in .env (s/m/h/d); falls back to 30 days.
export function expiresInToMs(expiresIn: string, fallbackMs = 30 * 24 * 60 * 60 * 1000): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(expiresIn.trim());
  if (!match) return fallbackMs;
  const value = Number(match[1]);
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * unitMs[match[2]];
}
