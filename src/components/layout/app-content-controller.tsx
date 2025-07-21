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

  const displayState = React.useMemo(() => {
    if (!isClient || authLoading) {
      return 'loading';
    }
    // Auth pages should always render immediately.
    if (['/login', '/signup'].includes(pathname)) {
        return 'app';
    }
    // If we have a user but they haven't finished onboarding, show it.
    if (user && !onboardingComplete) {
      return 'onboarding';
    }
    // If the user exists, onboarding is done, but they haven't seen the welcome screen this session, show it.
    if (user && onboardingComplete && !welcomeShownThisSession) {
      return 'welcome';
    }
    // Otherwise, show the main app content.
    return 'app';
  }, [isClient, authLoading, user, onboardingComplete, welcomeShownThisSession, pathname]);

  const handleOnboardingClose = () => {
    setOnboardingComplete(true);
  };

  const handleWelcomeComplete = () => {
    setWelcomeShownThisSession(true);
  };
  
  // Render auth pages outside the main app layout structure.
  if (['/login', '/signup'].includes(pathname)) {
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
