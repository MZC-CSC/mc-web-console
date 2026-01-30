'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { HelpCircle, Info } from 'lucide-react';

/**
 * TooltipExtended 컴포넌트
 *
 * shadcn/ui Tooltip 확장
 * - 긴 텍스트 툴팁
 * - 포지션 자동 조정
 * - 키보드 단축키 표시
 * - 다크 테마 지원
 * - 아이콘 툴팁 (HelpCircle, Info)
 *
 * @example
 * <TooltipExtended content="도움말 텍스트">
 *   <Button>Hover me</Button>
 * </TooltipExtended>
 *
 * <TooltipExtended
 *   content="이것은 삭제 버튼입니다"
 *   shortcut="⌘ Delete"
 * >
 *   <Button>삭제</Button>
 * </TooltipExtended>
 */

export interface TooltipExtendedProps {
  /** 툴팁 내용 */
  content: React.ReactNode;

  /** 자식 요소 (hover 대상) */
  children: React.ReactNode;

  /** 키보드 단축키 */
  shortcut?: string;

  /** 포지션 */
  side?: 'top' | 'right' | 'bottom' | 'left';

  /** 정렬 */
  align?: 'start' | 'center' | 'end';

  /** 딜레이 (ms) */
  delayDuration?: number;

  /** 비활성화 */
  disabled?: boolean;

  /** 추가 CSS 클래스 */
  className?: string;

  /** 최대 너비 */
  maxWidth?: string;
}

export function TooltipExtended({
  content,
  children,
  shortcut,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  disabled = false,
  className,
  maxWidth = '300px',
}: TooltipExtendedProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn('max-w-xs', className)}
          style={{ maxWidth }}
        >
          <div className="space-y-1">
            <div>{content}</div>
            {shortcut && (
              <div className="text-xs text-muted-foreground border-t pt-1 mt-1">
                <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">
                  {shortcut}
                </kbd>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * InfoTooltip 컴포넌트
 *
 * Info 아이콘과 함께 표시되는 툴팁
 */
export interface InfoTooltipProps {
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function InfoTooltip({ content, side = 'top', className }: InfoTooltipProps) {
  return (
    <TooltipExtended content={content} side={side}>
      <Info className={cn('h-4 w-4 text-muted-foreground cursor-help', className)} />
    </TooltipExtended>
  );
}

/**
 * HelpTooltip 컴포넌트
 *
 * HelpCircle 아이콘과 함께 표시되는 툴팁
 */
export interface HelpTooltipProps {
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function HelpTooltip({ content, side = 'top', className }: HelpTooltipProps) {
  return (
    <TooltipExtended content={content} side={side}>
      <HelpCircle className={cn('h-4 w-4 text-muted-foreground cursor-help', className)} />
    </TooltipExtended>
  );
}

/**
 * TruncatedText 컴포넌트
 *
 * 긴 텍스트를 자르고 전체 내용을 툴팁으로 표시
 */
export interface TruncatedTextProps {
  /** 텍스트 */
  text: string;

  /** 최대 길이 */
  maxLength?: number;

  /** 추가 CSS 클래스 */
  className?: string;
}

export function TruncatedText({
  text,
  maxLength = 50,
  className,
}: TruncatedTextProps) {
  const isTruncated = text.length > maxLength;
  const displayText = isTruncated ? `${text.slice(0, maxLength)}...` : text;

  if (!isTruncated) {
    return <span className={className}>{text}</span>;
  }

  return (
    <TooltipExtended content={text}>
      <span className={cn('cursor-help', className)}>{displayText}</span>
    </TooltipExtended>
  );
}

/**
 * MultilineTooltip 컴포넌트
 *
 * 여러 줄 툴팁 (제목 + 내용)
 */
export interface MultilineTooltipProps {
  title: string;
  description: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function MultilineTooltip({
  title,
  description,
  children,
  side = 'top',
}: MultilineTooltipProps) {
  return (
    <TooltipExtended
      content={
        <div className="space-y-1">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      }
      side={side}
      maxWidth="400px"
    >
      {children}
    </TooltipExtended>
  );
}
