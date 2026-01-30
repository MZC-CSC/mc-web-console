'use client';

import { Project } from '@/types/workspace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectDetailProps {
  project: Project;
}

/**
 * 프로젝트 상세 정보 컴포넌트
 */
export function ProjectDetail({ project }: ProjectDetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>프로젝트 상세 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">이름</label>
          <p className="mt-1 text-sm font-medium">{project.name}</p>
        </div>
        {project.nsid && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Namespace ID
            </label>
            <p className="mt-1 text-sm font-mono">{project.nsid}</p>
          </div>
        )}
        {project.description && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">설명</label>
            <p className="mt-1 text-sm">{project.description}</p>
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-muted-foreground">ID</label>
          <p className="mt-1 text-sm font-mono text-muted-foreground">{project.id}</p>
        </div>
      </CardContent>
    </Card>
  );
}
