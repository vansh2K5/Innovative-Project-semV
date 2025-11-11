"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('=== PROTECTED ROUTE CHECK ===');
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      console.log('Token exists:', !!token);
      console.log('User exists:', !!userStr);

      if (!token || !userStr) {
        console.log('No token or user, redirecting to login');
        router.push('/login');
        return;
      }

      const user = JSON.parse(userStr);
      console.log('User data:', user);
      console.log('User role:', user.role);
      console.log('Require admin:', requireAdmin);

      // Verify user still exists in database by making a test API call
      // Use /api/events instead of /api/users since regular users can't access /api/users
      try {
        const response = await fetch('/api/events?page=1&limit=1', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Verification response status:', response.status);

        // Only logout on 401 (unauthorized), not 403 (forbidden for specific resource)
        if (response.status === 401) {
          // Token invalid or user deleted
          console.log('User no longer authorized, logging out...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Failed to verify user:', error);
        // Continue anyway, might be network issue
      }

      // Check if admin access is required
      if (requireAdmin && user.role !== 'admin') {
        console.log('Admin required but user is not admin, redirecting to homePage');
        router.push('/homePage');
        return;
      }

      console.log('Auth check passed, authorizing user');
      console.log('============================');
      setIsAuthorized(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
