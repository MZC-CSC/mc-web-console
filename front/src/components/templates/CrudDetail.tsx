'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/common/Button';
import { X } from 'lucide-react';

interface CrudDetailProps<TData> {
  item: TData;
  onClose: () => void;
  detailComponent?: React.ComponentType<{ item: TData; onUpdate?: () => void }>;
}

export function CrudDetail<TData>({
  item,
  onClose,
  detailComponent: DetailComponent,
}: CrudDetailProps<TData>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>상세 정보</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {DetailComponent ? (
          <DetailComponent item={item} />
        ) : (
          <pre className="text-sm overflow-auto">{JSON.stringify(item, null, 2)}</pre>
        )}
      </CardContent>
    </Card>
  );
}
