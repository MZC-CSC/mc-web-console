'use client';

import { Role } from '@/types/workspace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformAccessCard } from './PlatformAccessCard';
import { WorkspaceAccessCard } from './WorkspaceAccessCard';
import { CspRoleMappingCard } from './CspRoleMappingCard';

interface RoleDetailProps {
  item: Role;
  onUpdate?: () => void;
}

/**
 * Role 상세 정보 컴포넌트
 * Phase 2: View 모드 카드 통합
 */
export function RoleDetail({ item }: RoleDetailProps) {
  return (
    <div className="space-y-4">
      {/* 기본 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">ID</label>
            <p className="text-sm">{item.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">이름</label>
            <p className="text-sm font-medium">{item.name}</p>
          </div>
          {item.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">설명</label>
              <p className="text-sm">{item.description}</p>
            </div>
          )}
          {item.roleType && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role 타입</label>
              <p className="text-sm">{item.roleType}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Access 카드 */}
      <PlatformAccessCard platformAccess={item.platformAccess} mode="view" />

      {/* Workspace Access 카드 */}
      <WorkspaceAccessCard enabled={item.workspaceAccess} mode="view" />

      {/* CSP Role Mapping 카드 */}
      <CspRoleMappingCard mappings={item.cspRoleMappings} mode="view" />
    </div>
  );
}
