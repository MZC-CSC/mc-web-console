'use client';

import { Card } from '@/components/ui/card';
import { useWorkspacesSummary } from '@/hooks/api/useWorkspaces';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * Workspaces Summary 컴포넌트
 * Workspaces, Projects, Groups/Members 통계를 표시
 */
export function WorkspacesSummary() {
  const { summary, isLoading } = useWorkspacesSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="h-20 animate-pulse bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'Workspaces',
      value: summary.workspacesCount,
      icon: '📁',
    },
    {
      label: 'Projects',
      value: summary.projectsCount,
      icon: '📦',
    },
    {
      label: 'Groups / Members',
      value: summary.groupMembersCount,
      icon: '👥',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
            <div className="text-4xl opacity-50">{stat.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
