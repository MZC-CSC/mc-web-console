'use client';

import { CSPRole } from '@/types/workspace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CSPRoleDetailProps {
  item: CSPRole;
  onUpdate?: () => void;
}

/**
 * CSP Role 상세 정보 컴포넌트
 */
export function CSPRoleDetail({ item }: CSPRoleDetailProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">ID</label>
            <p className="text-sm">{item.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">이름</label>
            <p className="text-sm font-medium">{item.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Provider</label>
            <p className="text-sm uppercase">{item.provider}</p>
          </div>
          {item.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">설명</label>
              <p className="text-sm">{item.description}</p>
            </div>
          )}
          {item.arn && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">ARN</label>
              <p className="text-sm font-mono text-xs">{item.arn}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
