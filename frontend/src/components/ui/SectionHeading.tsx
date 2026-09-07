import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  action?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center items-center mx-auto' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-3 ${alignment} ${action ? 'md:flex-row md:items-end md:justify-between md:text-left' : ''}`}>
      <div className={`flex flex-col gap-3 ${alignment}`}>
        {eyebrow && (
          <span className="text-sm font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-light">
            {eyebrow}
          </span>
        )}
        <h2 className="text-3xl font-bold text-primary dark:text-white sm:text-4xl">{title}</h2>
        {description && (
          <p className="max-w-2xl text-base text-ink-soft dark:text-ink-onDarkSoft">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
