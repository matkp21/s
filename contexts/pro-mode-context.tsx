
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { User as FirebaseUser } from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import type { FirebaseError } from 'firebase/app';

export type UserRole = 'pro' | 'medico' | 'diagnosis' | null;

interface ProModeContextType {
  isProMode: boolean;
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

export const ProModeProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as UserRole;
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  const selectUserRole = useCallback((role: UserRole) => {
    setUserRole(role);
    if (role) {
      localStorage.setItem('userRole', role);
    } else {
      localStorage.removeItem('userRole');
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    isProMode: userRole === 'pro',
    userRole,
    selectUserRole,
  }), [user, loading, error, userRole, selectUserRole]);

  return (
    <ProModeContext.Provider value={value}>
      {children}
    </ProModeContext.Provider>
  );
};
