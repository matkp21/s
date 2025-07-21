// src/app/pro/layout.tsx
import type { ReactNode } from 'react';

export default function ProLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto flex-grow py-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}
