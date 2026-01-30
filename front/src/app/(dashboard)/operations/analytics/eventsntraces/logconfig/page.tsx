'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { Plus } from 'lucide-react';

/**
 * Log Config 페이지
 *
 * 로그 설정 관리
 * - 로그 수집 설정
 * - 로그 저장 설정
 * - 로그 필터 설정
 */

export default function LogConfigPage() {
  const handleCreate = () => {
    console.log('Create log config');
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Log Config</h1>
          <p className="text-muted-foreground mt-2">
            로그 수집 및 저장 설정 관리
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Config
        </Button>
      </div>

      {/* 설정 목록 (현재 비어있음) */}
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            type="no-data"
            title="로그 설정이 없습니다"
            description="새로운 로그 수집 설정을 생성하세요"
            action={{
              label: 'Create Log Config',
              onClick: handleCreate,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
