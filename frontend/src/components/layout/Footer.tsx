import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { FacebookGlyph, InstagramGlyph, LinkedInGlyph, XGlyph } from '../ui/SocialIcons';

const FOOTER_LINKS = [
  { label: 'Innovations', to: '/innovations' },
  { label: 'Early Interventions', to: '/early-interventions' },
  { label: 'About Us', to: '/about' },
  { label: 'News & Events', to: '/news-events' },
  { label: 'Donate', to: '/donate' },
  { label: 'Volunteer', to: '/volunteer' },
  { label: 'Contact', to: '/contact' },
];

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', Icon: FacebookGlyph },
  { label: 'Instagram', href: '#', Icon: InstagramGlyph },
  { label: 'X (Twitter)', href: '#', Icon: XGlyph },
  { label: 'LinkedIn', href: '#', Icon: LinkedInGlyph },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    setSubscribed(true);
  }

  return (
    <footer className="border-t border-primary-100 bg-surface-muted dark:border-primary-800 dark:bg-surface-dark-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <img src="/logo.jpg" alt="Elevate Minds Foundation logo" className="h-12 w-auto rounded-md" />
          <p className="text-sm text-ink-soft dark:text-ink-onDarkSoft">
            Free AI-powered tools and programs for children with physical, developmental, and
            neurodiverse conditions.
          </p>
          <ul className="flex items-center gap-2 pt-1">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 text-primary transition-colors hover:bg-primary-50 dark:border-primary-700 dark:text-ink-onDarkSoft dark:hover:bg-surface-dark"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary dark:text-white">
            Explore
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-ink-soft transition-colors hover:text-primary dark:text-ink-onDarkSoft dark:hover:text-accent-light"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary dark:text-white">
            Contact
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-ink-soft dark:text-ink-onDarkSoft">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              Cary, NC
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              info@elevateminds.org
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              (123) 456-7890
            </li>
          </ul>
          <p className="mt-3 text-xs italic text-ink-soft/70 dark:text-ink-onDarkSoft/70">
            Placeholder — update with real, confirmed contact details.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary dark:text-white">
            Stay Updated
          </h3>
          <p className="mt-4 text-sm text-ink-soft dark:text-ink-onDarkSoft">
            Get occasional news about our free programs. No spam, ever.
          </p>
          {subscribed ? (
            <p className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Thanks — you're on the list!
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-full border border-primary-200 bg-surface px-4 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-primary-700 dark:bg-surface-dark dark:text-ink-onDark"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-600"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-primary-100 px-5 py-5 text-center text-xs text-ink-soft dark:border-primary-800 dark:text-ink-onDarkSoft">
        © {new Date().getFullYear()} Elevate Minds Foundation. All rights reserved.
      </div>
    </footer>
  );
}
