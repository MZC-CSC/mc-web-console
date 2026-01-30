'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { WorkspaceProjectSelector } from '@/components/common/WorkspaceProjectSelector';
import { useWorkspaceProjectSelection } from '@/hooks/useWorkspaceProjectSelection';
import { Card } from '@/components/ui/card';
import { Image } from '@/types/resources';
import {
  useImages,
  useCreateImage,
  useUpdateImage,
  useDeleteImage,
} from '@/hooks/api/useImages';
import { ImageModal } from '@/components/images/ImageModal';
import { ImageDetail } from '@/components/images/ImageDetail';

/**
 * Images 관리 페이지
 */
export default function ImagesPage() {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

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

  const { images, isLoading, refetch } = useImages(nsId || null);
  const createMutation = useCreateImage();
  const updateMutation = useUpdateImage();
  const deleteMutation = useDeleteImage();

  // 테이블 컬럼 정의
  const columns: ColumnDef<Image>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'os',
      header: 'OS',
      cell: ({ row }) => <div>{row.getValue('os') || '-'}</div>,
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
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleUpdate = (image: Image) => {
    if (!isWorkspaceProjectSelected || !nsId) {
      alert('Workspace와 Project를 선택해주세요.');
      return;
    }
    setSelectedImage(image);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (image: Image) => {
    if (!isWorkspaceProjectSelected || !nsId) {
      alert('Workspace와 Project를 선택해주세요.');
      return;
    }
    if (confirm(`정말로 "${image.name}" Image를 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync({ nsId, imageId: image.id });
        if (selectedImage?.id === image.id) {
          setSelectedImage(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleModalSubmit = async (data: Omit<Image, 'id'>) => {
    if (!nsId) {
      return;
    }

    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync({ nsId, image: data });
      } else if (selectedImage) {
        await updateMutation.mutateAsync({ nsId, imageId: selectedImage.id, image: data });
      }
      setIsModalOpen(false);
      setSelectedImage(null);
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
                ? 'Images를 조회하려면 Workspace를 선택하세요.'
                : !selectedProjectId
                  ? 'Images를 조회하려면 Project를 선택하세요.'
                  : ''}
            </span>
          </div>
        </Card>
      )}

      {/* Images 목록 (Project 선택 시에만 표시) */}
      {isWorkspaceProjectSelected && (
        <>
          <CrudPageTemplate
            data={images}
            columns={columns}
            selectedItem={selectedImage}
            onItemSelect={setSelectedImage}
            onRefresh={refetch}
            isLoading={isLoading}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            detailComponent={(props) => <ImageDetail image={props.item} />}
            title="Images"
            addButtonLabel="Image 추가"
            emptyMessage="Image가 없습니다."
          />

          {isModalOpen && (
            <ImageModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              mode={modalMode}
              image={modalMode === 'edit' ? selectedImage : undefined}
              onSubmit={handleModalSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </>
      )}
    </div>
  );
}
