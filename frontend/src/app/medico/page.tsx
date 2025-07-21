// src/app/medico/page.tsx
"use client";

import { MedicoDashboard } from '@/components/medico/medico-dashboard';
import { useProMode } from '@/contexts/pro-mode-context';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Loader2 } from 'lucide-react';
import { MedicoHubAnimation } from '@/components/medico/medico-hub-animation'; 

export default function MedicoPage() {
  const { userRole, loading: authLoading } = useProMode();
  const router = useRouter();
  const [showMedicoAnimation, setShowMedicoAnimation] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || authLoading) return;

    if (userRole === 'medico') {
      const welcomeShown = sessionStorage.getItem('medicoHubAnimationShown');
      if (!welcomeShown) {
        setShowMedicoAnimation(true);
        sessionStorage.setItem('medicoHubAnimationShown', 'true');
      }
    } else if (userRole !== null) { // If role is defined but not 'medico', redirect
      router.push('/');
    }
  }, [userRole, authLoading, router, isClient]);


  if (!isClient || authLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }
  
  if (userRole !== 'medico') {
    return (
      <PageWrapper>
        <div className="text-center p-8">
          <p className="text-lg">You must be in Medico mode to access this page.</p>
          <p className="text-sm text-muted-foreground">Redirecting to homepage...</p>
        </div>
      </PageWrapper>
    );
  }

  if (showMedicoAnimation) {
    return <MedicoHubAnimation onAnimationComplete={() => setShowMedicoAnimation(false)} />;
  }
  
  return <MedicoDashboard />;
}
