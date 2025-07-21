// src/app/medico/layout.tsx
import type { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/app-layout';

export default function MedicoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppLayout>
        {children}
    </AppLayout>
  );
}
