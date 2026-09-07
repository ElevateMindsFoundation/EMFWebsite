import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../store/useAuth';
import type { Role } from '../../store/useAuth';

interface RequireRoleProps {
  roles: Role[];
  children: ReactNode;
  /** Where to send a signed-in user who lacks the required role. Defaults to the dashboard. */
  redirectTo?: string;
}

/**
 * Guards a route (or subtree) behind a role check. Assumes it is rendered
 * inside a ProtectedRoute (or otherwise only reached once auth has hydrated)
 * — it still shows its own loading state defensively if used standalone.
 */
export function RequireRole({ roles, children, redirectTo = '/dashboard' }: RequireRoleProps) {
  const user = useAuth((s) => s.user);
  const isHydrating = useAuth((s) => s.isHydrating);

  if (isHydrating) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
        <span className="sr-only">Checking your permissions…</span>
      </div>
    );
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
