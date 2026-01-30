'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * IFrameWrapper 컴포넌트
 *
 * IFrame 통합 래퍼
 * - 로딩 상태 표시
 * - 에러 핸들링
 * - 높이 자동 조정 (선택)
 * - 샌드박스 설정
 *
 * @example
 * <IFrameWrapper
 *   src="https://example.com/dashboard"
 *   title="External Dashboard"
 *   height="600px"
 * />
 */

export interface IFrameWrapperProps {
  /** IFrame src URL */
  src: string;
  /** IFrame title (접근성) */
  title: string;
  /** IFrame 높이 (기본: 600px) */
  height?: string | number;
  /** IFrame 너비 (기본: 100%) */
  width?: string | number;
  /** 자동 높이 조정 활성화 */
  autoHeight?: boolean;
  /** 샌드박스 설정 (기본: allow-scripts allow-same-origin) */
  sandbox?: string;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 로딩 완료 핸들러 */
  onLoad?: () => void;
  /** 에러 핸들러 */
  onError?: (error: Error) => void;
  /** 로딩 메시지 커스터마이징 */
  loadingMessage?: string;
  /** 에러 메시지 커스터마이징 */
  errorMessage?: string;
}

export function IFrameWrapper({
  src,
  title,
  height = '600px',
  width = '100%',
  autoHeight = false,
  sandbox = 'allow-scripts allow-same-origin',
  className,
  onLoad,
  onError,
  loadingMessage = '콘텐츠를 불러오는 중...',
  errorMessage = 'IFrame 콘텐츠를 불러올 수 없습니다.',
}: IFrameWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(height);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // URL 유효성 검사
    try {
      new URL(src);
    } catch (e) {
      setHasError(true);
      setIsLoading(false);
      if (onError) {
        onError(new Error('Invalid URL'));
      }
    }
  }, [src, onError]);

  useEffect(() => {
    if (!autoHeight || !iframeRef.current) return;

    const handleMessage = (event: MessageEvent) => {
      // 같은 origin에서만 메시지 수신
      try {
        const url = new URL(src);
        if (event.origin !== url.origin) return;

        if (event.data.type === 'resize' && event.data.height) {
          setIframeHeight(`${event.data.height}px`);
        }
      } catch (e) {
        // origin 확인 실패 시 무시
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [autoHeight, src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);

    if (onLoad) {
      onLoad();
    }

    // 자동 높이 조정 시도
    if (autoHeight && iframeRef.current) {
      try {
        const iframeDocument = iframeRef.current.contentDocument;
        if (iframeDocument) {
          const bodyHeight = iframeDocument.body.scrollHeight;
          setIframeHeight(`${bodyHeight}px`);
        }
      } catch (e) {
        // Same-origin policy로 인해 실패할 수 있음
        console.warn('Cannot access iframe content for auto-height:', e);
      }
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);

    if (onError) {
      onError(new Error('IFrame load failed'));
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {hasError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>
            {errorMessage}
            <br />
            <span className="text-xs">URL: {src}</span>
          </AlertDescription>
        </Alert>
      )}

      {/* IFrame */}
      {!hasError && (
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          width={width}
          height={iframeHeight}
          sandbox={sandbox}
          className={cn(
            'border-0 rounded-lg',
            isLoading && 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
}

/**
 * IFrameModal 컴포넌트
 *
 * IFrame을 모달로 표시
 */
export interface IFrameModalProps extends IFrameWrapperProps {
  /** 모달 열림 상태 */
  open: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
}

export function IFrameModal({
  open,
  onClose,
  ...iframeProps
}: IFrameModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl h-[90vh] bg-background rounded-lg shadow-lg p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 rounded-md hover:bg-accent"
          aria-label="닫기"
        >
          ✕
        </button>
        <IFrameWrapper
          {...iframeProps}
          height="100%"
          className="h-full"
        />
      </div>
    </div>
  );
}
