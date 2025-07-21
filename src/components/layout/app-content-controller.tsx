// src/components/layout/app-content-controller.tsx
"use client";

import React, { type ReactNode } from 'react';
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

  const isProOrMedicoRoute = pathname.startsWith('/pro') || pathname.startsWith('/medico');

  const displayState = React.useMemo(() => {
    if (!isClient || authLoading) {
      return 'loading';
    }
    if (['/login', '/signup'].includes(pathname)) {
        return 'app';
    }
    if (user && !onboardingComplete) {
      return 'onboarding';
    }
    if (user && onboardingComplete && !welcomeShownThisSession) {
      return 'welcome';
    }
    return 'app';
  }, [isClient, authLoading, user, onboardingComplete, welcomeShownThisSession, pathname]);

  const handleOnboardingClose = () => {
    setOnboardingComplete(true);
  };

  const handleWelcomeComplete = () => {
    setWelcomeShownThisSession(true);
  };
  
  // Render auth, pro, or medico pages outside the main app layout structure.
  if (isProOrMedicoRoute || ['/login', '/signup'].includes(pathname)) {
    return <>{children}</>;
  }

  switch (displayState) {
    case 'loading':
      return <div className="fixed inset-0 bg-background flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    case 'onboarding':
      return <OnboardingModal isOpen={true} onClose={handleOnboardingClose} />;
    case 'welcome':
      return <WelcomeDisplay onDisplayComplete={handleWelcomeComplete} />;
    case 'app':
      return <AppLayout>{children}</AppLayout>;
    default:
      return <div className="fixed inset-0 bg-background flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
}
