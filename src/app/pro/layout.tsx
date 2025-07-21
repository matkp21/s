// src/app/pro/layout.tsx
import type { ReactNode } from 'react';
import { ProHeader } from '@/components/layout/pro-header';
import { AppLayout } from '@/components/layout/app-layout';

export default function ProLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        <ProHeader />
        <div className="container mx-auto flex-grow py-6 sm:py-10">
          {children}
        </div>
      </div>
    </AppLayout>
  );
}
