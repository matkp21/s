'use client';

import React, { type ReactNode, useMemo, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useProMode } from '@/contexts/pro-mode-context';
import { useClientState } from '@/contexts/client-state-provider';
import { Loader2 } from 'lucide-react';
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';
import WelcomeDisplay from '@/components/welcome/welcome-display';
import { AppLayout } from '@/components/layout/app-layout';

export function AppContentController({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useProMode();
  const {
    isClient,
    onboardingComplete,
    setOnboardingComplete,
    welcomeShownThisSession,
    setWelcomeShownThisSession
  } = useClientState();

  const pathname = usePathname();
  const [initialRenderComplete, setInitialRenderComplete] = useState(false);

  useEffect(() => {
    setInitialRenderComplete(true);
  }, []);

  const displayState = useMemo(() => {
    if (!initialRenderComplete || authLoading) {
      return 'loading';
    }
    if (['/login', '/signup'].includes(pathname)) {
        return 'auth';
    }
    if (user && !onboardingComplete) {
      return 'onboarding';
    }
    if (user && onboardingComplete && !welcomeShownThisSession) {
      return 'welcome';
    }
    return 'app';
  }, [initialRenderComplete, authLoading, user, onboardingComplete, welcomeShownThisSession, pathname]);

  const handleOnboardingClose = () => {
    setOnboardingComplete(true);
  };

  const handleWelcomeComplete = () => {
    setWelcomeShownThisSession(true);
  };
  
  switch (displayState) {
    case 'loading':
      return <div className="fixed inset-0 bg-background flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    case 'onboarding':
      return <OnboardingModal isOpen={true} onClose={handleOnboardingClose} />;
    case 'welcome':
      return <WelcomeDisplay onDisplayComplete={handleWelcomeComplete} />;
    case 'auth':
       return <>{children}</>;
    case 'app':
      return <AppLayout>{children}</AppLayout>;
    default:
      return <div className="fixed inset-0 bg-background flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
}