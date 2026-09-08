import type { ReactNode } from 'react';
import { HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

const BRAND_POINTS = [
  { icon: Sparkles, text: 'Free AI-powered tools for children with disabilities' },
  { icon: HeartHandshake, text: 'Track your volunteer hours and personalize your dashboard' },
  { icon: ShieldCheck, text: 'Your data stays private — we never sell it' },
];

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-hero-gradient px-5 py-14 sm:py-20">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-card-hover dark:bg-surface-dark-muted lg:grid-cols-[1fr_1.05fr]">
        {/* Brand panel — desktop only */}
        <div className="relative hidden flex-col justify-between bg-hero-gradient p-10 text-white lg:flex">
          <div>
            <img
              src="/logo.jpg"
              alt="Elevate Minds Foundation logo"
              className="h-12 w-auto rounded-md bg-white/90 p-1"
            />
            <h2 className="mt-8 text-2xl font-bold leading-snug">
              Empowering young minds with free AI solutions.
            </h2>
            <p className="mt-3 text-sm text-primary-100">
              Join the community behind Elevate Minds Foundation.
            </p>
          </div>
          <ul className="mt-10 flex flex-col gap-4">
            {BRAND_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-primary-100">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/20">
                  <Icon className="h-4 w-4 text-accent-light" aria-hidden="true" />
                </span>
                <span className="pt-1.5">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form panel */}
        <div className="p-8 sm:p-10">
          <img
            src="/logo.jpg"
            alt="Elevate Minds Foundation logo"
            className="h-11 w-auto rounded-md lg:hidden"
          />
          <h1 className="mt-6 text-2xl font-bold text-primary dark:text-white lg:mt-0">{title}</h1>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm text-ink-soft dark:text-ink-onDarkSoft">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
