'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/common/Button';
import { Logo } from '@/components/common/Logo';
import { useAuthStore } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { apiPostByPath } from '@/lib/api/client';
import { API_PATHS, OPERATION_IDS } from '@/constants/api';

/**
 * 로그아웃 페이지
 */
export default function LogoutPage() {
  const router = useRouter();
  const { isAuthenticated, logout: storeLogout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleLogout = async () => {
      if (isLoggingOut) return;
      
      setIsLoggingOut(true);
      
      try {
        // 로그아웃 API 호출 (선택적)
        if (isAuthenticated) {
          try {
            await apiPostByPath(
              API_PATHS.AUTH.LOGOUT,
              OPERATION_IDS.LOGOUT,
              {
                request: {},
              }
            );
          } catch (error) {
            console.error('Logout API error:', error);
            // API 실패해도 로그아웃은 진행
          }
        }

        // 로컬 스토리지 정리
        if (typeof window !== 'undefined') {
          localStorage.removeItem('menuList');
          localStorage.removeItem('auth-storage');
        }

        // 인증 상태 정리 (store의 logout 직접 호출)
        storeLogout();
        
        // 로그인 페이지로 리다이렉트
        router.push(ROUTES.LOGIN);
      } catch (error) {
        console.error('Logout error:', error);
        // 에러가 발생해도 로그아웃은 진행
        storeLogout();
        router.push(ROUTES.LOGIN);
      }
    };

    handleLogout();
  }, [isAuthenticated, storeLogout, router, isLoggingOut]);

  const handleBackToLogin = () => {
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">로그아웃</CardTitle>
            <CardDescription className="text-center">
              로그아웃이 완료되었습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              안전하게 로그아웃되었습니다. 다시 로그인하려면 아래 버튼을 클릭하세요.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleBackToLogin}
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
