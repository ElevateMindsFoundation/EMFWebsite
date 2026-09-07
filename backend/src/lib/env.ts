import 'dotenv/config';

// Centralized, validated access to process.env so a missing var fails fast
// at startup instead of surfacing as a confusing runtime error later.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. See backend/.env.example.`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: required('DATABASE_URL'),
  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  // Stripe (Phase D). Intentionally NOT run through required() — this machine
  // has no real Stripe keys yet, and the server must still boot and serve
  // every non-Stripe route with these unset or left as placeholders. Routes
  // that need Stripe check isStripeConfigured() (see lib/stripe.ts) and
  // return a 503 instead of crashing when it's missing.
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
};
