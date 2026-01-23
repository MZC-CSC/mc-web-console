'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Credential } from '@/types/resources';
import { Badge } from '@/components/ui/badge';

interface CredentialDetailProps {
  credential: Credential | null;
}

/**
 * Credential 상세 정보 컴포넌트
 */
export function CredentialDetail({ credential }: CredentialDetailProps) {
  if (!credential) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Credential을 선택하면 상세 정보가 표시됩니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Credential 상세 정보</span>
          {credential.provider && (
            <Badge variant="outline" className="uppercase">
              {credential.provider}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">이름</label>
          <p className="text-sm font-medium mt-1">{credential.name}</p>
        </div>

        {credential.provider && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Provider</label>
            <p className="text-sm mt-1 uppercase">{credential.provider}</p>
          </div>
        )}

        {credential.connectionName && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Connection</label>
            <p className="text-sm mt-1">{credential.connectionName}</p>
          </div>
        )}

        {credential.config && Object.keys(credential.config).length > 0 && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Config</label>
            <pre className="text-xs bg-muted p-3 rounded-md mt-1 overflow-auto">
              {JSON.stringify(credential.config, null, 2)}
            </pre>
          </div>
        )}

        {credential.createdAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">생성일</label>
            <p className="text-sm mt-1">
              {new Date(credential.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}

        {credential.updatedAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">수정일</label>
            <p className="text-sm mt-1">
              {new Date(credential.updatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
