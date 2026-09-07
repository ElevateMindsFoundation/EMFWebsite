import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Baby, Loader2, Sprout, Users } from 'lucide-react';
import type { ApiEarlyInterventionProgram, ApiProgramAudience } from '../types';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { api, ApiError } from '../lib/api';

const GROUPS: { audience: ApiProgramAudience; label: string; icon: typeof Baby; description: string }[] = [
  {
    audience: 'CHILDREN',
    label: 'For Children',
    icon: Baby,
    description: 'Play-based, sensory-friendly programs for our youngest participants.',
  },
  {
    audience: 'YOUTH',
    label: 'For Youth',
    icon: Sprout,
    description: 'Skill-building programs for older children and teens.',
  },
  {
    audience: 'FAMILIES',
    label: 'For Families',
    icon: Users,
    description: 'Orientation and peer-support programs for parents and caregivers.',
  },
];

export function EarlyInterventions() {
  const [programs, setPrograms] = useState<ApiEarlyInterventionProgram[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPrograms = useCallback(async (signal?: { cancelled: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get<{ programs: ApiEarlyInterventionProgram[] }>('/early-interventions');
      if (!signal?.cancelled) setPrograms(result.programs);
    } catch (err) {
      if (signal?.cancelled) return;
      const message =
        err instanceof ApiError
          ? err.message
          : "We couldn't reach the server to load these programs. Please try again shortly.";
      setError(message);
    } finally {
      if (!signal?.cancelled) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    loadPrograms(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [loadPrograms]);

  return (
    <div>
      <SEO
        title="Early Intervention Programs"
        description="Browse early intervention programs for children, youth, and families, grouped by audience with clear timelines and success indicators."
      />
      <PageHeader
        eyebrow="Get Started Early"
        title="Early Interventions"
        description="Programs grouped by who they're built for — every one of them free, with clear timelines and success indicators."
      />

      {isLoading && (
        <div className="flex flex-col items-center gap-3 px-5 py-24 text-ink-soft dark:text-ink-onDarkSoft">
          <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
          <p className="text-sm">Loading programs…</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-5 py-24 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" aria-hidden="true" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <Button variant="outline" size="sm" onClick={() => loadPrograms()}>
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !error && programs && programs.length === 0 && (
        <p className="px-5 py-24 text-center text-ink-soft dark:text-ink-onDarkSoft">
          No early intervention programs are listed yet.
        </p>
      )}

      {!isLoading &&
        !error &&
        programs &&
        programs.length > 0 &&
        GROUPS.map(({ audience, label, icon: Icon, description }) => {
          const items = programs.filter((p) => p.audience === audience);
          if (items.length === 0) return null;

          return (
            <section key={audience} className="px-5 py-12 odd:bg-surface-muted odd:dark:bg-surface-dark-muted">
              <div className="mx-auto max-w-6xl">
                <SectionHeading eyebrow={label.replace('For ', '')} title={label} description={description} />

                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((program) => (
                    <Link key={program.id} to={`/early-interventions/${program.id}`}>
                      <Card className="flex h-full flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                          {program.registrationOpen && <Badge tone="success">Registration Open</Badge>}
                        </div>
                        <h3 className="text-lg font-bold text-primary dark:text-white">{program.name}</h3>
                        <p className="text-sm text-ink-soft dark:text-ink-onDarkSoft">
                          {program.description}
                        </p>
                        <p className="mt-auto text-xs font-medium text-ink-soft dark:text-ink-onDarkSoft">
                          {program.timelineText}
                        </p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
    </div>
  );
}
