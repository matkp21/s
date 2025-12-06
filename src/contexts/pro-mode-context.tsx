// src/contexts/pro-mode-context.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useMemo } from 'react';
import type { User as FirebaseUser } from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import type { FirebaseError } from 'firebase/app';

// The UserRole type is no longer needed for context switching.
export type UserRole = 'pro' | 'medico' | 'diagnosis' | null;

interface ProModeContextType {
  user: FirebaseUser | null | undefined;
  loading: boolean;
  error: FirebaseError | undefined;
}

const ProModeContext = createContext<ProModeContextType | undefined>(undefined);

export const useProMode = (): ProModeContextType => {
  const context = useContext(ProModeContext);
  if (!context) {
    throw new Error('useProMode must be used within a ProModeProvider');
  }
  return context;
};

interface ProModeProviderProps {
  children: ReactNode;
}

export const ProModeProvider = ({ children }: ProModeProviderProps) => {
  const [user, loading, error] = useAuthState(auth);

  // All role-related state and logic has been removed.
  // The context now only provides authentication state.
  const value = useMemo(() => ({
    user,
    loading,
    error,
  }), [user, loading, error]);

  return (
    <ProModeContext.Provider value={value}>
      {children}
    </ProModeContext.Provider>
  );
};
