// src/components/layout/client-layout-wrapper.tsx
"use client"; // This component will handle client-side logic

import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { ProModeProvider } from '@/contexts/pro-mode-context';
import { ThemeProvider } from '@/contexts/theme-provider'; // Import ThemeProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


export function ClientLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Create a client
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Configure global cache settings if needed
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      }
    }
  }));
  
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="mediassistant-theme">
          <ProModeProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </ProModeProvider>
        </ThemeProvider>
    </QueryClientProvider>
  );
}
