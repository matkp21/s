'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGateProps {
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
  redirectOnUnauthenticated?: string;
}

/**
 * A client-side component to guard routes based on Firebase auth state.
 * It handles the loading state and redirects unauthenticated users.
 */
export function AuthGate({
  children,
  loadingFallback = <div className="flex items-center justify-center h-screen"><Skeleton className="w-1/2 h-1/2" /></div>,
  redirectOnUnauthenticated = '/login',
}: AuthGateProps) {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectOnUnauthenticated);
    }
    if (error) {
      console.error('Firebase Auth Error:', error);
      // Optionally handle the error, e.g., show an error message
      router.push('/login'); // Redirect to login on error
    }
  }, [user, loading, error, router, redirectOnUnauthenticated]);

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (user) {
    return <>{children}</>;
  }

  // Return null or the loading fallback while redirecting
  return <>{loadingFallback}</>;
}
