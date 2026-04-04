"use client";

import { ProModeProvider } from '@/contexts/pro-mode-context';
import { ThemeProvider } from '@/contexts/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ClientStateProvider } from '@/contexts/client-state-provider';
import { AppContentController } from './app-content-controller';
import { ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="mediassistant-theme">
        <ProModeProvider>
          <ClientStateProvider>
            <AppContentController>
              {children}
            </AppContentController>
            <Toaster />
          </ClientStateProvider>
        </ProModeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}