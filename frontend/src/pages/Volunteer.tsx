import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Download, HandHeart, Loader2, MapPin, Sparkles, Users } from 'lucide-react';
import rawOpportunities from '../data/volunteerOpportunities.json';
import type { VolunteerOpportunity } from '../types';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { FormField, inputClasses } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { SuccessMessage } from '../components/ui/SuccessMessage';
import { useAuth } from '../store/useAuth';
import { api, ApiError } from '../lib/api';
import { formatDate } from '../utils/date';

const opportunities = rawOpportunities as VolunteerOpportunity[];

// Shape of a hour log as returned by GET /api/volunteer/hours/mine (see
// backend/src/routes/volunteer.ts). `hours` comes back as a string because
// Prisma's Decimal type serializes to JSON as a string, not a number.
interface ApiVolunteerHourLog {
  id: string;
  opportunityId: string;
  opportunity: {
    id: string;
    title: string;
    category: string;
    location: string;
    isRemote: boolean;
    spotsAvailable: number;
    tags: string[];
  };
  date: string;
  hours: string;
  notes: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

// CSV export is generated client-side from the already-fetched hour logs
// (rather than a dedicated server export endpoint) — the data set is small
// (one volunteer's own logs) and this avoids adding a streaming CSV route on
// the backend for what's otherwise identical data to GET /hours/mine.
function downloadHourLogsCsv(hourLogs: ApiVolunteerHourLog[]) {
  const header = ['Date', 'Opportunity', 'Hours', 'Status', 'Notes'];
  const rows = hourLogs.map((log) => [
    formatDate(log.date.slice(0, 10)),
    log.opportunity.title,
    log.hours,
    log.status,
    log.notes ?? '',
  ]);
  const csv = [header, ...rows].map((row) => row.map((cell) => csvEscape(String(cell))).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'volunteer-hours.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const WHY_VOLUNTEER = [
  {
    icon: HandHeart,
    title: 'Direct impact',
    description: 'Your time turns directly into free tools and programs for children who need them.',
  },
  {
    icon: Users,
    title: 'Real community',
    description: 'Work alongside educators, therapists, engineers, and families who share your goals.',
  },
  {
    icon: Sparkles,
    title: 'Flexible ways to help',
    description: 'Remote or in-person, technical or organizational — there is a role for most skill sets.',
  },
];

function VolunteerRegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', opportunityId: opportunities[0]?.id ?? '' });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return <SuccessMessage>Thanks for signing up — we'll follow up with next steps.</SuccessMessage>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" htmlFor="vol-name" required>
          <input
            id="vol-name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Email address" htmlFor="vol-email" required>
          <input
            id="vol-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClasses}
          />
        </FormField>
      </div>
      <FormField label="Opportunity" htmlFor="vol-opportunity" required>
        <select
          id="vol-opportunity"
          required
          value={form.opportunityId}
          onChange={(e) => setForm((f) => ({ ...f, opportunityId: e.target.value }))}
          className={inputClasses}
        >
          {opportunities.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>
      </FormField>
      <Button type="submit" variant="accent" className="self-start">
        Sign Up to Volunteer
      </Button>
    </form>
  );
}

function HourLogForm({ onLogged }: { onLogged: (log: ApiVolunteerHourLog) => void }) {
  const [opportunityId, setOpportunityId] = useState(opportunities[0]?.id ?? '');
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!date || !hours) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await api.post<{ hourLog: ApiVolunteerHourLog }>('/volunteer/hours', {
        opportunityId,
        // <input type="date"> gives "YYYY-MM-DD"; the backend requires a full
        // ISO datetime string, and parsing a date-only string always lands on
        // UTC midnight, which keeps the value stable regardless of timezone.
        date: new Date(date).toISOString(),
        hours: Number(hours),
        notes: notes.trim() ? notes.trim() : undefined,
      });
      onLogged(result.hourLog);
      setHours('');
      setNotes('');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Couldn't log those hours — please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Opportunity" htmlFor="hourlog-opportunity" required>
        <select
          id="hourlog-opportunity"
          required
          value={opportunityId}
          onChange={(e) => setOpportunityId(e.target.value)}
          className={inputClasses}
        >
          {opportunities.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Date" htmlFor="hourlog-date" required>
          <input
            id="hourlog-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Hours" htmlFor="hourlog-hours" required>
          <input
            id="hourlog-hours"
            type="number"
            min="0.25"
            max="24"
            step="0.25"
            required
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className={inputClasses}
          />
        </FormField>
      </div>
      <FormField label="Notes" htmlFor="hourlog-notes" hint="Optional">
        <textarea id="hourlog-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClasses} />
      </FormField>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <Button type="submit" variant="accent" className="self-start" disabled={isSubmitting}>
        {isSubmitting ? 'Logging…' : 'Log Hours'}
      </Button>
    </form>
  );
}

function HourLogList({ hourLogs }: { hourLogs: ApiVolunteerHourLog[] }) {
  if (hourLogs.length === 0) {
    return (
      <p className="text-sm text-ink-soft dark:text-ink-onDarkSoft">
        You haven't logged any hours yet — use the form above to add your first entry.
      </p>
    );
  }

  const groups = new Map<string, ApiVolunteerHourLog[]>();
  for (const log of hourLogs) {
    const key = formatDate(log.date.slice(0, 10), { year: 'numeric', month: 'long' });
    const list = groups.get(key) ?? [];
    list.push(log);
    groups.set(key, list);
  }

  const statusTone = { PENDING: 'primary', APPROVED: 'success', REJECTED: 'neutral' } as const;

  return (
    <div className="flex flex-col gap-6">
      {Array.from(groups.entries()).map(([month, logs]) => (
        <div key={month}>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-onDarkSoft">
            {month}
          </h4>
          <ul className="mt-2 flex flex-col divide-y divide-primary-100 dark:divide-primary-800">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-ink dark:text-ink-onDark">{log.opportunity.title}</p>
                  <p className="text-xs text-ink-soft dark:text-ink-onDarkSoft">{formatDate(log.date.slice(0, 10))}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-semibold text-accent-600 dark:text-accent-light">{log.hours}h</span>
                  <Badge tone={statusTone[log.status]}>{log.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function VolunteerHourTracking() {
  const [hourLogs, setHourLogs] = useState<ApiVolunteerHourLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHourLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get<{ hourLogs: ApiVolunteerHourLog[] }>('/volunteer/hours/mine');
      setHourLogs(result.hourLogs);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Couldn't load your logged hours — the server may be unavailable.";
      setError(message);
      setHourLogs(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHourLogs();
  }, [fetchHourLogs]);

  function handleLogged(log: ApiVolunteerHourLog) {
    setHourLogs((prev) => (prev ? [log, ...prev] : [log]));
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h3 className="text-lg font-bold text-primary dark:text-white">Log Your Hours</h3>
        <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">
          Track time you've volunteered — an admin reviews and approves entries.
        </p>
        <div className="mt-4">
          <HourLogForm onLogged={handleLogged} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-primary dark:text-white">Your Logged Hours</h3>
          {hourLogs && hourLogs.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={() => downloadHourLogsCsv(hourLogs)}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Export CSV
            </Button>
          )}
        </div>

        <div className="mt-4">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-ink-soft dark:text-ink-onDarkSoft">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading your logged hours…
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
              <p>{error}</p>
              <Button type="button" variant="outline" size="sm" className="self-start" onClick={fetchHourLogs}>
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !error && hourLogs && <HourLogList hourLogs={hourLogs} />}
        </div>
      </div>
    </div>
  );
}

export function Volunteer() {
  const user = useAuth((s) => s.user);

  return (
    <div>
      <SEO
        title="Volunteer With Us"
        description="Find volunteer opportunities and track your volunteer hours with Elevate Minds Foundation."
      />
      <PageHeader
        eyebrow="Give Your Time"
        title="Volunteer With Us"
        description="Every free tool and program we offer runs on the generosity of volunteers like you."
      />

      <section className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Why It Matters" title="Why Volunteer" align="center" />
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {WHY_VOLUNTEER.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-primary-100 bg-surface p-6 text-center dark:border-primary-800 dark:bg-surface-dark-muted">
                <Icon className="mx-auto h-8 w-8 text-accent" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-bold text-primary dark:text-white">{title}</h3>
                <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-muted px-5 py-14 dark:bg-surface-dark-muted">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Open Roles" title="Current Opportunities" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp) => (
              <Link key={opp.id} to={`/volunteer/${opp.id}`}>
                <Card className="flex h-full flex-col gap-3">
                  <Badge>{opp.category}</Badge>
                  <h3 className="text-lg font-bold text-primary dark:text-white">{opp.title}</h3>
                  <p className="text-sm text-ink-soft dark:text-ink-onDarkSoft">{opp.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-2 text-xs text-ink-soft dark:text-ink-onDarkSoft">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {opp.remote ? 'Remote' : opp.location}
                    </span>
                    <span className="font-semibold text-accent-600 dark:text-accent-light">
                      {opp.spotsAvailable} spots open
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
          <div className="rounded-2xl border border-primary-100 bg-surface p-6 shadow-card dark:border-primary-800 dark:bg-surface-dark-muted sm:p-8">
            <h2 className="text-xl font-bold text-primary dark:text-white">Register to Volunteer</h2>
            <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">
              This form doesn't submit anywhere yet — full registration connects once accounts are
              live.
            </p>
            <div className="mt-6">
              <VolunteerRegistrationForm />
            </div>
          </div>

          {user ? (
            <div className="rounded-2xl border border-primary-100 bg-surface p-6 shadow-card dark:border-primary-800 dark:bg-surface-dark-muted sm:p-8">
              <VolunteerHourTracking />
            </div>
          ) : (
            <div className="flex flex-col justify-center gap-4 rounded-2xl border border-dashed border-primary-200 bg-surface-muted p-8 text-center dark:border-primary-700 dark:bg-surface-dark-muted">
              <CalendarClock className="mx-auto h-10 w-10 text-primary-300 dark:text-primary-600" aria-hidden="true" />
              <h3 className="text-lg font-bold text-primary dark:text-white">Volunteer Hour Tracking</h3>
              <p className="text-sm text-ink-soft dark:text-ink-onDarkSoft">
                Sign in to log your volunteer hours and keep track of your impact over time.
              </p>
              <Button to="/login" variant="accent" className="mx-auto">
                Sign In
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
