'use client';

import { MenuItem } from '@/types/menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MenuDetailProps {
  item: MenuItem;
  onUpdate?: () => void;
}

/**
 * 메뉴 상세 정보 컴포넌트
 */
export function MenuDetail({ item }: MenuDetailProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{item.name} 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">ID</label>
              <p className="text-sm">{item.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">이름</label>
              <p className="text-sm font-medium">{item.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">부모 ID</label>
              <p className="text-sm">{item.parentId || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">우선순위</label>
              <p className="text-sm">{item.priority}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">메뉴 번호</label>
              <p className="text-sm">{item.menuNumber || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">액션 여부</label>
              <p className="text-sm">{item.isAction ? '예' : '아니오'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">경로</label>
              <p className="text-sm">{item.path || '-'}</p>
            </div>
            {item.icon && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">아이콘</label>
                <p className="text-sm">{item.icon}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
