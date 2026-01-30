'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColumnDef } from '@tanstack/react-table';

// New Components
import { StatusBadge, StatusBadgeGroup, StatusType } from '@/components/common/StatusBadge';
import { NotificationCenter } from '@/components/common/NotificationCenter';
import { DataTableAdvanced } from '@/components/common/DataTableAdvanced';
import { useNotifications } from '@/hooks/useNotifications';

import { Trash2, Edit, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 고급 컴포넌트 테스트 페이지
 *
 * Option A - High Priority 컴포넌트 테스트:
 * 1. StatusBadge
 * 2. NotificationCenter
 * 3. DataTableAdvanced
 */
export default function TestAdvancedComponentsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">고급 컴포넌트 테스트</h1>
        <p className="text-muted-foreground">
          Option A - High Priority 컴포넌트 동작 확인
        </p>
      </div>

      <Tabs defaultValue="status-badge" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status-badge">StatusBadge</TabsTrigger>
          <TabsTrigger value="notification-center">NotificationCenter</TabsTrigger>
          <TabsTrigger value="datatable-advanced">DataTable Advanced</TabsTrigger>
        </TabsList>

        {/* StatusBadge Test */}
        <TabsContent value="status-badge" className="space-y-8">
          <StatusBadgeTest />
        </TabsContent>

        {/* NotificationCenter Test */}
        <TabsContent value="notification-center" className="space-y-8">
          <NotificationCenterTest />
        </TabsContent>

        {/* DataTableAdvanced Test */}
        <TabsContent value="datatable-advanced" className="space-y-8">
          <DataTableAdvancedTest />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * StatusBadge 테스트
 */
function StatusBadgeTest() {
  const allStatuses: StatusType[] = [
    'running',
    'stopped',
    'error',
    'pending',
    'success',
    'warning',
    'info',
    'starting',
    'stopping',
    'connected',
    'disconnected',
    'connecting',
    'active',
    'inactive',
  ];

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. 기본 상태 뱃지</h2>
        <Card>
          <CardHeader>
            <CardTitle>모든 상태 표시</CardTitle>
            <CardDescription>14개 기본 상태</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {allStatuses.map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. 애니메이션 뱃지</h2>
        <Card>
          <CardHeader>
            <CardTitle>애니메이션 효과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="starting" />
              <StatusBadge status="stopping" />
              <StatusBadge status="connecting" />
              <StatusBadge status="running" animated animationType="pulse" />
              <StatusBadge status="error" animated animationType="pulse" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. 사이즈 옵션</h2>
        <Card>
          <CardHeader>
            <CardTitle>Small / Default / Large</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center flex-wrap gap-3">
              <StatusBadge status="running" size="sm" />
              <StatusBadge status="running" size="default" />
              <StatusBadge status="running" size="lg" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. 커스텀 뱃지</h2>
        <Card>
          <CardHeader>
            <CardTitle>커스텀 라벨 및 색상</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="custom" label="Processing" color="purple" />
              <StatusBadge status="custom" label="Deploying" color="blue" animated />
              <StatusBadge status="custom" label="Archived" color="gray" />
              <StatusBadge status="custom" label="Critical" color="red" hideIcon />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. StatusBadgeGroup</h2>
        <Card>
          <CardHeader>
            <CardTitle>상태 그룹 표시</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadgeGroup
              statuses={[
                { status: 'running', count: 5 },
                { status: 'stopped', count: 2 },
                { status: 'error', count: 1 },
                { status: 'pending', count: 3 },
              ]}
            />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

/**
 * NotificationCenter 테스트
 */
function NotificationCenterTest() {
  const { addNotification } = useNotifications();

  const handleAddNotification = (type: 'info' | 'success' | 'warning' | 'error') => {
    const messages = {
      info: { title: '정보 알림', message: '새로운 정보가 있습니다.' },
      success: { title: '작업 완료', message: 'VM 인스턴스가 성공적으로 생성되었습니다.' },
      warning: { title: '경고', message: 'CPU 사용률이 80%를 초과했습니다.' },
      error: { title: '오류 발생', message: '네트워크 연결에 실패했습니다.' },
    };

    addNotification({
      type,
      ...messages[type],
      link: '/dashboard',
    });
  };

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. NotificationCenter</h2>
        <Card>
          <CardHeader>
            <CardTitle>알림 센터 테스트</CardTitle>
            <CardDescription>우측 상단의 종 아이콘을 클릭하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  아래 버튼을 클릭하여 알림을 추가하세요
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => handleAddNotification('info')} variant="outline">
                    정보 알림 추가
                  </Button>
                  <Button onClick={() => handleAddNotification('success')} variant="outline">
                    성공 알림 추가
                  </Button>
                  <Button onClick={() => handleAddNotification('warning')} variant="outline">
                    경고 알림 추가
                  </Button>
                  <Button onClick={() => handleAddNotification('error')} variant="outline">
                    오류 알림 추가
                  </Button>
                </div>
              </div>
              <NotificationCenter />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. 기능 확인</h2>
        <Card>
          <CardHeader>
            <CardTitle>테스트 체크리스트</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>알림 추가 시 뱃지에 개수 표시</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>알림 타입별 아이콘 및 색상 구분</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>전체/읽지않음 탭 전환</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>알림 클릭 시 읽음 표시</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>전체 읽음 표시 버튼</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>개별 삭제 (X 버튼)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>전체 삭제 버튼</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>상대적 시간 표시 (예: "5분 전")</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

/**
 * DataTableAdvanced 테스트
 */
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

function DataTableAdvancedTest() {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: '홍길동', email: 'hong@example.com', role: 'Admin', status: 'active', createdAt: '2024-01-15' },
    { id: '2', name: '김철수', email: 'kim@example.com', role: 'User', status: 'active', createdAt: '2024-01-20' },
    { id: '3', name: '이영희', email: 'lee@example.com', role: 'User', status: 'inactive', createdAt: '2024-02-01' },
    { id: '4', name: '박민수', email: 'park@example.com', role: 'Manager', status: 'active', createdAt: '2024-02-10' },
    { id: '5', name: '정수진', email: 'jung@example.com', role: 'User', status: 'pending', createdAt: '2024-02-15' },
    { id: '6', name: '최동욱', email: 'choi@example.com', role: 'User', status: 'active', createdAt: '2024-03-01' },
    { id: '7', name: '강민지', email: 'kang@example.com', role: 'Admin', status: 'active', createdAt: '2024-03-05' },
    { id: '8', name: '윤서준', email: 'yoon@example.com', role: 'User', status: 'inactive', createdAt: '2024-03-10' },
  ]);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: '이름',
    },
    {
      accessorKey: 'email',
      header: '이메일',
    },
    {
      accessorKey: 'role',
      header: '역할',
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => {
        const status = row.getValue('status') as User['status'];
        const statusMap: Record<User['status'], StatusType> = {
          active: 'active',
          inactive: 'inactive',
          pending: 'pending',
        };
        return <StatusBadge status={statusMap[status]} />;
      },
    },
    {
      accessorKey: 'createdAt',
      header: '생성일',
    },
  ];

  const handleBulkDelete = (selectedUsers: User[]) => {
    if (confirm(`${selectedUsers.length}개 항목을 삭제하시겠습니까?`)) {
      const selectedIds = selectedUsers.map((u) => u.id);
      setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
      alert('삭제되었습니다.');
    }
  };

  const handleBulkEdit = (selectedUsers: User[]) => {
    alert(`${selectedUsers.length}개 항목 수정 (데모)`);
  };

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. 기본 테이블</h2>
        <Card>
          <CardHeader>
            <CardTitle>사용자 목록</CardTitle>
            <CardDescription>DataTableAdvanced 모든 기능 활성화</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTableAdvanced
              data={users}
              columns={columns}
              enableRowSelection
              enableFiltering
              filterColumns={['name', 'email', 'role']}
              enableColumnVisibility
              enableExport
              exportFilename="users"
              bulkActions={[
                {
                  label: '삭제',
                  onClick: handleBulkDelete,
                  variant: 'destructive',
                  icon: Trash2,
                },
                {
                  label: '수정',
                  onClick: handleBulkEdit,
                  icon: Edit,
                },
              ]}
              onRefresh={() => alert('새로고침 (데모)')}
              onRowClick={(user) => alert(`사용자 상세: ${user.name}`)}
              pageSizeOptions={[5, 10, 20]}
              initialPageSize={5}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. 기능 확인</h2>
        <Card>
          <CardHeader>
            <CardTitle>테스트 체크리스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">기본 기능</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>정렬 (컬럼 헤더 클릭)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>페이지네이션</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>페이지 크기 변경</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>행 클릭</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">고급 기능</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>Row 선택 (체크박스)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>전체 선택</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>벌크 액션 (일괄 삭제/수정)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>컬럼 필터링 (이름, 이메일, 역할)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">추가 기능</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>컬럼 가시성 토글</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>CSV 내보내기</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>필터 초기화</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>새로고침</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
