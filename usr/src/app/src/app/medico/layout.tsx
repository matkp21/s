// src/app/medico/layout.tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/layout/app-layout';

export default function MedicoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col min-h-screen", "medico-layout-background")}>
        {children}
    </div>
  );
}
