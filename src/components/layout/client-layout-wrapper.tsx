// src/components/layout/client-layout-wrapper.tsx
"use client";

import { ProModeProvider } from '@/contexts/pro-mode-context';
import { ThemeProvider } from '@/contexts/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ClientStateProvider } from '@/contexts/client-state-provider';
import { AppContentController } from './app-content-controller';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function ClientLayoutWrapper({ children }: { children: ReactNode }) {
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
