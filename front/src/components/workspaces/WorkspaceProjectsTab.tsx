'use client';

import { useState } from 'react';
import {
  useWorkspaceProjects,
  useAddProjectToWorkspace,
  useRemoveProjectFromWorkspace,
} from '@/hooks/api/useProjects';
import { CrudTable } from '@/components/templates/CrudTable';
import { ColumnDef } from '@tanstack/react-table';
import { Project } from '@/types/workspace';
import { Button } from '@/components/common/Button';
import { Plus, Trash2 } from 'lucide-react';
import { ProjectSelectModal } from './ProjectSelectModal';

interface WorkspaceProjectsTabProps {
  workspaceId: string;
}

/**
 * 워크스페이스 Projects 탭 컴포넌트
 */
export function WorkspaceProjectsTab({ workspaceId }: WorkspaceProjectsTabProps) {
  const { projects, isLoading, refetch } = useWorkspaceProjects(workspaceId);
  const addMutation = useAddProjectToWorkspace();
  const removeMutation = useRemoveProjectFromWorkspace();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddProject = async (project: Project) => {
    try {
      await addMutation.mutateAsync({
        workspaceId,
        projectId: project.id,
      });
      refetch();
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  };

  const handleRemoveProject = async (project: Project) => {
    if (confirm(`정말로 "${project.name}" 프로젝트를 워크스페이스에서 제거하시겠습니까?`)) {
      try {
        await removeMutation.mutateAsync({
          workspaceId,
          projectId: project.id,
        });
        refetch();
      } catch (error) {
        console.error('Failed to remove project:', error);
      }
    }
  };

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'ns_id',
      header: 'Namespace ID',
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue('ns_id') || '-'}</div>
      ),
    },
    {
      accessorKey: 'description',
      header: '설명',
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue('description') || '-'}</div>
      ),
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        const project = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveProject(project);
            }}
            title="제거"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            disabled={removeMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* 프로젝트 추가 버튼 */}
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          프로젝트 추가
        </Button>
      </div>

      {/* 프로젝트 목록 테이블 */}
      <CrudTable
        data={projects}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="프로젝트가 없습니다."
      />

      {/* 프로젝트 선택 모달 */}
      <ProjectSelectModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSelect={handleAddProject}
        excludeProjectIds={projects.map((p) => p.id)}
        isLoading={addMutation.isPending}
      />
    </div>
  );
}
