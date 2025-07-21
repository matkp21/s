// src/contexts/client-state-provider.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ClientStateContextType {
  isClient: boolean;
  onboardingComplete: boolean;
  setOnboardingComplete: (status: boolean) => void;
  welcomeShownThisSession: boolean;
  setWelcomeShownThisSession: (status: boolean) => void;
}

const ClientStateContext = createContext<ClientStateContextType | undefined>(undefined);

export const useClientState = (): ClientStateContextType => {
  const context = useContext(ClientStateContext);
  if (!context) {
    throw new Error('useClientState must be used within a ClientStateProvider');
  }
  return context;
};

export const ClientStateProvider = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const [welcomeShownThisSession, setWelcomeShownThisSessionState] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setOnboardingCompleteState(localStorage.getItem('onboardingComplete') === 'true');
    setWelcomeShownThisSessionState(sessionStorage.getItem('welcomeDisplayShown') === 'true');
  }, []);

  const setOnboardingComplete = (status: boolean) => {
    setOnboardingCompleteState(status);
    localStorage.setItem('onboardingComplete', String(status));
  };

  const setWelcomeShownThisSession = (status: boolean) => {
    setWelcomeShownThisSessionState(status);
    sessionStorage.setItem('welcomeDisplayShown', String(status));
  };

  const value = {
    isClient,
    onboardingComplete,
    setOnboardingComplete,
    welcomeShownThisSession,
    setWelcomeShownThisSession,
  };

  return (
    <ClientStateContext.Provider value={value}>
      {children}
    </ClientStateContext.Provider>
  );
};
