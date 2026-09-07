import { useState } from 'react';
import type { FormEvent } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe as StripeClient } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { AlertTriangle, Coins, CreditCard, Handshake, Rocket } from 'lucide-react';
import rawInnovations from '../data/innovations.json';
import type { Innovation } from '../types';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/layout/PageHeader';
import { FormField, inputClasses } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { SuccessMessage } from '../components/ui/SuccessMessage';
import { api, ApiError } from '../lib/api';

const innovations = rawInnovations as Innovation[];

// Stripe publishable keys are safe to expose client-side (unlike the secret
// key, which only ever lives on the backend). This machine has no real
// Stripe test keys yet — .env ships a clearly-fake placeholder — so the
// donation form degrades to a friendly notice instead of mounting a broken
// Stripe form when the key is missing or still a placeholder.
const STRIPE_PUBLISHABLE_KEY: string = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '';
const isStripeConfigured =
  STRIPE_PUBLISHABLE_KEY.trim().length > 0 && !STRIPE_PUBLISHABLE_KEY.includes('placeholder');
const stripePromise: Promise<StripeClient | null> | null = isStripeConfigured
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

type Tab = 'monetary' | 'time' | 'project';

const TABS: { id: Tab; label: string; icon: typeof Coins }[] = [
  { id: 'monetary', label: 'Monetary', icon: Coins },
  { id: 'time', label: 'Time & Effort', icon: Handshake },
  { id: 'project', label: 'Project Participation', icon: Rocket },
];

function TaxDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p>
        <strong>Tax-deductibility status pending.</strong> Elevate Minds Foundation's nonprofit
        status documentation is still being finalized. We are not yet able to confirm that
        donations are tax-deductible — this page will be updated with accurate guidance once our
        501(c)(3) status (or equivalent) is verified.
      </p>
    </div>
  );
}

const PRESET_AMOUNTS = [25, 50, 100];

const amountButtonClasses = (active: boolean) =>
  `rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
    active
      ? 'border-primary bg-primary text-white'
      : 'border-primary-200 text-ink-soft hover:bg-primary-50 dark:border-primary-700 dark:text-ink-onDarkSoft dark:hover:bg-surface-dark-muted'
  }`;

// Step 2: once a PaymentIntent exists, mount Stripe's PaymentElement inside
// this <Elements> child and confirm the payment. `redirect: 'if_required'`
// keeps the flow on-page for payment methods (like cards) that don't need an
// off-site redirect step.
function StripeCheckoutForm({ amountDollars }: { amountDollars: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message ?? 'Payment failed. Please check your details and try again.');
      setIsSubmitting(false);
      return;
    }

    setSucceeded(true);
    setIsSubmitting(false);
  }

  if (succeeded) {
    return (
      <SuccessMessage>
        Thank you! Your ${amountDollars} donation is complete — a receipt will follow by email.
      </SuccessMessage>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement />
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <Button type="submit" variant="accent" className="self-start" disabled={!stripe || isSubmitting}>
        {isSubmitting ? 'Processing…' : `Donate $${amountDollars}`}
      </Button>
    </form>
  );
}

// Step 1: collect an amount, ask the backend to create a Stripe PaymentIntent
// (POST /api/donations/create-intent), then hand the returned clientSecret to
// <Elements> so StripeCheckoutForm can mount the PaymentElement against it.
function MonetaryDonationForm() {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAmount = isCustom ? Number(customAmount) : amount;
  const amountValid = Number.isFinite(selectedAmount) && selectedAmount >= 1;

  async function handleContinue(e: FormEvent) {
    e.preventDefault();
    if (!amountValid) return;

    setIsCreating(true);
    setError(null);
    try {
      const result = await api.post<{ clientSecret: string; donationId: string }>('/donations/create-intent', {
        amountCents: Math.round(selectedAmount * 100),
        currency: 'usd',
      });
      setClientSecret(result.clientSecret);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 503
            ? "Payments aren't available right now — please try again later."
            : err.message
          : "We couldn't start your donation. Please check your connection and try again.";
      setError(message);
    } finally {
      setIsCreating(false);
    }
  }

  if (clientSecret && stripePromise) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
        <StripeCheckoutForm amountDollars={amountValid ? selectedAmount : 0} />
      </Elements>
    );
  }

  return (
    <form onSubmit={handleContinue} className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-primary dark:text-white">Choose an Amount</h2>
        <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">
          Every dollar keeps our tools and programs free for the families who rely on them.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {PRESET_AMOUNTS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setIsCustom(false);
              setAmount(preset);
            }}
            aria-pressed={!isCustom && amount === preset}
            className={amountButtonClasses(!isCustom && amount === preset)}
          >
            ${preset}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setIsCustom(true)}
          aria-pressed={isCustom}
          className={amountButtonClasses(isCustom)}
        >
          Custom
        </button>
      </div>

      {isCustom && (
        <FormField label="Custom amount (USD)" htmlFor="custom-amount" required>
          <input
            id="custom-amount"
            type="number"
            min="1"
            step="1"
            inputMode="decimal"
            required
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className={inputClasses}
          />
        </FormField>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" variant="accent" className="self-start" disabled={!amountValid || isCreating}>
        {isCreating ? 'Preparing checkout…' : `Continue to Payment — $${amountValid ? selectedAmount : 0}`}
      </Button>

      <p className="text-xs text-ink-soft dark:text-ink-onDarkSoft">
        Dev note: once real Stripe test keys are configured, use test card{' '}
        <code className="rounded bg-primary-50 px-1.5 py-0.5 font-mono dark:bg-surface-dark">
          4242 4242 4242 4242
        </code>{' '}
        with any future expiry date, any 3-digit CVC, and any ZIP code.
      </p>
    </form>
  );
}

function StripeNotConfigured() {
  return (
    <div className="rounded-2xl border border-primary-100 bg-surface p-8 text-center dark:border-primary-800 dark:bg-surface-dark-muted">
      <CreditCard className="mx-auto h-10 w-10 text-primary-300 dark:text-primary-600" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-bold text-primary dark:text-white">Monetary Donation</h2>
      <p className="mt-2 text-sm text-ink-soft dark:text-ink-onDarkSoft">
        Payments aren't configured yet in this environment. We use Stripe (test mode) for card
        donations, and a publishable key hasn't been set up here yet.
      </p>
    </div>
  );
}

function TimeEffortForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', interest: '', message: '' });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return <SuccessMessage>Thanks for offering your time — we'll be in touch soon.</SuccessMessage>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" htmlFor="pledge-name" required>
          <input
            id="pledge-name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Email address" htmlFor="pledge-email" required>
          <input
            id="pledge-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClasses}
          />
        </FormField>
      </div>
      <FormField label="Area of interest" htmlFor="pledge-interest" required>
        <input
          id="pledge-interest"
          required
          placeholder="e.g. AI research, workshop facilitation, device assembly"
          value={form.interest}
          onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))}
          className={inputClasses}
        />
      </FormField>
      <FormField label="Message" htmlFor="pledge-message" hint="Optional">
        <textarea
          id="pledge-message"
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className={inputClasses}
        />
      </FormField>
      <Button type="submit" variant="accent" className="self-start">
        Pledge My Time
      </Button>
    </form>
  );
}

function ProjectParticipationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', innovationId: innovations[0]?.id ?? '', message: '' });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return <SuccessMessage>Thanks for your interest — our team will reach out about next steps.</SuccessMessage>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" htmlFor="project-name" required>
          <input
            id="project-name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Email address" htmlFor="project-email" required>
          <input
            id="project-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClasses}
          />
        </FormField>
      </div>
      <FormField label="Which project interests you?" htmlFor="project-select" required>
        <select
          id="project-select"
          required
          value={form.innovationId}
          onChange={(e) => setForm((f) => ({ ...f, innovationId: e.target.value }))}
          className={inputClasses}
        >
          {innovations.map((i) => (
            <option key={i.id} value={i.id}>
              {i.title}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="How would you like to participate?" htmlFor="project-message" hint="Optional">
        <textarea
          id="project-message"
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className={inputClasses}
        />
      </FormField>
      <Button type="submit" variant="accent" className="self-start">
        Submit Interest
      </Button>
    </form>
  );
}

export function Donate() {
  const [tab, setTab] = useState<Tab>('monetary');

  return (
    <div>
      <SEO
        title="Donate"
        description="Support free AI tools and programs for children with disabilities — donate money, time, or project participation."
      />
      <PageHeader
        eyebrow="Support Our Mission"
        title="Donations"
        description="Give money, time, or expertise — every contribution keeps our programs free for families."
      />

      <section className="px-5 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap gap-2 border-b border-primary-100 pb-4 dark:border-primary-800">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-pressed={tab === id}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === id
                    ? 'bg-primary text-white'
                    : 'text-ink-soft hover:bg-primary-50 dark:text-ink-onDarkSoft dark:hover:bg-surface-dark-muted'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-6">
            {tab === 'monetary' && (
              <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-primary-100 bg-surface p-6 dark:border-primary-800 dark:bg-surface-dark-muted sm:p-8">
                  {isStripeConfigured ? <MonetaryDonationForm /> : <StripeNotConfigured />}
                </div>
                <TaxDisclaimer />
              </div>
            )}

            {tab === 'time' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold text-primary dark:text-white">Pledge Your Time</h2>
                  <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">
                    Tell us how you'd like to help, and our volunteer team will follow up.
                  </p>
                </div>
                <TimeEffortForm />
                <TaxDisclaimer />
              </div>
            )}

            {tab === 'project' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold text-primary dark:text-white">Project Participation</h2>
                  <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">
                    Pick a current innovation you'd like to support as a research partner, tester, or
                    collaborator.
                  </p>
                </div>
                <ProjectParticipationForm />
                <TaxDisclaimer />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
