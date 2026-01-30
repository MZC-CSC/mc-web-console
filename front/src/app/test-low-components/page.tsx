'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Low Priority Components
import {
  TooltipExtended,
  InfoTooltip,
  HelpTooltip,
  TruncatedText,
  MultilineTooltip,
} from '@/components/common/TooltipExtended';
import {
  Timeline,
  CompactTimeline,
  ActivityTimeline,
  TimelineItem,
} from '@/components/common/Timeline';
import {
  CodeBlock,
  InlineCode,
  CodeComparison,
  JSONViewer,
  ShellCommand,
} from '@/components/common/CodeBlock';

import { Button } from '@/components/ui/button';
import { Settings, Trash2, Save } from 'lucide-react';

/**
 * Low Priority 컴포넌트 테스트 페이지
 *
 * 1. TooltipExtended
 * 2. Timeline
 * 3. CodeBlock
 */
export default function TestLowComponentsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Low Priority 컴포넌트 테스트</h1>
        <p className="text-muted-foreground">
          추가 컴포넌트 3개 동작 확인
        </p>
      </div>

      <Tabs defaultValue="tooltip" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tooltip">TooltipExtended</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="codeblock">CodeBlock</TabsTrigger>
        </TabsList>

        <TabsContent value="tooltip" className="space-y-8">
          <TooltipTest />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-8">
          <TimelineTest />
        </TabsContent>

        <TabsContent value="codeblock" className="space-y-8">
          <CodeBlockTest />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Tooltip 테스트
 */
function TooltipTest() {
  return (
    <>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. 기본 툴팁</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <TooltipExtended content="이것은 기본 툴팁입니다">
                <Button>Hover me</Button>
              </TooltipExtended>

              <TooltipExtended
                content="이것은 상단에 표시되는 툴팁입니다"
                side="top"
              >
                <Button variant="outline">Top</Button>
              </TooltipExtended>

              <TooltipExtended
                content="이것은 우측에 표시되는 툴팁입니다"
                side="right"
              >
                <Button variant="outline">Right</Button>
              </TooltipExtended>

              <TooltipExtended
                content="이것은 하단에 표시되는 툴팁입니다"
                side="bottom"
              >
                <Button variant="outline">Bottom</Button>
              </TooltipExtended>

              <TooltipExtended
                content="이것은 좌측에 표시되는 툴팁입니다"
                side="left"
              >
                <Button variant="outline">Left</Button>
              </TooltipExtended>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. 키보드 단축키</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <TooltipExtended content="파일 저장" shortcut="⌘ S">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
              </TooltipExtended>

              <TooltipExtended content="삭제" shortcut="⌘ Delete">
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </Button>
              </TooltipExtended>

              <TooltipExtended content="설정 열기" shortcut="⌘ ,">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  설정
                </Button>
              </TooltipExtended>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. 아이콘 툴팁</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span>사용자 이름</span>
                <InfoTooltip content="사용자의 전체 이름을 입력하세요" />
              </div>
              <div className="flex items-center gap-2">
                <span>비밀번호</span>
                <HelpTooltip content="8자 이상, 특수문자 포함" />
              </div>
              <div className="flex items-center gap-2">
                <span>이메일 주소</span>
                <InfoTooltip content="유효한 이메일 주소를 입력하세요" side="right" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. 긴 텍스트 자르기</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p>
                <TruncatedText
                  text="이것은 매우 긴 텍스트입니다. 이 텍스트는 자동으로 잘리고 전체 내용은 툴팁으로 표시됩니다."
                  maxLength={30}
                />
              </p>
              <p>
                <TruncatedText
                  text="짧은 텍스트"
                  maxLength={30}
                />
              </p>
              <p>
                파일명:{' '}
                <TruncatedText
                  text="very-long-file-name-that-should-be-truncated-for-better-display.pdf"
                  maxLength={40}
                  className="font-mono"
                />
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. 멀티라인 툴팁</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <MultilineTooltip
                title="VM 인스턴스 생성"
                description="새로운 가상 머신을 생성합니다. 인스턴스 타입, 리전, 네트워크 설정을 지정할 수 있습니다."
              >
                <Button>VM 생성</Button>
              </MultilineTooltip>

              <MultilineTooltip
                title="데이터베이스 백업"
                description="현재 데이터베이스의 전체 백업을 수행합니다. 백업은 최대 30일간 보관됩니다."
                side="bottom"
              >
                <Button variant="outline">백업</Button>
              </MultilineTooltip>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

/**
 * Timeline 테스트
 */
function TimelineTest() {
  const timelineItems: TimelineItem[] = [
    {
      id: '1',
      type: 'success',
      title: 'VM 인스턴스 생성 완료',
      description: 'web-server-01이 성공적으로 생성되었습니다',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      user: '홍길동',
      resource: 'vm-123456',
    },
    {
      id: '2',
      type: 'info',
      title: '네트워크 설정 변경',
      description: '보안 그룹 규칙이 업데이트되었습니다',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      user: '김철수',
    },
    {
      id: '3',
      type: 'warning',
      title: 'CPU 사용률 높음',
      description: 'db-server-01의 CPU 사용률이 85%를 초과했습니다',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      resource: 'vm-789012',
    },
    {
      id: '4',
      type: 'error',
      title: '네트워크 연결 실패',
      description: '타임아웃이 발생했습니다',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      user: '이영희',
    },
    {
      id: '5',
      type: 'success',
      title: '백업 완료',
      description: '데이터베이스 백업이 완료되었습니다',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '6',
      type: 'info',
      title: '시스템 업데이트',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  ];

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. 기본 타임라인</h2>
        <Card>
          <CardHeader>
            <CardTitle>시스템 이벤트</CardTitle>
            <CardDescription>최근 활동 내역</CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline items={timelineItems.slice(0, 4)} timeFormat="relative" />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. 시간 포맷</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>상대적 시간</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline items={timelineItems.slice(0, 3)} timeFormat="relative" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>절대적 시간</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline items={timelineItems.slice(0, 3)} timeFormat="absolute" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. 접기/펼치기</h2>
        <Card>
          <CardHeader>
            <CardTitle>모든 이벤트</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline
              items={timelineItems}
              collapsible
              initialCount={3}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Compact Timeline</h2>
        <Card>
          <CardHeader>
            <CardTitle>간소화된 타임라인</CardTitle>
          </CardHeader>
          <CardContent>
            <CompactTimeline items={timelineItems} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Activity Timeline</h2>
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline items={timelineItems} maxItems={4} />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

/**
 * CodeBlock 테스트
 */
function CodeBlockTest() {
  const jsonCode = `{
  "name": "mc-web-console",
  "version": "1.0.0",
  "description": "Multi-Cloud Web Console",
  "dependencies": {
    "react": "^19.0.0",
    "next": "^16.0.0"
  }
}`;

  const yamlCode = `apiVersion: v1
kind: Service
metadata:
  name: web-server
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080`;

  const shellCode = `# VM 인스턴스 생성
kubectl create deployment web-server --image=nginx:latest
kubectl expose deployment web-server --port=80 --type=LoadBalancer

# 상태 확인
kubectl get pods -l app=web-server`;

  const typescriptCode = `import { useState, useEffect } from 'react';

export function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);

  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);

  return {
    count,
    increment: () => setCount((c) => c + 1),
    decrement: () => setCount((c) => c - 1),
  };
}`;

  const pythonCode = `def fibonacci(n):
    """피보나치 수열 생성"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]

    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])

    return fib

print(fibonacci(10))`;

  const jsonData = {
    user: {
      id: 'user-123',
      name: '홍길동',
      email: 'hong@example.com',
      roles: ['admin', 'developer'],
      metadata: {
        createdAt: '2024-01-15',
        lastLogin: '2024-03-20',
      },
    },
  };

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. JSON</h2>
        <CodeBlock
          code={jsonCode}
          language="json"
          title="package.json"
          showLineNumbers
          showCopyButton
          showDownloadButton
          fileName="package.json"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. YAML</h2>
        <CodeBlock
          code={yamlCode}
          language="yaml"
          title="service.yaml"
          showLineNumbers
          showCopyButton
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Shell 스크립트</h2>
        <CodeBlock
          code={shellCode}
          language="bash"
          title="deploy.sh"
          showLineNumbers
          showCopyButton
          showDownloadButton
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. TypeScript</h2>
        <CodeBlock
          code={typescriptCode}
          language="typescript"
          title="useCounter.ts"
          showLineNumbers
          showCopyButton
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Python</h2>
        <CodeBlock
          code={pythonCode}
          language="python"
          title="fibonacci.py"
          showLineNumbers
          showCopyButton
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. 접기/펼치기</h2>
        <CodeBlock
          code={typescriptCode}
          language="typescript"
          title="Collapsible Code"
          collapsed
          maxHeight="200px"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Inline Code</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm">
              다음 명령어를 실행하세요: <InlineCode>npm install</InlineCode>
            </p>
            <p className="text-sm mt-2">
              변수 <InlineCode>count</InlineCode>를 사용하여 값을 저장합니다.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Code Comparison</h2>
        <CodeComparison
          before={`function add(a, b) {
  return a + b;
}`}
          after={`function add(a: number, b: number): number {
  return a + b;
}`}
          language="typescript"
          beforeLabel="JavaScript"
          afterLabel="TypeScript"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">9. JSON Viewer</h2>
        <JSONViewer
          data={jsonData}
          title="User Data"
          collapsible
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">10. Shell Command</h2>
        <ShellCommand
          command="kubectl get pods -n production --selector=app=web-server"
          title="Get Pods"
        />
      </section>
    </>
  );
}
