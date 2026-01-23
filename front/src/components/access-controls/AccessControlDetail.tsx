'use client';

import { AccessControl } from '@/types/workspace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessControlDetailProps {
  item: AccessControl;
  onUpdate?: () => void;
}

/**
 * Access Control 상세 정보 컴포넌트
 */
export function AccessControlDetail({ item }: AccessControlDetailProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Operation ID</label>
            <p className="text-sm font-medium">{item.operationId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Resource</label>
            <p className="text-sm">{item.resource || '-'}</p>
          </div>
          {item.framework && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Framework</label>
              <p className="text-sm">{item.framework}</p>
            </div>
          )}
          {item.policies && item.policies.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Policies</label>
              <div className="mt-2 space-y-2">
                {item.policies.map((policy, index) => (
                  <div key={policy.id || index} className="rounded-md border p-3">
                    <div className="text-sm font-medium">{policy.name || `Policy ${index + 1}`}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Effect: {policy.effect}
                    </div>
                    {policy.actions && policy.actions.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Actions: {policy.actions.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
