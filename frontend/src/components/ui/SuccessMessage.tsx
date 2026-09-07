import { CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface SuccessMessageProps {
  children: ReactNode;
}

export function SuccessMessage({ children }: SuccessMessageProps) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
    >
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
