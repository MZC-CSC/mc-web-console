'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MyImage } from '@/types/resources';

interface MyImageDetailProps {
  myImage: MyImage | null;
}

/**
 * My Image 상세 정보 컴포넌트
 */
export function MyImageDetail({ myImage }: MyImageDetailProps) {
  if (!myImage) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            My Image를 선택하면 상세 정보가 표시됩니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>My Image 상세 정보</span>
          {myImage.status && (
            <Badge variant={myImage.status === 'available' ? 'default' : 'secondary'}>
              {myImage.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">이름</label>
          <p className="text-sm font-medium mt-1">{myImage.name}</p>
        </div>

        {myImage.source && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Source</label>
            <p className="text-sm mt-1">{myImage.source}</p>
          </div>
        )}

        {myImage.size !== undefined && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Size</label>
            <p className="text-sm mt-1">{myImage.size} GB</p>
          </div>
        )}

        {myImage.connectionName && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Connection</label>
            <p className="text-sm mt-1">{myImage.connectionName}</p>
          </div>
        )}

        {myImage.status && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <p className="text-sm mt-1">{myImage.status}</p>
          </div>
        )}

        {myImage.createdAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">생성일</label>
            <p className="text-sm mt-1">
              {new Date(myImage.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}

        {myImage.updatedAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">수정일</label>
            <p className="text-sm mt-1">
              {new Date(myImage.updatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
