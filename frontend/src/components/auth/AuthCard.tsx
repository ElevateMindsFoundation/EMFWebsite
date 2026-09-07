import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-hero-gradient px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-8 shadow-card-hover dark:bg-surface-dark-muted sm:p-10">
        <img src="/logo.jpg" alt="Elevate Minds Foundation logo" className="h-12 w-auto rounded-md" />
        <h1 className="mt-6 text-2xl font-bold text-primary dark:text-white">{title}</h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">{subtitle}</p>
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-sm text-ink-soft dark:text-ink-onDarkSoft">{footer}</div>}
      </div>
    </div>
  );
}
