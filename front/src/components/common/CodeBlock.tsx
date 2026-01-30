'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

/**
 * CodeBlock 컴포넌트
 *
 * 코드 표시 및 복사
 * - 구문 강조 (JSON, YAML, Shell, JavaScript, TypeScript 등)
 * - 복사 버튼
 * - 라인 번호
 * - 접기/펼치기
 * - 다운로드 버튼
 *
 * @example
 * <CodeBlock
 *   code={jsonString}
 *   language="json"
 *   showLineNumbers
 *   fileName="config.json"
 * />
 */

export type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'json'
  | 'yaml'
  | 'bash'
  | 'shell'
  | 'python'
  | 'go'
  | 'java'
  | 'sql'
  | 'css'
  | 'html'
  | 'markdown'
  | 'plaintext';

export interface CodeBlockProps {
  /** 코드 */
  code: string;

  /** 언어 */
  language?: CodeLanguage;

  /** 라인 번호 표시 */
  showLineNumbers?: boolean;

  /** 복사 버튼 표시 */
  showCopyButton?: boolean;

  /** 다운로드 버튼 표시 */
  showDownloadButton?: boolean;

  /** 파일명 (다운로드 시 사용) */
  fileName?: string;

  /** 최대 높이 (접기/펼치기용) */
  maxHeight?: string;

  /** 초기 접힘 상태 */
  collapsed?: boolean;

  /** 추가 CSS 클래스 */
  className?: string;

  /** 타이틀 */
  title?: string;
}

export function CodeBlock({
  code,
  language = 'plaintext',
  showLineNumbers = true,
  showCopyButton = true,
  showDownloadButton = false,
  fileName,
  maxHeight = '400px',
  collapsed = false,
  className,
  title,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const { theme } = useTheme();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `code.${getFileExtension(language)}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isDarkTheme = theme === 'dark';
  const syntaxTheme = isDarkTheme ? oneDark : oneLight;

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* 헤더 */}
      {(title || showCopyButton || showDownloadButton) && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            {title && <span className="text-sm font-medium">{title}</span>}
            {language && (
              <span className="text-xs text-muted-foreground uppercase">
                {language}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showCopyButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    복사
                  </>
                )}
              </Button>
            )}
            {showDownloadButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-7 px-2"
              >
                <Download className="h-3 w-3 mr-1" />
                다운로드
              </Button>
            )}
            {collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-7 px-2"
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    펼치기
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    접기
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 코드 */}
      {!isCollapsed && (
        <div className="relative">
          <SyntaxHighlighter
            language={language}
            style={syntaxTheme}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              maxHeight: maxHeight,
              fontSize: '0.875rem',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'var(--font-mono), monospace',
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )}
    </Card>
  );
}

/**
 * InlineCode 컴포넌트
 *
 * 인라인 코드 표시
 */
export interface InlineCodeProps {
  children: string;
  className?: string;
}

export function InlineCode({ children, className }: InlineCodeProps) {
  return (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
        className
      )}
    >
      {children}
    </code>
  );
}

/**
 * CodeComparison 컴포넌트
 *
 * 두 개의 코드를 나란히 비교
 */
export interface CodeComparisonProps {
  before: string;
  after: string;
  language?: CodeLanguage;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function CodeComparison({
  before,
  after,
  language = 'plaintext',
  beforeLabel = 'Before',
  afterLabel = 'After',
  className,
}: CodeComparisonProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      <CodeBlock
        code={before}
        language={language}
        title={beforeLabel}
        showLineNumbers
      />
      <CodeBlock
        code={after}
        language={language}
        title={afterLabel}
        showLineNumbers
      />
    </div>
  );
}

/**
 * JSONViewer 컴포넌트
 *
 * JSON 데이터 뷰어 (자동 포맷팅)
 */
export interface JSONViewerProps {
  data: any;
  title?: string;
  collapsible?: boolean;
  className?: string;
}

export function JSONViewer({
  data,
  title = 'JSON',
  collapsible = true,
  className,
}: JSONViewerProps) {
  const formattedJSON = JSON.stringify(data, null, 2);

  return (
    <CodeBlock
      code={formattedJSON}
      language="json"
      title={title}
      showLineNumbers
      showCopyButton
      showDownloadButton
      fileName="data.json"
      collapsed={collapsible}
      className={className}
    />
  );
}

/**
 * ShellCommand 컴포넌트
 *
 * 셸 커맨드 표시 (복사 최적화)
 */
export interface ShellCommandProps {
  command: string;
  title?: string;
  className?: string;
}

export function ShellCommand({ command, title, className }: ShellCommandProps) {
  return (
    <CodeBlock
      code={command}
      language="bash"
      title={title}
      showLineNumbers={false}
      showCopyButton
      className={className}
    />
  );
}

/**
 * 파일 확장자 가져오기
 */
function getFileExtension(language: CodeLanguage): string {
  const extensionMap: Record<CodeLanguage, string> = {
    javascript: 'js',
    typescript: 'ts',
    jsx: 'jsx',
    tsx: 'tsx',
    json: 'json',
    yaml: 'yaml',
    bash: 'sh',
    shell: 'sh',
    python: 'py',
    go: 'go',
    java: 'java',
    sql: 'sql',
    css: 'css',
    html: 'html',
    markdown: 'md',
    plaintext: 'txt',
  };

  return extensionMap[language] || 'txt';
}
