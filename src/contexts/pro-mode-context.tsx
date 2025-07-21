
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { User as FirebaseUser } from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import type { FirebaseError } from 'firebase/app';

export type UserRole = 'pro' | 'medico' | 'diagnosis' | null;

interface ProModeContextType {
  isProMode: boolean; // Derived from userRole
  userRole: UserRole;
  selectUserRole: (role: UserRole) => void;
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
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [user, loading, error] = useAuthState(auth);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedRole = localStorage.getItem('userRole') as UserRole;
      if (user && !storedRole) {
        // User logged in but no role selected, wait for onboarding/selection
      } else if (storedRole) {
        setUserRole(storedRole);
      } else {
        setUserRole(null); // Guest
      }
    }
  }, [user, isClient]);


  const selectUserRole = useCallback((role: UserRole) => {
    setUserRole(role);
    if (isClient) {
      if (role) {
        localStorage.setItem('userRole', role);
      } else {
        localStorage.removeItem('userRole');
      }
    }
  }, [isClient]);

  const isProMode = useMemo(() => userRole === 'pro', [userRole]);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    isProMode,
    userRole,
    selectUserRole,
  }), [user, loading, error, isProMode, userRole, selectUserRole]);

  return (
    <ProModeContext.Provider value={value}>
      {children}
    </ProModeContext.Provider>
  );
};
