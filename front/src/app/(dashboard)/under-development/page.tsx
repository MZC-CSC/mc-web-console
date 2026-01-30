'use client';

import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

/**
 * Under Development 페이지
 *
 * 개발 중인 화면 표시
 * - 개발 중 메시지
 * - 대시보드로 돌아가기 버튼
 */

export default function UnderDevelopmentPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <Wrench className="h-20 w-20 text-muted-foreground" />
              <AlertCircle className="h-8 w-8 text-yellow-500 absolute -top-1 -right-1" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Under Development</h2>
              <p className="text-muted-foreground">
                이 기능은 현재 개발 중입니다.
              </p>
            </div>

            <div className="pt-4 space-y-2 w-full">
              <p className="text-sm text-muted-foreground">
                곧 사용 가능하도록 준비 중입니다. <br />
                조금만 기다려 주세요!
              </p>
            </div>

            <div className="pt-4 flex gap-2">
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
