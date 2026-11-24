import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/auth';

/** Route guard: unauthenticated visitors are redirected to /login and sent back afterwards. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useAuth((s) => s.session);
  const location = useLocation();
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <>{children}</>;
}
