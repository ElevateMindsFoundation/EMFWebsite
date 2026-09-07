import { LogOut, Mail, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { SEO } from '../components/SEO';
import { InitialsAvatar } from '../components/ui/InitialsAvatar';
import { Button } from '../components/ui/Button';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  USER: 'Member',
  CONTRIBUTOR: 'Contributor',
};

export function Dashboard() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  if (!user) return null; // ProtectedRoute guarantees this, but keeps TS happy.

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`;

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <SEO title="Dashboard" noindex />
      <div className="rounded-2xl border border-primary-100 bg-surface p-8 shadow-card dark:border-primary-800 dark:bg-surface-dark-muted sm:p-10">
        <div className="flex items-center gap-4">
          <InitialsAvatar initials={initials} name={fullName} size={64} />
          <div>
            <h1 className="text-2xl font-bold text-primary dark:text-white">Welcome, {user.firstName}</h1>
            <p className="text-sm text-ink-soft dark:text-ink-onDarkSoft">
              This is your Elevate Minds dashboard.
            </p>
          </div>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-primary-100 p-4 dark:border-primary-800">
            <UserIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-onDarkSoft">
                Name
              </dt>
              <dd className="text-sm font-medium text-ink dark:text-ink-onDark">{fullName}</dd>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-primary-100 p-4 dark:border-primary-800">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-onDarkSoft">
                Email
              </dt>
              <dd className="text-sm font-medium text-ink dark:text-ink-onDark">{user.email}</dd>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-primary-100 p-4 dark:border-primary-800">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-onDarkSoft">
                Role
              </dt>
              <dd className="text-sm font-medium text-ink dark:text-ink-onDark">
                {ROLE_LABELS[user.role] ?? user.role}
              </dd>
            </div>
          </div>
        </dl>

        <p className="mt-8 text-sm text-ink-soft dark:text-ink-onDarkSoft">
          Donation history, volunteer hour tracking, and AI tool access are on the way in a later
          phase — this page just confirms your account is signed in end to end.
        </p>

        <Button variant="outline" onClick={handleLogout} className="mt-6">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
