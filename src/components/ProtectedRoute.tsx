import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export function ProtectedRoute({ children, requireSubscription = false }: ProtectedRouteProps) {
  const { isAuthenticated, isActiveSubscriber, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/signin?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireSubscription && !isActiveSubscriber) {
    return <Navigate to="/pricing?subscription_required=true" replace />;
  }

  return <>{children}</>;
}
