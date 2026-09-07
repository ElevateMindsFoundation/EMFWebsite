import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <section className="bg-hero-gradient px-5 py-16 text-white sm:py-20">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-4">
        {eyebrow && (
          <span className="text-sm font-semibold uppercase tracking-widest text-accent-light">
            {eyebrow}
          </span>
        )}
        <h1 className="text-4xl font-bold sm:text-5xl">{title}</h1>
        {description && <p className="max-w-2xl text-base text-primary-100 sm:text-lg">{description}</p>}
        {children}
      </div>
    </section>
  );
}
