'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MenuItem } from '@/types/menu';
import { useMenu } from '@/hooks/useMenu';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { menuItems, isLoading } = useMenu();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const isActive = (path: string) => {
    if (!path) {
      return false;
    }
    // 정확히 일치하거나, 경로가 정확히 일치하는 경우만 활성화
    // (자식 경로가 아닌 경우)
    return pathname === path || pathname.startsWith(path + '/');
  };

  // 정확히 현재 경로와 일치하는지 확인 (자식 경로 제외)
  const isExactActive = (path: string) => {
    if (!path) {
      return false;
    }
    return pathname === path;
  };

  // 자식 메뉴 중 활성화된 항목이 있는지 확인
  const hasActiveChild = (item: MenuItem): boolean => {
    if (!item.menus || item.menus.length === 0) {
      return false;
    }
    return item.menus.some((child) => {
      if (child.path && isActive(child.path)) {
        return true;
      }
      return hasActiveChild(child);
    });
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.menus && item.menus.length > 0;
    // level 0, 1은 항상 펼쳐진 상태 (최상위 OPERATIONS/SETTINGS와 두 번째 레벨 분류)
    // level 2 이상부터 접었다 펼 수 있음 (세 번째 단계부터)
    const isCollapsible = level >= 2;
    const isExpanded = isCollapsible ? expandedItems.has(item.id) : true;
    const active = item.path ? isActive(item.path) : false;
    const exactActive = item.path ? isExactActive(item.path) : false; // 정확히 일치하는지 확인
    const childActive = hasActiveChild(item); // 자식이 활성화되어 있는지 확인
    // TODO: 백엔드 API에서 수정 필요
    // - workspaces, projects 등 실제 페이지가 있는 메뉴의 isAction 값을 true로 설정해야 함
    // - 현재 isAction: false인 메뉴는 링크가 생성되지 않음
    // - Backend API or framework should set isAction: true for menus that have actual pages
    // - Currently menus with isAction: false cannot be navigated
    const canNavigate = item.isAction && item.path;

    // level 0: 최상위 카테고리 (OPERATIONS, SETTINGS) - 고정 표시
    if (level === 0) {
      return (
        <div key={item.id} className="mt-4 first:mt-0">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {item.name}
          </div>
          {hasChildren && (
            <div className="mt-1 space-y-1">
              {item.menus?.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // level 1: 두 번째 레벨 분류 (Manage, Analytics 등) - 고정 표시
    if (level === 1) {
      return (
        <div key={item.id}>
          <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {item.name}
          </div>
          {hasChildren && (
            <div className="mt-1 space-y-1">
              {item.menus?.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // level 2 이상: 세 번째 단계부터 접었다 펼 수 있음
    return (
      <div 
        key={item.id} 
        className={cn(
          level >= 2 && 'border-l-2 border-border/40 ml-2 pl-3', // 세 번째 단계부터 왼쪽 보더로 영역 구분
          level >= 3 && 'ml-6 pl-3', // 네 번째 단계부터 더 들여쓰기
          level >= 4 && 'ml-10 pl-3' // 다섯 번째 단계부터 더 들여쓰기
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
            exactActive
              ? 'bg-primary text-primary-foreground' // 정확히 일치하는 경우 진한 색상 (선택된 메뉴)
              : childActive && !exactActive
              ? 'bg-primary/10 text-foreground' // 자식이 활성화된 경우 연한 배경 + 어두운 텍스트 (카테고리)
              : canNavigate
              ? 'hover:bg-accent hover:text-accent-foreground cursor-pointer'
              : 'opacity-60 cursor-default'
          )}
        >
          {hasChildren && isCollapsible ? (
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => toggleExpand(item.id)}
                className="flex items-center"
                type="button"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {canNavigate ? (
                <Link href={item.path} className="flex-1">
                  <span>{item.name}</span>
                </Link>
              ) : (
                <span className="flex-1">{item.name}</span>
              )}
            </div>
          ) : hasChildren && !isCollapsible ? (
            // level 0, 1의 경우 자식이 있어도 접었다 펼 수 없음 (항상 펼쳐짐)
            <div className="flex items-center gap-2 flex-1">
              {canNavigate ? (
                <Link href={item.path} className="flex-1">
                  <span>{item.name}</span>
                </Link>
              ) : (
                <span className="flex-1">{item.name}</span>
              )}
            </div>
          ) : canNavigate ? (
            <Link href={item.path} className="flex items-center gap-2 flex-1">
              <span>{item.name}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span>{item.name}</span>
            </div>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.menus?.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <aside className={cn('w-64 border-r bg-background p-4', className)}>
        <nav className="space-y-1">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            메뉴를 불러오는 중...
          </div>
        </nav>
      </aside>
    );
  }

  if (!menuItems || menuItems.length === 0) {
    return (
      <aside className={cn('w-64 border-r bg-background p-4', className)}>
        <nav className="space-y-1">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            메뉴가 없습니다.
          </div>
        </nav>
      </aside>
    );
  }

  return (
    <aside className={cn('w-64 border-r bg-background p-4', className)}>
      <nav className="space-y-1">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>
    </aside>
  );
}
