'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { WorkspaceProjectSelector } from '@/components/common/WorkspaceProjectSelector';
import { useWorkspaceProjectSelection } from '@/hooks/useWorkspaceProjectSelection';
import { Card } from '@/components/ui/card';
import { MyImage } from '@/types/resources';
import {
  useMyImages,
  useCreateMyImage,
  useDeleteMyImage,
} from '@/hooks/api/useMyImages';
import { MyImageModal } from '@/components/my-images/MyImageModal';
import { MyImageDetail } from '@/components/my-images/MyImageDetail';

/**
 * My Images 관리 페이지
 */
export default function MyImagesPage() {
  const [selectedMyImage, setSelectedMyImage] = useState<MyImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Workspace/Project 선택 및 복원 (공통 Hook 사용)
  const {
    selectedWorkspaceId,
    selectedProjectId,
    selectedProject,
    isWorkspaceProjectSelected,
    handleWorkspaceChange,
    handleProjectChange,
  } = useWorkspaceProjectSelection();

  // 선택된 project의 ns_id 조회
  const nsId = selectedProject?.nsid;

  const { myImages, isLoading, refetch } = useMyImages(nsId || null);
  const createMutation = useCreateMyImage();
  const deleteMutation = useDeleteMyImage();

  // 테이블 컬럼 정의
  const columns: ColumnDef<MyImage>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => <div>{row.getValue('source') || '-'}</div>,
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => <div>{row.getValue('size') || '-'}</div>,
    },
    {
      accessorKey: 'connectionName',
      header: 'Connection',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('connectionName') || '-'}</div>,
    },
  ];

  const handleAdd = () => {
    if (!isWorkspaceProjectSelected || !nsId) {
      alert('Workspace와 Project를 선택해주세요.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (myImage: MyImage) => {
    if (!isWorkspaceProjectSelected || !nsId) {
      alert('Workspace와 Project를 선택해주세요.');
      return;
    }
    if (confirm(`정말로 "${myImage.name}" My Image를 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync({ nsId, customImageId: myImage.id });
        if (selectedMyImage?.id === myImage.id) {
          setSelectedMyImage(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleModalSubmit = async (data: Omit<MyImage, 'id'>) => {
    if (!nsId) {
      return;
    }

    try {
      await createMutation.mutateAsync({ nsId, myImage: data });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace/Project 선택 */}
      <Card className="p-6">
        <WorkspaceProjectSelector
          selectedWorkspaceId={selectedWorkspaceId}
          selectedProjectId={selectedProjectId}
          onWorkspaceChange={handleWorkspaceChange}
          onProjectChange={handleProjectChange}
        />
      </Card>

      {/* Workspace/Project 선택 안내 */}
      {!isWorkspaceProjectSelected && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">안내:</span>
            <span>
              {!selectedWorkspaceId
                ? 'My Images를 조회하려면 Workspace를 선택하세요.'
                : !selectedProjectId
                  ? 'My Images를 조회하려면 Project를 선택하세요.'
                  : ''}
            </span>
          </div>
        </Card>
      )}

      {/* My Images 목록 (Project 선택 시에만 표시) */}
      {isWorkspaceProjectSelected && (
        <>
          <CrudPageTemplate
            data={myImages}
            columns={columns}
            selectedItem={selectedMyImage}
            onItemSelect={setSelectedMyImage}
            onRefresh={refetch}
            isLoading={isLoading}
            onAdd={handleAdd}
            onDelete={handleDelete}
            detailComponent={(props) => <MyImageDetail myImage={props.item} />}
            title="My Images"
            addButtonLabel="My Image 추가"
            emptyMessage="My Image가 없습니다."
          />

          {isModalOpen && (
            <MyImageModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              onSubmit={handleModalSubmit}
              isLoading={createMutation.isPending}
            />
          )}
        </>
      )}
    </div>
  );
}
