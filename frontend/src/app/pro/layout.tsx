// src/app/pro/layout.tsx
import type { ReactNode } from 'react';
import { ProHeader } from '@/components/layout/pro-header';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function ProLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <ProHeader />
      <div className="flex-grow py-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}
