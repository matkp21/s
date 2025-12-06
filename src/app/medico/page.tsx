// src/app/medico/page.tsx
"use client";

import { MedicoDashboard } from '@/components/medico/medico-dashboard';
import { useProMode } from '@/contexts/pro-mode-context';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MedicoHubAnimation } from '@/components/medico/medico-hub-animation'; 
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function MedicoPage() {
  const { userRole, loading: authLoading } = useProMode();
  const router = useRouter();
  const [showMedicoAnimation, setShowMedicoAnimation] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || authLoading) return;

    if (userRole === 'medico') {
      setIsAuthorized(true);
      const welcomeShown = sessionStorage.getItem('medicoHubAnimationShown');
      if (!welcomeShown) {
        setShowMedicoAnimation(true);
        sessionStorage.setItem('medicoHubAnimationShown', 'true');
      }
    } else if (userRole !== null) { // If role is defined but not 'medico', redirect
      router.push('/');
    } else { // Guest user
      router.push('/');
    }
  }, [userRole, authLoading, router, isClient]);


  if (!isClient || authLoading || !isAuthorized) {
    return (
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  if (showMedicoAnimation) {
    return <MedicoHubAnimation onAnimationComplete={() => setShowMedicoAnimation(false)} />;
  }
  
  return <MedicoDashboard />;
}
