'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Medium Priority Components
import {
  EmptyState,
  EmptyStateCard,
  EmptyStateType,
} from '@/components/common/EmptyState';
import {
  KeyValueList,
  KeyValueGrid,
  KeyValueItem,
} from '@/components/common/KeyValueList';
import {
  ProgressBar,
  ProgressBarGroup,
  CircularProgress,
} from '@/components/common/ProgressBar';
import { Pagination, SimplePagination } from '@/components/common/Pagination';
import {
  StepIndicator,
  SimpleSteps,
  Step,
} from '@/components/common/StepIndicator';

import { StatusBadge } from '@/components/common/StatusBadge';
import { Plus, RefreshCw, Settings, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Medium Priority 컴포넌트 테스트 페이지
 *
 * 1. EmptyState
 * 2. KeyValueList
 * 3. ProgressBar
 * 4. Pagination
 * 5. StepIndicator
 */
export default function TestMediumComponentsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Medium Priority 컴포넌트 테스트</h1>
        <p className="text-muted-foreground">
          추가 컴포넌트 5개 동작 확인
        </p>
      </div>

      <Tabs defaultValue="empty-state" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="empty-state">EmptyState</TabsTrigger>
          <TabsTrigger value="key-value">KeyValueList</TabsTrigger>
          <TabsTrigger value="progress">ProgressBar</TabsTrigger>
          <TabsTrigger value="pagination">Pagination</TabsTrigger>
          <TabsTrigger value="steps">StepIndicator</TabsTrigger>
        </TabsList>

        <TabsContent value="empty-state" className="space-y-8">
          <EmptyStateTest />
        </TabsContent>

        <TabsContent value="key-value" className="space-y-8">
          <KeyValueListTest />
        </TabsContent>

        <TabsContent value="progress" className="space-y-8">
          <ProgressBarTest />
        </TabsContent>

        <TabsContent value="pagination" className="space-y-8">
          <PaginationTest />
        </TabsContent>

        <TabsContent value="steps" className="space-y-8">
          <StepIndicatorTest />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * EmptyState 테스트
 */
function EmptyStateTest() {
  const types: EmptyStateType[] = [
    'no-data',
    'no-results',
    'error',
    'permission-denied',
    'offline',
    'empty-inbox',
    'empty-database',
  ];

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. 기본 타입</h2>
        <div className="grid grid-cols-2 gap-4">
          {types.map((type) => (
            <Card key={type}>
              <CardContent>
                <EmptyState
                  type={type}
                  title={`${type} 상태`}
                  description="설명 텍스트입니다"
                  size="sm"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. 액션 버튼</h2>
        <div className="grid grid-cols-2 gap-4">
          <EmptyStateCard
            type="no-data"
            title="데이터가 없습니다"
            description="새 항목을 추가해보세요"
            action={{
              label: '추가하기',
              onClick: () => alert('추가'),
              icon: Plus,
            }}
          />
          <EmptyStateCard
            type="no-results"
            title="검색 결과 없음"
            description="다른 검색어를 시도해보세요"
            action={{
              label: '새로고침',
              onClick: () => alert('새로고침'),
              icon: RefreshCw,
            }}
            secondaryAction={{
              label: '설정',
              onClick: () => alert('설정'),
              icon: Settings,
              variant: 'outline',
            }}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. 사이즈</h2>
        <div className="grid grid-cols-3 gap-4">
          <EmptyStateCard
            type="empty-inbox"
            title="Small"
            size="sm"
          />
          <EmptyStateCard
            type="empty-inbox"
            title="Default"
            size="default"
          />
          <EmptyStateCard
            type="empty-inbox"
            title="Large"
            size="lg"
          />
        </div>
      </section>
    </>
  );
}

/**
 * KeyValueList 테스트
 */
function KeyValueListTest() {
  const items: KeyValueItem[] = [
    { label: 'ID', value: 'vm-123456789', copyable: true },
    { label: 'Name', value: 'web-server-01' },
    { label: 'Status', value: <StatusBadge status="running" />, type: 'custom' },
    {
      label: 'URL',
      value: 'https://example.com',
      type: 'link',
      href: 'https://example.com',
      external: true,
    },
    { label: 'Tags', value: ['production', 'web', 'frontend'], type: 'tags' },
    { label: 'Region', value: 'ap-northeast-2' },
    { label: 'Created', value: '2024-01-15 14:30:00' },
  ];

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Horizontal Layout</h2>
        <Card>
          <CardHeader>
            <CardTitle>VM 상세 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <KeyValueList items={items} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Vertical Layout</h2>
        <Card>
          <CardContent className="pt-6">
            <KeyValueList items={items} orientation="vertical" divider={false} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Grid Layout</h2>
        <Card>
          <CardContent className="pt-6">
            <KeyValueGrid items={items} columns={2} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Density</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Compact</CardTitle>
            </CardHeader>
            <CardContent>
              <KeyValueList items={items.slice(0, 4)} density="compact" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Default</CardTitle>
            </CardHeader>
            <CardContent>
              <KeyValueList items={items.slice(0, 4)} density="default" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Comfortable</CardTitle>
            </CardHeader>
            <CardContent>
              <KeyValueList items={items.slice(0, 4)} density="comfortable" />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

/**
 * ProgressBar 테스트
 */
function ProgressBarTest() {
  return (
    <>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. 기본 진행률</h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <ProgressBar value={25} max={100} />
            <ProgressBar value={50} max={100} />
            <ProgressBar value={75} max={100} />
            <ProgressBar value={100} max={100} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. 임계값 색상</h2>
        <Card>
          <CardHeader>
            <CardTitle>리소스 사용량</CardTitle>
            <CardDescription>임계값: 70% (경고), 90% (위험)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgressBar value={50} max={100} label="정상 (50%)" showThreshold />
            <ProgressBar value={75} max={100} label="경고 (75%)" showThreshold />
            <ProgressBar value={95} max={100} label="위험 (95%)" showThreshold />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. 커스텀 단위</h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <ProgressBar value={8.5} max={16} unit="GB" label="메모리 사용량" />
            <ProgressBar value={450} max={1000} unit="Mbps" label="네트워크 트래픽" />
            <ProgressBar value={75} max={100} unit="°C" label="온도" />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. 사이즈</h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <ProgressBar value={60} max={100} size="sm" label="Small" />
            <ProgressBar value={60} max={100} size="default" label="Default" />
            <ProgressBar value={60} max={100} size="lg" label="Large" />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. ProgressBarGroup</h2>
        <Card>
          <CardContent className="pt-6">
            <ProgressBarGroup
              items={[
                { label: 'CPU 사용률', value: 75, max: 100, color: 'primary' },
                { label: '메모리 사용률', value: 60, max: 100, color: 'success' },
                { label: '디스크 사용률', value: 85, max: 100, color: 'warning' },
              ]}
              showThreshold
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Circular Progress</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-around items-center">
              <CircularProgress value={25} max={100} color="primary" />
              <CircularProgress value={50} max={100} color="success" size={100} />
              <CircularProgress value={75} max={100} color="warning" size={140} />
              <CircularProgress value={95} max={100} color="destructive" size={100} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Vertical Progress</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-around items-end gap-8">
              <ProgressBar value={25} max={100} orientation="vertical" height="150px" />
              <ProgressBar value={50} max={100} orientation="vertical" height="200px" />
              <ProgressBar value={75} max={100} orientation="vertical" height="150px" />
              <ProgressBar value={100} max={100} orientation="vertical" height="250px" />
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

/**
 * Pagination 테스트
 */
function PaginationTest() {
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(5);
  const [pageSize, setPageSize] = useState(10);

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. 기본 페이지네이션</h2>
        <Card>
          <CardContent className="pt-6">
            <Pagination
              currentPage={page1}
              totalPages={10}
              onPageChange={setPage1}
              totalItems={100}
              pageSize={10}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. 페이지 크기 변경</h2>
        <Card>
          <CardContent className="pt-6">
            <Pagination
              currentPage={page2}
              totalPages={Math.ceil(250 / pageSize)}
              onPageChange={setPage2}
              totalItems={250}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. 많은 페이지</h2>
        <Card>
          <CardContent className="pt-6">
            <Pagination
              currentPage={50}
              totalPages={100}
              onPageChange={() => {}}
              totalItems={1000}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. 간소화 모드</h2>
        <Card>
          <CardContent className="pt-6">
            <SimplePagination
              currentPage={3}
              totalPages={10}
              onPageChange={() => {}}
            />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

/**
 * StepIndicator 테스트
 */
function StepIndicatorTest() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps: Step[] = [
    {
      id: '1',
      label: '기본 정보',
      description: '이름, 이메일 입력',
    },
    {
      id: '2',
      label: '상세 정보',
      description: '추가 정보 입력',
    },
    {
      id: '3',
      label: '확인',
      description: '입력 내용 확인',
    },
    {
      id: '4',
      label: '완료',
      description: '처리 완료',
    },
  ];

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Horizontal Steps</h2>
        <Card>
          <CardContent className="pt-6">
            <StepIndicator steps={steps} currentStep={currentStep} />
            <div className="flex justify-center gap-2 mt-6">
              <Button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                이전
              </Button>
              <Button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep === steps.length - 1}
              >
                다음
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Vertical Steps</h2>
        <Card>
          <CardContent className="pt-6">
            <StepIndicator
              steps={steps}
              currentStep={2}
              orientation="vertical"
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Clickable Steps</h2>
        <Card>
          <CardContent className="pt-6">
            <StepIndicator
              steps={steps}
              currentStep={currentStep}
              clickable
              onStepClick={setCurrentStep}
            />
            <p className="text-sm text-muted-foreground text-center mt-4">
              완료된 단계를 클릭해보세요
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. 사이즈</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Small</CardTitle>
            </CardHeader>
            <CardContent>
              <StepIndicator
                steps={steps}
                currentStep={1}
                size="sm"
                orientation="vertical"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Default</CardTitle>
            </CardHeader>
            <CardContent>
              <StepIndicator
                steps={steps}
                currentStep={1}
                size="default"
                orientation="vertical"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Large</CardTitle>
            </CardHeader>
            <CardContent>
              <StepIndicator
                steps={steps}
                currentStep={1}
                size="lg"
                orientation="vertical"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Simple Steps</h2>
        <Card>
          <CardContent className="pt-6">
            <SimpleSteps
              steps={['Step 1', 'Step 2', 'Step 3', 'Step 4']}
              currentStep={1}
            />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
