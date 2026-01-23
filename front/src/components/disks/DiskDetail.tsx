'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Disk } from '@/types/resources';

interface DiskDetailProps {
  disk: Disk | null;
}

/**
 * Disk 상세 정보 컴포넌트
 */
export function DiskDetail({ disk }: DiskDetailProps) {
  if (!disk) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Disk를 선택하면 상세 정보가 표시됩니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Disk 상세 정보</span>
          {disk.status && (
            <Badge variant={disk.status === 'available' ? 'default' : 'secondary'}>
              {disk.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">이름</label>
          <p className="text-sm font-medium mt-1">{disk.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {disk.size !== undefined && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Size</label>
              <p className="text-sm mt-1">{disk.size} GB</p>
            </div>
          )}

          {disk.type && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <p className="text-sm mt-1 uppercase">{disk.type}</p>
            </div>
          )}
        </div>

        {disk.connectionName && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Connection</label>
            <p className="text-sm mt-1">{disk.connectionName}</p>
          </div>
        )}

        {disk.status && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <p className="text-sm mt-1">{disk.status}</p>
          </div>
        )}

        {disk.createdAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">생성일</label>
            <p className="text-sm mt-1">
              {new Date(disk.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}

        {disk.updatedAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">수정일</label>
            <p className="text-sm mt-1">
              {new Date(disk.updatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
