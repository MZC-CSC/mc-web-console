'use client';

/**
 * Dashboard Layout
 * Layout for authenticated pages with sidebar and navbar
 */

import { ReactNode } from 'react';
import { Sidebar, Navbar, Footer } from '@/components/layout';
import { useMenuStore } from '@/stores';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { sidebarOpen } = useMenuStore();

  return (
    <div className="min-h-screen bg-muted/40">
      <Sidebar />
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
