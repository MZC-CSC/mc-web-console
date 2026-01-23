'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { WorkspaceSelector } from '@/components/common/WorkspaceSelector';
import { ProjectSelector } from '@/components/common/ProjectSelector';
import { MyImage } from '@/types/resources';
import {
  useMyImages,
  useCreateMyImage,
  useDeleteMyImage,
} from '@/hooks/api/useMyImages';
import { useProject } from '@/hooks/useProject';
import { MyImageModal } from '@/components/my-images/MyImageModal';
import { MyImageDetail } from '@/components/my-images/MyImageDetail';

/**
 * My Images 관리 페이지
 */
export default function MyImagesPage() {
  const { currentProject } = useProject();
  const nsId = currentProject?.ns_id || null;
  const [selectedMyImage, setSelectedMyImage] = useState<MyImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { myImages, isLoading, refetch } = useMyImages(nsId);
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
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (myImage: MyImage) => {
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
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
      <div className="flex gap-4">
        <WorkspaceSelector />
        <ProjectSelector />
      </div>

      {/* My Images 목록 */}
      <CrudPageTemplate
        data={myImages}
        columns={columns}
        selectedItem={selectedMyImage}
        onItemSelect={setSelectedMyImage}
        onRefresh={refetch}
        isLoading={isLoading}
        onAdd={handleAdd}
        onDelete={handleDelete}
        detailComponent={MyImageDetail}
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
    </div>
  );
}
