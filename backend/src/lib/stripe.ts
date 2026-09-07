// Lazily-initialized, guarded Stripe client (Phase D, test mode).
//
// This machine has no real Stripe keys yet. The rest of the app must keep
// working — booting, serving every non-donation route — even when
// STRIPE_SECRET_KEY is empty or left as a placeholder. Routes that actually
// need Stripe should call isStripeConfigured() first and throw a 503
// (see lib/errors.ts serviceUnavailable) instead of letting a missing key
// blow up with an unhandled exception.
//
// Local dev, once real test keys are added to backend/.env:
//   stripe listen --forward-to localhost:4000/api/donations/webhook
// (requires the Stripe CLI: https://stripe.com/docs/stripe-cli — install it
// yourself, this project does not install it for you.) That command prints a
// "whsec_..." signing secret — put that in STRIPE_WEBHOOK_SECRET.
import Stripe from 'stripe';
import { env } from './env';

// Guards against both "unset" and the clearly-fake placeholder values used
// in .env.example / .env on machines without real Stripe credentials.
function looksReal(value: string): boolean {
  return value.trim().length > 0 && !value.includes('placeholder');
}

export function isStripeConfigured(): boolean {
  return looksReal(env.STRIPE_SECRET_KEY);
}

let cachedClient: Stripe | null = null;

// Throws if Stripe isn't configured — callers must check isStripeConfigured()
// (and return a 503 via serviceUnavailable) before calling this.
export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured — check isStripeConfigured() before calling getStripe()');
  }
  if (!cachedClient) {
    cachedClient = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return cachedClient;
}
