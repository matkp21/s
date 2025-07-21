// src/app/pro/layout.tsx
import type { ReactNode } from 'react';
import { ProHeader } from '@/components/layout/pro-header';

export default function ProLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <ProHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
