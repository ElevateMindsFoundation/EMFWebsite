import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Loader2, TrendingUp, Users2 } from 'lucide-react';
import type { ApiInnovation } from '../types';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { api, ApiError } from '../lib/api';
import { NotFound } from './NotFound';

export function InnovationDetail() {
  const { id } = useParams<{ id: string }>();
  const [innovation, setInnovation] = useState<ApiInnovation | null>(null);
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
        const result = await api.get<{ innovation: ApiInnovation }>(`/innovations/${id}`);
        if (!signal?.cancelled) setInnovation(result.innovation);
      } catch (err) {
        if (signal?.cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          const message =
            err instanceof ApiError
              ? err.message
              : "We couldn't reach the server to load this innovation. Please try again shortly.";
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
        <p className="text-sm">Loading innovation…</p>
      </div>
    );
  }

  if (error || !innovation) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-5 py-24 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" aria-hidden="true" />
        <p className="text-sm text-red-700 dark:text-red-300">
          {error ?? "We couldn't load this innovation."}
        </p>
        <Button variant="outline" size="sm" onClick={() => load()}>
          Try again
        </Button>
        <Link
          to="/innovations"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-600 dark:text-accent-light"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Innovations
        </Link>
      </div>
    );
  }

  return (
    <div>
      <SEO title={innovation.title} description={innovation.description.slice(0, 155)} />
      <PageHeader eyebrow={innovation.domain} title={innovation.title} />

      <section className="px-5 py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/innovations"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-600 dark:text-accent-light"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Innovations
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge>{innovation.domain}</Badge>
            <span className="text-sm text-ink-soft dark:text-ink-onDarkSoft">{innovation.year}</span>
          </div>

          <p className="mt-6 text-lg leading-relaxed text-ink dark:text-ink-onDark">
            {innovation.description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary-100 bg-surface-muted p-6 dark:border-primary-800 dark:bg-surface-dark-muted">
              <TrendingUp className="h-6 w-6 text-accent" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-semibold uppercase tracking-wide text-primary dark:text-white">
                Impact
              </h2>
              <p className="mt-1 text-xl font-bold text-primary dark:text-white">
                {innovation.impactMetric}
              </p>
            </div>
            <div className="rounded-2xl border border-primary-100 bg-surface-muted p-6 dark:border-primary-800 dark:bg-surface-dark-muted">
              <Users2 className="h-6 w-6 text-accent" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-semibold uppercase tracking-wide text-primary dark:text-white">
                Team
              </h2>
              <ul className="mt-1 flex flex-col gap-0.5">
                {innovation.teamMembers.map((member) => (
                  <li key={member} className="text-sm text-ink-soft dark:text-ink-onDarkSoft">
                    {member}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button to="/donate" variant="accent">
              Support This Work
            </Button>
            <Button to="/volunteer" variant="outline">
              Volunteer With Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
