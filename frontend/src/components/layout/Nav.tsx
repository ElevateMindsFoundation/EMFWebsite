import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Lightbulb,
  Users,
  LogIn,
  LogOut,
  LayoutDashboard,
  Gift,
  HandHelping,
  BookOpen,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';
import { InitialsAvatar } from '../ui/InitialsAvatar';
import { useAuth } from '../../store/useAuth';

interface NavItem {
  label: string;
  to: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'About Us', to: '/about', icon: Users },
  { label: 'Innovations', to: '/innovations', icon: Lightbulb },
  { label: 'Stories', to: '/stories', icon: BookOpen },
  { label: 'Volunteer', to: '/volunteer', icon: HandHelping },
  { label: 'Donations', to: '/donate', icon: Gift },
];

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary-50 text-primary dark:bg-surface-dark-muted dark:text-accent-light'
      : 'text-ink-soft hover:bg-primary-50 hover:text-primary dark:text-ink-onDarkSoft dark:hover:bg-surface-dark-muted dark:hover:text-white'
  }`;

function DesktopAuthItem() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  if (!user) {
    return (
      <NavLink
        to="/login"
        className="ml-1 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-600 focus-visible:outline-2 focus-visible:outline-accent"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        Sign In
      </NavLink>
    );
  }

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="flex items-center gap-1">
      <NavLink to="/dashboard" className={linkClasses}>
        <InitialsAvatar initials={initials} name={`${user.firstName} ${user.lastName}`} size={20} />
        {user.firstName}
      </NavLink>
      {user.role === 'ADMIN' && (
        <NavLink to="/admin" className={linkClasses}>
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Admin
        </NavLink>
      )}
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Log out"
        className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-primary-50 hover:text-primary dark:text-ink-onDarkSoft dark:hover:bg-surface-dark-muted dark:hover:text-white"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function MobileAuthItem({ onNavigate }: { onNavigate: () => void }) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  if (!user) {
    return (
      <NavLink
        to="/login"
        onClick={onNavigate}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        Sign In
      </NavLink>
    );
  }

  async function handleLogout() {
    await logout();
    onNavigate();
    navigate('/');
  }

  return (
    <>
      <NavLink to="/dashboard" onClick={onNavigate} className={linkClasses}>
        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
        {user.firstName} {user.lastName}
      </NavLink>
      {user.role === 'ADMIN' && (
        <NavLink to="/admin" onClick={onNavigate} className={linkClasses}>
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Admin
        </NavLink>
      )}
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-full px-3 py-2 text-left text-sm font-medium text-ink-soft transition-colors hover:bg-primary-50 hover:text-primary dark:text-ink-onDarkSoft dark:hover:bg-surface-dark-muted dark:hover:text-white"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </button>
    </>
  );
}

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-primary-100 bg-surface/90 backdrop-blur dark:border-primary-800 dark:bg-surface-dark/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <NavLink to="/" className="flex items-center gap-2 shrink-0" aria-label="Elevate Minds Foundation home">
          <img src="/logo.jpg" alt="Elevate Minds Foundation logo" className="h-10 w-auto rounded-md" />
        </NavLink>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
          {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClasses} end={to === '/'}>
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <DesktopAuthItem />
        </nav>

        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 text-primary xl:hidden dark:border-primary-700 dark:text-ink-onDark"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-nav"
            aria-label="Primary"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden border-t border-primary-100 xl:hidden dark:border-primary-800"
          >
            <div className="flex flex-col gap-1 px-5 py-3">
              {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={linkClasses}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
              <MobileAuthItem onNavigate={() => setMobileOpen(false)} />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
