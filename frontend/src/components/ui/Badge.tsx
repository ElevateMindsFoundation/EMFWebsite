import type { ReactNode } from 'react';

type Tone = 'primary' | 'accent' | 'success' | 'neutral';

const tones: Record<Tone, string> = {
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200',
  accent: 'bg-accent-50 text-accent-700 dark:bg-accent-900 dark:text-accent-200',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  neutral: 'bg-primary-50 text-ink-soft dark:bg-surface-dark dark:text-ink-onDarkSoft',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

export function Badge({ children, tone = 'primary', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
