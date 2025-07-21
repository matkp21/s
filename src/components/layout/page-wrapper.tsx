// src/components/layout/page-wrapper.tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  title?: string; // Add title prop
}

export function PageWrapper({ children, className, title }: PageWrapperProps) {
  return (
        <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8", className)}>
         {title && <h1 className="text-3xl font-bold tracking-tight text-foreground my-4">{title}</h1>}
        {children}
        </div>
  );
}
