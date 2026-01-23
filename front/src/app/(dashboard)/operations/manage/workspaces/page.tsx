'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { Workspace } from '@/types/workspace';
import {
  useWorkspaces,
  useCreateWorkspace,
  useUpdateWorkspace,
  useDeleteWorkspace,
} from '@/hooks/api/useWorkspaces';
import { WorkspaceDetail } from '@/components/workspaces/WorkspaceDetail';
import { WorkspaceModal } from '@/components/workspaces/WorkspaceModal';
import { WorkspacesSummary } from '@/components/workspaces/WorkspacesSummary';
import { Button } from '@/components/common/Button';
import { Pencil, Trash2 } from 'lucide-react';

/**
 * 워크스페이스 관리 페이지
 */
export default function WorkspacesPage() {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const { workspaces, isLoading, refetch } = useWorkspaces();
  const createMutation = useCreateWorkspace();
  const updateMutation = useUpdateWorkspace();
  const deleteMutation = useDeleteWorkspace();

  // 테이블 컬럼 정의
  const columns: ColumnDef<Workspace>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
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
        const workspace = row.original;
        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWorkspace(workspace);
                setModalMode('edit');
                setIsModalOpen(true);
              }}
              title="수정"
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(workspace);
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
    setSelectedWorkspace(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleUpdate = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (workspace: Workspace) => {
    if (confirm(`정말로 "${workspace.name}" 워크스페이스를 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync(workspace.id);
        if (selectedWorkspace?.id === workspace.id) {
          setSelectedWorkspace(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleModalSubmit = async (workspaceData: Omit<Workspace, 'id'> | Workspace) => {
    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync(workspaceData as Omit<Workspace, 'id'>);
      } else {
        await updateMutation.mutateAsync(workspaceData as Workspace);
      }
      setIsModalOpen(false);
      setSelectedWorkspace(null);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <WorkspacesSummary />

        <CrudPageTemplate
          data={workspaces}
          columns={columns}
          selectedItem={selectedWorkspace}
          onItemSelect={setSelectedWorkspace}
          onRefresh={refetch}
          isLoading={isLoading}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          detailComponent={WorkspaceDetail}
          title="워크스페이스 관리"
          addButtonLabel="워크스페이스 추가"
          emptyMessage="워크스페이스가 없습니다."
          enableFiltering={true}
          filterColumns={['name', 'description']}
        />
      </div>

      {isModalOpen && (
        <WorkspaceModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode={modalMode}
          workspace={modalMode === 'edit' ? selectedWorkspace : undefined}
          onSubmit={handleModalSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </>
  );
}
