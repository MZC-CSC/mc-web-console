'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SSHKey } from '@/types/resources';

interface SSHKeyDetailProps {
  sshKey: SSHKey | null;
}

/**
 * SSH Key 상세 정보 컴포넌트
 */
export function SSHKeyDetail({ sshKey }: SSHKeyDetailProps) {
  if (!sshKey) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            SSH Key를 선택하면 상세 정보가 표시됩니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SSH Key 상세 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">이름</label>
          <p className="text-sm font-medium mt-1">{sshKey.name}</p>
        </div>

        {sshKey.fingerprint && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Fingerprint</label>
            <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
              {sshKey.fingerprint}
            </p>
          </div>
        )}

        {sshKey.connectionName && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Connection</label>
            <p className="text-sm mt-1">{sshKey.connectionName}</p>
          </div>
        )}

        {sshKey.createdAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">생성일</label>
            <p className="text-sm mt-1">
              {new Date(sshKey.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}

        {sshKey.updatedAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">수정일</label>
            <p className="text-sm mt-1">
              {new Date(sshKey.updatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
