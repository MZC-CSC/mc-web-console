'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/types/resources';

interface ImageDetailProps {
  image: Image | null;
}

/**
 * Image 상세 정보 컴포넌트
 */
export function ImageDetail({ image }: ImageDetailProps) {
  if (!image) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Image를 선택하면 상세 정보가 표시됩니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Image 상세 정보</span>
          {image.status && (
            <Badge variant={image.status === 'available' ? 'default' : 'secondary'}>
              {image.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">이름</label>
          <p className="text-sm font-medium mt-1">{image.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {image.os && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">OS</label>
              <p className="text-sm mt-1">{image.os}</p>
            </div>
          )}

          {image.size !== undefined && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Size</label>
              <p className="text-sm mt-1">{image.size} GB</p>
            </div>
          )}
        </div>

        {image.connectionName && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Connection</label>
            <p className="text-sm mt-1">{image.connectionName}</p>
          </div>
        )}

        {image.status && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <p className="text-sm mt-1">{image.status}</p>
          </div>
        )}

        {image.createdAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">생성일</label>
            <p className="text-sm mt-1">
              {new Date(image.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}

        {image.updatedAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">수정일</label>
            <p className="text-sm mt-1">
              {new Date(image.updatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
