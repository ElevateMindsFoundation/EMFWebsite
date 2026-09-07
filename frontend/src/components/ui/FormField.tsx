import type { LabelHTMLAttributes, ReactNode } from 'react';

export const inputClasses =
  'w-full rounded-lg border border-primary-200 bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-primary-700 dark:bg-surface-dark dark:text-ink-onDark dark:placeholder:text-ink-onDarkSoft/50';

interface FormFieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, required, hint, children, ...rest }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-primary dark:text-ink-onDark" {...rest}>
        {label}
        {required && (
          <span className="ml-0.5 text-accent" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-soft dark:text-ink-onDarkSoft">{hint}</p>}
    </div>
  );
}
