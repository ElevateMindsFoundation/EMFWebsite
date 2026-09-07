import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../store/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

/** Redirects to /login (preserving the intended destination) unless a user is signed in. */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuth((s) => s.user);
  const isHydrating = useAuth((s) => s.isHydrating);
  const location = useLocation();

  if (isHydrating) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
        <span className="sr-only">Checking your session…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
