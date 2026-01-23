'use client';

import { Workspace } from '@/types/workspace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkspaceDetailsTab } from './WorkspaceDetailsTab';
import { WorkspaceProjectsTab } from './WorkspaceProjectsTab';
import { WorkspaceMembersTab } from './WorkspaceMembersTab';
import { WorkspaceRolesTab } from './WorkspaceRolesTab';
import { WorkspaceCostAnalyticsTab } from './WorkspaceCostAnalyticsTab';

interface WorkspaceDetailProps {
  item: Workspace;
  onUpdate?: () => void;
}

/**
 * 워크스페이스 상세 정보 컴포넌트 (탭 구조)
 */
export function WorkspaceDetail({ item }: WorkspaceDetailProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{item.name} 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">상세 정보</TabsTrigger>
              <TabsTrigger value="projects">프로젝트</TabsTrigger>
              <TabsTrigger value="members">멤버</TabsTrigger>
              <TabsTrigger value="roles">역할</TabsTrigger>
              <TabsTrigger value="cost">비용 분석</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <WorkspaceDetailsTab workspace={item} />
            </TabsContent>
            <TabsContent value="projects" className="mt-4">
              <WorkspaceProjectsTab workspaceId={item.id} />
            </TabsContent>
            <TabsContent value="members" className="mt-4">
              <WorkspaceMembersTab workspaceId={item.id} />
            </TabsContent>
            <TabsContent value="roles" className="mt-4">
              <WorkspaceRolesTab workspaceId={item.id} />
            </TabsContent>
            <TabsContent value="cost" className="mt-4">
              <WorkspaceCostAnalyticsTab workspaceId={item.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
