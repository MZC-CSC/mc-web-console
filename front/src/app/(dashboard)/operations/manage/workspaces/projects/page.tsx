'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { Project } from '@/types/workspace';
import {
  useAllProjects,
  useCreateProject,
  useDeleteProject,
} from '@/hooks/api/useProjects';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { Button } from '@/components/common/Button';
import { Pencil, Trash2 } from 'lucide-react';
import { toastSuccess } from '@/lib/utils/toast';
import { handleError } from '@/lib/utils/errorHandler';
import { OPERATION_IDS } from '@/constants/api';

/**
 * 프로젝트 관리 페이지
 */
export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const { projects, isLoading, refetch } = useAllProjects();
  const createMutation = useCreateProject();
  const deleteMutation = useDeleteProject();

  // 테이블 컬럼 정의
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
        <div className="text-muted-foreground font-mono text-sm">
          {row.getValue('ns_id') || '-'}
        </div>
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
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(project);
              }}
              title="삭제"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleAdd = () => {
    setSelectedProject(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDelete = async (project: Project) => {
    if (confirm(`정말로 "${project.name}" 프로젝트를 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync(project.id);
        if (selectedProject?.id === project.id) {
          setSelectedProject(null);
        }
      } catch (error) {
        handleError(error, {
          operationId: OPERATION_IDS.DELETE_PROJECT,
          fallbackMessage: '프로젝트 삭제에 실패했습니다.',
        });
      }
    }
  };

  const handleModalSubmit = async (projectData: {
    name: string;
    description: string;
  }) => {
    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync({
          name: projectData.name,
          description: projectData.description,
        });
        toastSuccess('프로젝트가 생성되었습니다.');
      }
      setIsModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      handleError(error, {
        operationId: OPERATION_IDS.CREATE_PROJECT,
        fallbackMessage: '프로젝트 생성에 실패했습니다.',
      });
      throw error;
    }
  };

  return (
    <>
      <CrudPageTemplate
        data={projects}
        columns={columns}
        selectedItem={selectedProject}
        onItemSelect={setSelectedProject}
        onRefresh={refetch}
        isLoading={isLoading}
        onAdd={handleAdd}
        onDelete={handleDelete}
        detailComponent={(props) => <ProjectDetail project={props.item} />}
        title="프로젝트 관리"
        addButtonLabel="프로젝트 추가"
        emptyMessage="프로젝트가 없습니다."
        enableFiltering={true}
        filterColumns={['name', 'ns_id', 'description']}
      />

      {isModalOpen && (
        <ProjectModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode={modalMode}
          project={modalMode === 'edit' ? (selectedProject ?? undefined) : undefined}
          onSubmit={handleModalSubmit}
          isLoading={createMutation.isPending}
        />
      )}
    </>
  );
}
