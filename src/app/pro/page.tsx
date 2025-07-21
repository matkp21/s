// src/app/pro/page.tsx
"use client";

import { ProModeDashboard } from '@/components/pro/pro-dashboard';
import { useProMode } from '@/contexts/pro-mode-context';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Loader2 } from 'lucide-react';
import { ProSuiteAnimation } from '@/components/pro/pro-suite-animation'; 
import { AppLayout } from '@/components/layout/app-layout';

export default function ProPage() {
  const { userRole } = useProMode();
  const router = useRouter();
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [showProAnimation, setShowProAnimation] = useState(false);

  useEffect(() => {
    if (userRole !== null) { 
      if (userRole === 'pro') {
        const animationShown = sessionStorage.getItem('proSuiteAnimationShown');
        if (!animationShown) {
          setShowProAnimation(true);
          sessionStorage.setItem('proSuiteAnimationShown', 'true');
        }
      } else {
        router.push('/'); 
      }
      setIsLoadingRole(false); 
    }
  }, [userRole, router]);

  if (isLoadingRole) {
    return (
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (userRole !== 'pro') { 
    return (
      <PageWrapper>
        <div className="text-center">
          <p className="text-lg">You must be in Professional mode to access this page.</p>
          <p className="text-sm text-muted-foreground">Redirecting to homepage...</p>
        </div>
      </PageWrapper>
    );
  }

  if (showProAnimation) {
    return <ProSuiteAnimation onAnimationComplete={() => setShowProAnimation(false)} />;
  }
  
  // The Patient Management Suite link now directs to its own page.
  // The ProModeDashboard component will contain the widget-based layout.
  return <ProModeDashboard />;
}
