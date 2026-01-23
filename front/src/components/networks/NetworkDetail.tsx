'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network } from '@/types/resources';

interface NetworkDetailProps {
  network: Network | null;
}

/**
 * Network 상세 정보 컴포넌트
 */
export function NetworkDetail({ network }: NetworkDetailProps) {
  if (!network) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Network를 선택하면 상세 정보가 표시됩니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Network 상세 정보</span>
          {network.status && (
            <Badge variant={network.status === 'available' ? 'default' : 'secondary'}>
              {network.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">이름</label>
          <p className="text-sm font-medium mt-1">{network.name}</p>
        </div>

        {network.cidr && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">CIDR</label>
            <p className="text-sm font-mono mt-1">{network.cidr}</p>
          </div>
        )}

        {network.connectionName && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Connection</label>
            <p className="text-sm mt-1">{network.connectionName}</p>
          </div>
        )}

        {network.status && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <p className="text-sm mt-1">{network.status}</p>
          </div>
        )}

        {network.subnets && network.subnets.length > 0 && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Subnets ({network.subnets.length})</label>
            <div className="mt-2 space-y-2">
              {network.subnets.map((subnet) => (
                <div key={subnet.id} className="p-2 bg-muted rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{subnet.name}</span>
                    {subnet.zone && (
                      <Badge variant="outline" className="text-xs">
                        {subnet.zone}
                      </Badge>
                    )}
                  </div>
                  {subnet.cidr && (
                    <p className="text-xs text-muted-foreground font-mono mt-1">{subnet.cidr}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {network.createdAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">생성일</label>
            <p className="text-sm mt-1">
              {new Date(network.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}

        {network.updatedAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">수정일</label>
            <p className="text-sm mt-1">
              {new Date(network.updatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
