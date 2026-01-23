'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { WorkspaceSelector } from '@/components/common/WorkspaceSelector';
import { ProjectSelector } from '@/components/common/ProjectSelector';
import { Image } from '@/types/resources';
import {
  useImages,
  useCreateImage,
  useUpdateImage,
  useDeleteImage,
} from '@/hooks/api/useImages';
import { useProject } from '@/hooks/useProject';
import { ImageModal } from '@/components/images/ImageModal';
import { ImageDetail } from '@/components/images/ImageDetail';

/**
 * Images 관리 페이지
 */
export default function ImagesPage() {
  const { currentProject } = useProject();
  const nsId = currentProject?.ns_id || null;
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const { images, isLoading, refetch } = useImages(nsId);
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
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
      return;
    }
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleUpdate = (image: Image) => {
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
      return;
    }
    setSelectedImage(image);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (image: Image) => {
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
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
      <div className="flex gap-4">
        <WorkspaceSelector />
        <ProjectSelector />
      </div>

      {/* Images 목록 */}
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
        detailComponent={ImageDetail}
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
    </div>
  );
}
