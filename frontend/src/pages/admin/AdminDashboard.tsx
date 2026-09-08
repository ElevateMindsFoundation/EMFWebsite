import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, Clock, DollarSign, Loader2, Mail, Users } from 'lucide-react';
import type { AdminStats } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SEO } from '../../components/SEO';
import { api, ApiError } from '../../lib/api';

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

const STAT_CARDS: {
  key: keyof AdminStats;
  label: string;
  icon: typeof Users;
  format?: (value: number) => string;
  to: string;
}[] = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, to: '/admin' },
  { key: 'pendingVolunteerHours', label: 'Pending Volunteer Hours', icon: Clock, to: '/admin/volunteer-hours' },
  { key: 'unreadContactMessages', label: 'Unread Messages', icon: Mail, to: '/admin/contact-messages' },
  { key: 'pendingStories', label: 'Pending Stories', icon: BookOpen, to: '/admin/stories' },
  { key: 'totalDonations', label: 'Total Donations', icon: DollarSign, to: '/admin' },
];

const QUICK_LINKS = [
  { label: 'Innovations', to: '/admin/innovations' },
  { label: 'Early Interventions', to: '/admin/early-interventions' },
  { label: 'News & Events', to: '/admin/news-events' },
  { label: 'Team', to: '/admin/team' },
  { label: 'Testimonials', to: '/admin/testimonials' },
  { label: 'Stories', to: '/admin/stories' },
  { label: 'Volunteer Opportunities', to: '/admin/volunteer-opportunities' },
];

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get<AdminStats>('/admin/stats');
      setStats(result);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Couldn't load dashboard stats. The server may be unavailable.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div>
      <SEO title="Admin Overview" noindex />
      <h2 className="text-2xl font-bold text-primary dark:text-white">Overview</h2>
      <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">
        A quick snapshot of what needs attention across the site.
      </p>

      <div className="mt-6">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-12 text-ink-soft dark:text-ink-onDarkSoft">
            <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
            <p className="text-sm">Loading stats…</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
            <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" aria-hidden="true" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <Button variant="outline" size="sm" onClick={loadStats}>
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !error && stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STAT_CARDS.map(({ key, label, icon: Icon, to }) => (
              <Link key={key} to={to}>
                <Card hoverable className="flex h-full flex-col gap-2">
                  <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-onDarkSoft">
                    {label}
                  </p>
                  <p className="text-2xl font-bold text-primary dark:text-white">{stats[key]}</p>
                </Card>
              </Link>
            ))}

            <Card hoverable={false} className="flex flex-col gap-2 sm:col-span-2 lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-onDarkSoft">
                Total Successful Monetary Donations
              </p>
              <p className="text-2xl font-bold text-primary dark:text-white">
                {formatCents(stats.totalDonationAmountCents)}
              </p>
            </Card>
          </div>
        )}
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-bold text-primary dark:text-white">Manage Content</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_LINKS.map((link) => (
            <Button key={link.to} to={link.to} variant="outline" size="sm">
              {link.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
