// src/app/pro/page.tsx
"use client";

import { ProModeDashboard } from '@/components/pro/pro-dashboard';
import { useProMode } from '@/contexts/pro-mode-context';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ProSuiteAnimation } from '@/components/pro/pro-suite-animation'; 
import { AppLayout } from '@/components/layout/app-layout';

export default function ProPage() {
  const { userRole, loading: authLoading } = useProMode();
  const router = useRouter();
  const [showProAnimation, setShowProAnimation] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (authLoading || !isClient) return; // Wait for auth and client-side mount

    if (userRole === 'pro') {
      const animationShown = sessionStorage.getItem('proSuiteAnimationShown');
      if (!animationShown) {
        setShowProAnimation(true);
        sessionStorage.setItem('proSuiteAnimationShown', 'true');
      }
    } else if (userRole !== null) { // If role is defined but not 'pro', redirect
      router.push('/');
    }
  }, [userRole, authLoading, isClient, router]);


  if (authLoading || !isClient) {
    return (
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  if (userRole !== 'pro') {
    return (
        <div className="text-center p-8">
          <p className="text-lg">You must be in Professional mode to access this page.</p>
          <p className="text-sm text-muted-foreground">Redirecting to homepage...</p>
        </div>
    );
  }

  if (showProAnimation) {
    return <ProSuiteAnimation onAnimationComplete={() => setShowProAnimation(false)} />;
  }
  
  return <ProModeDashboard />;
}
