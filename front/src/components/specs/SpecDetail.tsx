'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerSpec } from '@/types/resources';

interface SpecDetailProps {
  spec: ServerSpec | null;
}

/**
 * Server Spec 상세 정보 컴포넌트
 */
export function SpecDetail({ spec }: SpecDetailProps) {
  if (!spec) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Server Spec을 선택하면 상세 정보가 표시됩니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Spec 상세 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">이름</label>
          <p className="text-sm font-medium mt-1">{spec.name}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {spec.cpu !== undefined && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">CPU</label>
              <p className="text-sm mt-1">{spec.cpu} Core</p>
            </div>
          )}

          {spec.memory !== undefined && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Memory</label>
              <p className="text-sm mt-1">{spec.memory} GB</p>
            </div>
          )}

          {spec.disk !== undefined && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Disk</label>
              <p className="text-sm mt-1">{spec.disk} GB</p>
            </div>
          )}
        </div>

        {spec.description && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">설명</label>
            <p className="text-sm mt-1">{spec.description}</p>
          </div>
        )}

        {spec.connectionName && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Connection</label>
            <p className="text-sm mt-1">{spec.connectionName}</p>
          </div>
        )}

        {spec.createdAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">생성일</label>
            <p className="text-sm mt-1">
              {new Date(spec.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}

        {spec.updatedAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">수정일</label>
            <p className="text-sm mt-1">
              {new Date(spec.updatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
