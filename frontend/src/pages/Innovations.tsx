import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Loader2, Users2 } from 'lucide-react';
import type { ApiInnovation } from '../types';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { TiltCard } from '../components/ui/TiltCard';
import { Button } from '../components/ui/Button';
import { api, ApiError } from '../lib/api';

const DOMAINS = [
  'All',
  'AI for Learning',
  'Assistive AI Devices',
  'Early Diagnosis & Intervention',
  'Community & Training',
  'Deaf & Hearing Support',
  'Non-Verbal / AAC Support',
] as const;

function summarize(description: string, maxLength = 140): string {
  if (description.length <= maxLength) return description;
  return `${description.slice(0, maxLength).trimEnd()}…`;
}

export function Innovations() {
  const [innovations, setInnovations] = useState<ApiInnovation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [domain, setDomain] = useState<(typeof DOMAINS)[number]>('All');
  const [year, setYear] = useState<'All' | number>('All');

  const loadInnovations = useCallback(async (signal?: { cancelled: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get<{ innovations: ApiInnovation[] }>('/innovations');
      if (!signal?.cancelled) setInnovations(result.innovations);
    } catch (err) {
      if (signal?.cancelled) return;
      const message =
        err instanceof ApiError
          ? err.message
          : "We couldn't reach the server to load innovations. Please try again shortly.";
      setError(message);
    } finally {
      if (!signal?.cancelled) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    loadInnovations(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [loadInnovations]);

  const years = useMemo(
    () => ['All' as const, ...Array.from(new Set((innovations ?? []).map((i) => i.year))).sort((a, b) => b - a)],
    [innovations],
  );

  const filtered = (innovations ?? []).filter(
    (i) => (domain === 'All' || i.domain === domain) && (year === 'All' || i.year === year),
  );

  return (
    <div>
      <SEO
        title="Innovations"
        description="Explore the free AI-powered tools and assistive technologies Elevate Minds Foundation builds with families, therapists, and educators."
      />
      <PageHeader
        eyebrow="What We Build"
        title="Innovations"
        description="AI-powered tools and programs, built with families, therapists, and educators — and always free."
      />

      <section className="px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDomain(d)}
                  aria-pressed={domain === d}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    domain === d
                      ? 'border-primary bg-primary text-white'
                      : 'border-primary-200 text-ink-soft hover:bg-primary-50 dark:border-primary-700 dark:text-ink-onDarkSoft dark:hover:bg-surface-dark-muted'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-ink-soft dark:text-ink-onDarkSoft">
              Year
              <select
                value={year}
                onChange={(e) => setYear(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="rounded-lg border border-primary-200 bg-surface px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-primary-700 dark:bg-surface-dark dark:text-ink-onDark"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoading && (
            <div className="mt-16 flex flex-col items-center gap-3 text-ink-soft dark:text-ink-onDarkSoft">
              <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
              <p className="text-sm">Loading innovations…</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
              <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" aria-hidden="true" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <Button variant="outline" size="sm" onClick={() => loadInnovations()}>
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <p className="mt-12 text-center text-ink-soft dark:text-ink-onDarkSoft">
              No innovations match those filters yet.
            </p>
          )}

          {!isLoading && !error && filtered.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <TiltCard key={item.id} className="h-full">
                  <Link to={`/innovations/${item.id}`}>
                    <Card className="flex h-full flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge>{item.domain}</Badge>
                        <span className="text-xs font-medium text-ink-soft dark:text-ink-onDarkSoft">
                          {item.year}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-primary dark:text-white">{item.title}</h3>
                      <p className="text-sm text-ink-soft dark:text-ink-onDarkSoft">
                        {summarize(item.description)}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2 text-xs text-ink-soft dark:text-ink-onDarkSoft">
                        <span className="font-semibold text-accent-600 dark:text-accent-light">
                          {item.impactMetric}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users2 className="h-3.5 w-3.5" aria-hidden="true" />
                          {item.teamMembers.length}
                        </span>
                      </div>
                    </Card>
                  </Link>
                </TiltCard>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
