'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname();
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // items가 제공되지 않으면 pathname에서 자동 생성
    setBreadcrumbItems(items || generateBreadcrumbs(pathname));
    setMounted(true);
  }, [pathname, items]);

  // 클라이언트에서만 렌더링하여 hydration 에러 방지
  if (!mounted) {
    return (
      <nav className={cn('flex items-center space-x-2 text-sm', className)}>
        <Link
          href="/dashboard"
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <Home className="h-4 w-4" />
        </Link>
      </nav>
    );
  }

  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      <Link
        href="/dashboard"
        className="flex items-center text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.href && index < breadcrumbItems.length - 1 ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              index === breadcrumbItems.length - 1 && 'text-foreground font-medium'
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

/**
 * pathname에서 breadcrumb 자동 생성
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  
  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return { label, href: index < segments.length - 1 ? href : undefined };
  });
}
