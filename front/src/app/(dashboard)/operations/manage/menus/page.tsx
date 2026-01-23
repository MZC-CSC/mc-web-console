'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { MenuItem } from '@/types/menu';
import {
  useMenus,
  useCreateMenu,
  useUpdateMenu,
  useDeleteMenu,
} from '@/hooks/api/useMenus';
import { MenuDetail } from '@/components/menus/MenuDetail';
import { MenuModal } from '@/components/menus/MenuModal';
import { Button } from '@/components/common/Button';
import { Pencil, Trash2 } from 'lucide-react';

/**
 * 메뉴 관리 페이지
 */
export default function MenusPage() {
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const { menus, isLoading, refetch } = useMenus();
  const createMutation = useCreateMenu();
  const updateMutation = useUpdateMenu();
  const deleteMutation = useDeleteMenu();

  // 테이블 컬럼 정의
  const columns: ColumnDef<MenuItem>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <div className="font-mono text-sm">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'parentId',
      header: '부모 ID',
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue('parentId') || '-'}</div>
      ),
    },
    {
      accessorKey: 'priority',
      header: '우선순위',
      cell: ({ row }) => <div className="text-sm">{row.getValue('priority')}</div>,
    },
    {
      accessorKey: 'menuNumber',
      header: '메뉴 번호',
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue('menuNumber') || '-'}</div>
      ),
    },
    {
      accessorKey: 'isAction',
      header: '액션 여부',
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue('isAction') ? '예' : '아니오'}</div>
      ),
    },
    {
      accessorKey: 'path',
      header: '경로',
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm font-mono">
          {row.getValue('path') || '-'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        const menu = row.original;
        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMenu(menu);
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
                handleDelete(menu);
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
    setSelectedMenu(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleUpdate = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (menu: MenuItem) => {
    if (confirm(`정말로 "${menu.name}" 메뉴를 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync(menu.id);
        if (selectedMenu?.id === menu.id) {
          setSelectedMenu(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleModalSubmit = async (menuData: {
    id?: string;
    displayName: string;
    parentMenuId?: string;
    priority: number;
    menunumber?: number;
    isAction: boolean;
    path?: string;
  }) => {
    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync({
          displayName: menuData.displayName,
          parentMenuId: menuData.parentMenuId,
          priority: menuData.priority,
          menunumber: menuData.menunumber,
          isAction: menuData.isAction,
          path: menuData.path,
        });
      } else {
        await updateMutation.mutateAsync({
          id: menuData.id!,
          displayName: menuData.displayName,
          parentMenuId: menuData.parentMenuId,
          priority: menuData.priority,
          menunumber: menuData.menunumber,
          isAction: menuData.isAction,
          path: menuData.path,
        });
      }
      setIsModalOpen(false);
      setSelectedMenu(null);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <>
      <CrudPageTemplate
        data={menus}
        columns={columns}
        selectedItem={selectedMenu}
        onItemSelect={setSelectedMenu}
        onRefresh={refetch}
        isLoading={isLoading}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        detailComponent={MenuDetail}
        title="메뉴 관리"
        addButtonLabel="메뉴 추가"
        emptyMessage="메뉴가 없습니다."
        enableFiltering={true}
        filterColumns={['name', 'id', 'path']}
      />

      {isModalOpen && (
        <MenuModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode={modalMode}
          menu={modalMode === 'edit' ? selectedMenu : undefined}
          onSubmit={handleModalSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </>
  );
}
