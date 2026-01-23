'use client';

import { UserInfo } from '@/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserDetailProps {
  item: UserInfo;
  onUpdate?: () => void;
}

/**
 * 사용자 상세 정보 컴포넌트
 */
export function UserDetail({ item }: UserDetailProps) {
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
            <label className="text-sm font-medium text-muted-foreground">사용자명</label>
            <p className="text-sm font-medium">{item.username}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">이메일</label>
            <p className="text-sm">{item.email}</p>
          </div>
          {item.firstName && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">이름</label>
              <p className="text-sm">{item.firstName} {item.lastName || ''}</p>
            </div>
          )}
          {item.roles && item.roles.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">역할</label>
              <p className="text-sm">{item.roles.join(', ')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
