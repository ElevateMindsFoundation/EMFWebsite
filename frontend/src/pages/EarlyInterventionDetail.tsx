import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import type { ApiEarlyInterventionProgram } from '../types';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { FormField, inputClasses } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { SuccessMessage } from '../components/ui/SuccessMessage';
import { api, ApiError } from '../lib/api';
import { NotFound } from './NotFound';

function RegistrationForm({ program }: { program: ApiEarlyInterventionProgram }) {
  const [submitted, setSubmitted] = useState(false);
  const [childName, setChildName] = useState('');
  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post(`/early-interventions/${program.id}/register`, {
        name: childName,
        email: caregiverEmail,
      });
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "We couldn't submit your registration — please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return <SuccessMessage>Thanks, we'll be in touch about {program.name}.</SuccessMessage>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField label="Child's first name" htmlFor="child-name" required>
        <input
          id="child-name"
          type="text"
          required
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          className={inputClasses}
        />
      </FormField>
      <FormField label="Caregiver email" htmlFor="caregiver-email" required>
        <input
          id="caregiver-email"
          type="email"
          required
          value={caregiverEmail}
          onChange={(e) => setCaregiverEmail(e.target.value)}
          className={inputClasses}
        />
      </FormField>
      <FormField label="Anything we should know?" htmlFor="notes" hint="Optional">
        <textarea id="notes" rows={3} className={inputClasses} />
      </FormField>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <Button type="submit" variant="accent" className="self-start" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting…' : 'Submit Registration'}
      </Button>
    </form>
  );
}

export function EarlyInterventionDetail() {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<ApiEarlyInterventionProgram | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(
    async (signal?: { cancelled: boolean }) => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const result = await api.get<{ program: ApiEarlyInterventionProgram }>(`/early-interventions/${id}`);
        if (!signal?.cancelled) setProgram(result.program);
      } catch (err) {
        if (signal?.cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          const message =
            err instanceof ApiError
              ? err.message
              : "We couldn't reach the server to load this program. Please try again shortly.";
          setError(message);
        }
      } finally {
        if (!signal?.cancelled) setIsLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    const signal = { cancelled: false };
    load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [load]);

  if (notFound) return <NotFound />;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink-soft dark:text-ink-onDarkSoft">
        <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
        <p className="text-sm">Loading program…</p>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-5 py-24 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" aria-hidden="true" />
        <p className="text-sm text-red-700 dark:text-red-300">
          {error ?? "We couldn't load this program."}
        </p>
        <Button variant="outline" size="sm" onClick={() => load()}>
          Try again
        </Button>
        <Link
          to="/early-interventions"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-600 dark:text-accent-light"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Early Interventions
        </Link>
      </div>
    );
  }

  return (
    <div>
      <SEO title={program.name} description={program.description.slice(0, 155)} />
      <PageHeader eyebrow={program.audience} title={program.name} />

      <section className="px-5 py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/early-interventions"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-600 dark:text-accent-light"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Early Interventions
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {program.registrationOpen && <Badge tone="success">Registration Open</Badge>}
            <span className="text-sm text-ink-soft dark:text-ink-onDarkSoft">{program.timelineText}</span>
          </div>

          <p className="mt-6 text-lg leading-relaxed text-ink dark:text-ink-onDark">
            {program.description}
          </p>

          <div className="mt-8 rounded-2xl border border-primary-100 bg-surface-muted p-6 dark:border-primary-800 dark:bg-surface-dark-muted">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary dark:text-white">
              Success Indicators
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {program.successIndicators.map((indicator) => (
                <li key={indicator} className="flex items-start gap-2 text-sm text-ink-soft dark:text-ink-onDarkSoft">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  {indicator}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 rounded-2xl border border-primary-100 bg-surface p-6 dark:border-primary-800 dark:bg-surface-dark-muted sm:p-8">
            <h2 className="text-xl font-bold text-primary dark:text-white">
              {program.registrationOpen ? 'Register Interest' : 'Join the Waitlist'}
            </h2>
            <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">
              {program.registrationOpen
                ? "We'll follow up by email with next steps."
                : "Registration isn't open yet — submit your details and we'll notify you when it is."}
            </p>

            <div className="mt-6">
              <RegistrationForm program={program} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
