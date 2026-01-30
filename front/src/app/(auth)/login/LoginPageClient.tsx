'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthLink } from '@/components/auth/AuthLink';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/hooks/useAuth';
import { LoginRequest } from '@/types/auth';
import { ROUTES } from '@/constants/routes';
import { apiPostByPath } from '@/lib/api/client';
import { OPERATION_IDS } from '@/constants/api';
import { BackendMenuItem, convertBackendMenusToMenuItems, MenuItem } from '@/types/menu';
import { toastError } from '@/lib/utils/toast';
import { useQueryClient } from '@tanstack/react-query';

/**
 * 로그인 페이지 클라이언트 컴포넌트
 * Login page client component
 */
export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [sessionMessage, setSessionMessage] = useState<string | undefined>();

  // 로그인 페이지 로드 시 만료된 인증 상태 정리
  // Clear expired authentication state on login page load
  useEffect(() => {
    const authState = useAuthStore.getState();
    if (authState.isAuthenticated) {
      // 쿠키 확인
      const hasCookie = document.cookie.includes('access_token=');
      if (!hasCookie) {
        // 쿠키가 없으면 인증 상태가 유효하지 않으므로 정리
        console.log('[LoginPage] Clearing expired auth state');
        authState.logout();
      }
    }
  }, []); // 마운트 시 한 번만 실행

  // URL 파라미터에서 세션 만료 메시지 확인
  // Check for session expiry message in URL params
  useEffect(() => {
    const expired = searchParams.get('expired');
    const reason = searchParams.get('reason');

    if (expired === 'true') {
      if (reason === 'token_invalid') {
        setSessionMessage('세션이 만료되었습니다. 다시 로그인해주세요.');
      } else if (reason === 'token_refresh_failed') {
        setSessionMessage('인증 정보 갱신에 실패했습니다. 다시 로그인해주세요.');
      } else {
        setSessionMessage('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
    }
  }, [searchParams]);

  // Note: 이미 로그인된 경우의 리다이렉트는 서버 컴포넌트(page.tsx)에서 처리됩니다.
  // Redirect for already authenticated users is handled by the server component (page.tsx).
  // 클라이언트에서 중복 체크하면 React 성능 측정과 충돌하여 타이밍 오류가 발생할 수 있습니다.
  // Duplicate client-side check can cause timing conflicts with React's performance measurement.

  /**
   * 로그인 처리
   * Handle login
   */
  const handleLogin = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // 로그인 API 호출
      // Call login API
      await login(credentials);

      // 메뉴 조회 및 저장
      // Fetch and store menus
      try {
        const menuTree = await fetchAndStoreMenus();
        // React Query 캐시에 직접 설정하여 중복 API 호출 방지
        // Set React Query cache directly to prevent duplicate API calls
        if (menuTree && menuTree.length > 0) {
          queryClient.setQueryData(['menu'], menuTree);
        }
      } catch (menuError) {
        console.error('Menu fetch error:', menuError);
        // 메뉴 조회 실패해도 로그인은 성공한 것으로 처리
        // Menu fetch failure doesn't prevent login
      }

      // 리다이렉트 파라미터가 있으면 해당 경로로, 없으면 대시보드로
      // Redirect to specified path or dashboard
      const redirect = searchParams.get('redirect');
      router.push(redirect || ROUTES.DASHBOARD);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(errorMessage);
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-8">
      <div className="w-full max-w-7xl space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        {sessionMessage && (
          <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800 border border-yellow-200">
            <p className="font-medium">{sessionMessage}</p>
          </div>
        )}
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
        <div className="text-center text-sm text-muted-foreground">
          <AuthLink
            variant="register"
            onClick={() => {
              // TODO: 회원가입 페이지로 이동
              console.log('Register account clicked');
            }}
          >
            계정 등록
          </AuthLink>
        </div>
      </div>
    </div>
  );
}

/**
 * 메뉴 조회 및 로컬 스토리지에 저장
 * Fetch menus and store in localStorage
 * @returns {Promise<MenuItem[] | null>} 메뉴 트리 또는 null
 */
async function fetchAndStoreMenus(): Promise<MenuItem[] | null> {
  try {
    // 메뉴 조회 API 호출
    // Call menu API
    const response = await apiPostByPath<BackendMenuItem[]>(
      '/api/getmenutree',
      OPERATION_IDS.GET_MENU_LIST,
      {
        request: {},
      }
    );

    const backendMenus = response.responseData || [];

    if (backendMenus.length > 0) {
      // 백엔드 메뉴를 프론트엔드 타입으로 변환
      // Convert backend menu to frontend type
      const convertedMenus = convertBackendMenusToMenuItems(backendMenus);

      // 메뉴 트리 구조로 변환
      // Convert to menu tree structure
      const menuTree = convertToMenuTree(convertedMenus);

      // 로컬 스토리지에 저장
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('menuList', JSON.stringify(menuTree));
      }

      return menuTree;
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch menus:', error);
    // 메뉴 조회 실패는 로그인을 막지 않음
    // Menu fetch failure doesn't prevent login
    return null;
  }
}

/**
 * 메뉴 리스트를 트리 구조로 변환
 * Convert menu list to tree structure
 */
function convertToMenuTree(menuList: MenuItem[]): MenuItem[] {
  const menuMap = new Map<string, MenuItem>();

  // 모든 메뉴를 Map에 저장
  // Store all menus in Map
  menuList.forEach((menu) => {
    menuMap.set(menu.id, { ...menu, menus: [] });
  });

  const rootMenus: MenuItem[] = [];

  // 부모-자식 관계 설정
  // Set parent-child relationships
  menuList.forEach((menu) => {
    const menuNode = menuMap.get(menu.id)!;

    if (!menu.parentId || menu.parentId === 'home') {
      rootMenus.push(menuNode);
    } else {
      const parentMenu = menuMap.get(menu.parentId);
      if (parentMenu) {
        if (!parentMenu.menus) {
          parentMenu.menus = [];
        }
        parentMenu.menus.push(menuNode);
      } else {
        // 부모를 찾을 수 없으면 루트에 추가
        // Add to root if parent not found
        rootMenus.push(menuNode);
      }
    }
  });

  // 우선순위로 정렬
  // Sort by priority
  const sortMenus = (menus: MenuItem[]) => {
    menus.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return (a.menuNumber || 0) - (b.menuNumber || 0);
    });

    menus.forEach((menu) => {
      if (menu.menus && menu.menus.length > 0) {
        sortMenus(menu.menus);
      }
    });
  };

  sortMenus(rootMenus);

  return rootMenus;
}
