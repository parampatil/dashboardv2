// components/auth/ProtectedRoute.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoutes?: string[];
  requiredRoles?: string[];
}

const ProtectedRoute = ({ 
  children, 
  allowedRoutes = [], 
  requiredRoles = [] 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      // Check routes
      if (allowedRoutes.length > 0) {
        const hasRouteAccess = allowedRoutes.some(route => 
          Object.keys(user.allowedRoutes || {}).includes(route)
        );
        
        if (!hasRouteAccess) {
          router.push('/unauthorized');
          return;
        }
      }

      // Check roles
      if (requiredRoles.length > 0) {
        const hasRoleAccess = requiredRoles.some(role => 
          user.roles?.includes(role)
        );
        
        if (!hasRoleAccess) {
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [user, loading, allowedRoutes, requiredRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
