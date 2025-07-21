// src/app/pro/layout.tsx
import type { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/app-layout';

export default function ProLayout({
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
