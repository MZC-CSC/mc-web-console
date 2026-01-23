'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/common/Button';
import { Logo } from '@/components/common/Logo';
import { ROUTES } from '@/constants/routes';
import { AlertCircle } from 'lucide-react';

/**
 * 권한 없음 페이지
 * 접근 권한이 없는 리소스에 접근할 때 표시되는 페이지입니다.
 */
export default function UnauthorizedPage() {
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push(ROUTES.LOGIN);
  };

  const handleBackToDashboard = () => {
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">권한 없음</CardTitle>
            <CardDescription className="text-center">
              이 페이지에 접근할 권한이 없습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              요청하신 리소스에 접근할 수 있는 권한이 없습니다.
              <br />
              관리자에게 문의하시거나 다른 계정으로 로그인해주세요.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              onClick={handleBackToDashboard}
              variant="default"
              className="w-full"
            >
              대시보드로 이동
            </Button>
            <Button
              onClick={handleBackToLogin}
              variant="outline"
              className="w-full"
            >
              로그인 페이지로 이동
            </Button>
          </CardFooter>
        </Card>
        <div className="text-center text-sm text-muted-foreground">
          <a
            href="#"
            className="hover:text-primary underline underline-offset-4"
            onClick={(e) => {
              e.preventDefault();
              // TODO: 회원가입 페이지로 이동
            }}
          >
            계정 등록
          </a>
        </div>
      </div>
    </div>
  );
}
