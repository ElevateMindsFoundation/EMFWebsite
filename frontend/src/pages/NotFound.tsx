import { Compass } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 py-20 text-center">
      <SEO title="Page Not Found" noindex />
      <Compass className="h-12 w-12 text-accent" aria-hidden="true" />
      <h1 className="text-3xl font-bold text-primary dark:text-white">Page not found</h1>
      <p className="max-w-md text-ink-soft dark:text-ink-onDarkSoft">
        The page you're looking for doesn't exist, or the item may have been moved.
      </p>
      <Button to="/" variant="primary">
        Back to Home
      </Button>
    </div>
  );
}
