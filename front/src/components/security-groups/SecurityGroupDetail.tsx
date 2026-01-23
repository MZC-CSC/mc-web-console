'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SecurityGroup, SecurityRule } from '@/types/resources';

interface SecurityGroupDetailProps {
  securityGroup: SecurityGroup | null;
}

/**
 * Security Group 상세 정보 컴포넌트
 */
export function SecurityGroupDetail({ securityGroup }: SecurityGroupDetailProps) {
  if (!securityGroup) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Security Group을 선택하면 상세 정보가 표시됩니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderRule = (rule: SecurityRule, index: number) => {
    return (
      <div key={index} className="p-3 bg-muted rounded-md">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={rule.direction === 'inbound' ? 'default' : 'secondary'}>
            {rule.direction === 'inbound' ? 'Inbound' : 'Outbound'}
          </Badge>
          <span className="text-sm font-medium">{rule.protocol.toUpperCase()}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {rule.fromPort && rule.toPort && (
            <div>
              <span className="font-medium">Port:</span> {rule.fromPort === rule.toPort ? rule.fromPort : `${rule.fromPort}-${rule.toPort}`}
            </div>
          )}
          {rule.cidr && (
            <div>
              <span className="font-medium">CIDR:</span> {rule.cidr}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Security Group 상세 정보</span>
          {securityGroup.status && (
            <Badge variant={securityGroup.status === 'available' ? 'default' : 'secondary'}>
              {securityGroup.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">이름</label>
          <p className="text-sm font-medium mt-1">{securityGroup.name}</p>
        </div>

        {securityGroup.connectionName && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Connection</label>
            <p className="text-sm mt-1">{securityGroup.connectionName}</p>
          </div>
        )}

        {securityGroup.status && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <p className="text-sm mt-1">{securityGroup.status}</p>
          </div>
        )}

        {securityGroup.rules && securityGroup.rules.length > 0 && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Rules ({securityGroup.rules.length})
            </label>
            <div className="mt-2 space-y-2">
              {securityGroup.rules.map((rule, index) => renderRule(rule, index))}
            </div>
          </div>
        )}

        {(!securityGroup.rules || securityGroup.rules.length === 0) && (
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground text-center">
            Rules가 없습니다.
          </div>
        )}

        {securityGroup.createdAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">생성일</label>
            <p className="text-sm mt-1">
              {new Date(securityGroup.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}

        {securityGroup.updatedAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">수정일</label>
            <p className="text-sm mt-1">
              {new Date(securityGroup.updatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
