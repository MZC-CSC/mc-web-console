'use client';

/**
 * Sidebar Component
 * Main navigation sidebar
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMenuStore } from '@/stores';
import {
  LayoutDashboard,
  Server,
  Folder,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Default menu items (will be replaced with API data)
const defaultMenuItems = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    id: 'mci',
    name: 'MCI Workloads',
    path: '/mci',
    icon: 'Server',
  },
  {
    id: 'workspace',
    name: 'Workspace',
    path: '/workspace',
    icon: 'Folder',
  },
  {
    id: 'settings',
    name: 'Settings',
    path: '/settings',
    icon: 'Settings',
  },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Server,
  Folder,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, menuItems, expandedItems, toggleExpanded } =
    useMenuStore();

  const items = menuItems.length > 0 ? menuItems : defaultMenuItems;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {sidebarOpen && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              M
            </div>
            <span className="font-semibold">MC-Console</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(!sidebarOpen && 'mx-auto')}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const Icon = iconMap[item.icon || 'Folder'] || Folder;
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          const hasChildren = 'children' in item && Array.isArray(item.children) && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.id);

          return (
            <div key={item.id}>
              <Link
                href={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  !sidebarOpen && 'justify-center px-2'
                )}
                onClick={(e) => {
                  if (hasChildren) {
                    e.preventDefault();
                    toggleExpanded(item.id);
                  }
                }}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {hasChildren &&
                      (isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      ))}
                  </>
                )}
              </Link>

              {/* Children */}
              {hasChildren && isExpanded && sidebarOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {(item as any).children.map((child: any) => (
                    <Link
                      key={child.id}
                      href={child.path}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        pathname === child.path
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
