'use client';

/**
 * Root Providers
 * Wraps the app with all necessary providers
 */

import { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  );
}
