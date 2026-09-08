import { NavLink, Outlet } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  HandHelping,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Newspaper,
  Quote,
  Sprout,
  Users,
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Innovations', to: '/admin/innovations', icon: Lightbulb, end: false },
  { label: 'Early Interventions', to: '/admin/early-interventions', icon: Sprout, end: false },
  { label: 'News & Events', to: '/admin/news-events', icon: Newspaper, end: false },
  { label: 'Team', to: '/admin/team', icon: Users, end: false },
  { label: 'Testimonials', to: '/admin/testimonials', icon: Quote, end: false },
  { label: 'Stories', to: '/admin/stories', icon: BookOpen, end: false },
  { label: 'Volunteer Opportunities', to: '/admin/volunteer-opportunities', icon: HandHelping, end: false },
  { label: 'Contact Messages', to: '/admin/contact-messages', icon: Mail, end: false },
  { label: 'Volunteer Hours', to: '/admin/volunteer-hours', icon: Clock, end: false },
];

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary text-white dark:bg-primary-light'
      : 'text-ink-soft hover:bg-primary-50 hover:text-primary dark:text-ink-onDarkSoft dark:hover:bg-surface-dark-muted dark:hover:text-white'
  }`;

/**
 * Shell for every /admin/* screen: a section nav (horizontally scrollable on
 * narrow viewports rather than wrapping/collapsing, matching how the
 * testimonials rail elsewhere in the app handles overflow) plus an <Outlet />
 * for the active screen. Rendered inside ProtectedRoute + RequireRole in
 * App.tsx, so everything under here is guaranteed to be an authenticated
 * ADMIN by the time it mounts.
 */
export function AdminLayout() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-light">
          Admin Portal
        </span>
        <h1 className="mt-1 text-3xl font-bold text-primary dark:text-white">Content Management</h1>
      </div>

      <nav aria-label="Admin sections" className="flex gap-2 overflow-x-auto pb-2">
        {ADMIN_NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClasses}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
