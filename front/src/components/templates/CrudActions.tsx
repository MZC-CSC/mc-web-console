'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/common/Button';
import { Edit, Trash2 } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';

interface CrudActionsProps<TData> {
  item: TData;
  onUpdate?: (item: TData) => void;
  onDelete?: (item: TData) => void;
}

export function CrudActions<TData>({
  item,
  onUpdate,
  onDelete,
}: CrudActionsProps<TData>) {
  const { confirm, ConfirmComponent } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: '삭제 확인',
      description: '정말로 이 항목을 삭제하시겠습니까?',
      variant: 'destructive',
    });

    if (confirmed && onDelete) {
      onDelete(item);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            {onUpdate && (
              <Button variant="default" onClick={() => onUpdate(item)}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {ConfirmComponent}
    </>
  );
}
