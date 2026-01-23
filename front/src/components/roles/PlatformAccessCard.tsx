'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PlatformAccess } from '@/types/workspace';
import { TreeView } from '@/components/common/TreeView';
import { usePlatformAccessTree } from '@/hooks/api/usePlatformAccessTree';

interface PlatformAccessCardProps {
  platformAccess?: PlatformAccess;
  onPermissionsChange?: (permissions: string[]) => void;
  mode: 'view' | 'create' | 'edit';
  workspaceId?: string | null;
  className?: string;
}

/**
 * Platform Access 카드 컴포넌트
 * Platform access 권한을 표시하는 카드
 */
export function PlatformAccessCard({
  platformAccess,
  onPermissionsChange,
  mode,
  workspaceId,
  className,
}: PlatformAccessCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const permissions = platformAccess?.permissions || [];
  const hasAccess = permissions.length > 0;
  const isViewMode = mode === 'view';

  // Platform Access 트리 데이터 조회 (Create/Edit 모드)
  const { treeData: fetchedTreeData, isLoading: isTreeLoading } = usePlatformAccessTree(
    !isViewMode ? workspaceId : null
  );

  // View 모드에서는 platformAccess.treeData 사용, Create/Edit 모드에서는 조회한 데이터 사용
  const treeData = isViewMode ? platformAccess?.treeData || [] : fetchedTreeData || [];

  return (
    <Card className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Platform Access</CardTitle>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {mode === 'view' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">접근 가능 여부</span>
                  <span
                    className={`text-sm font-medium ${
                      hasAccess ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    {hasAccess ? '접근 가능' : '접근 불가'}
                  </span>
                </div>
                {hasAccess && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">선택된 권한:</p>
                    <div className="flex flex-wrap gap-2">
                      {permissions.map((permission) => (
                        <span
                          key={permission}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {!hasAccess && (
                  <p className="text-sm text-muted-foreground">선택된 권한이 없습니다.</p>
                )}
              </div>
            )}
            {(mode === 'create' || mode === 'edit') && (
              <div className="space-y-2">
                {treeData.length > 0 ? (
                  <TreeView
                    data={treeData}
                    selectedNodes={permissions}
                    onSelectionChange={onPermissionsChange || (() => {})}
                    checkbox={true}
                    disabled={false}
                  />
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    <p>Platform access 권한 트리 데이터를 불러오는 중...</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
