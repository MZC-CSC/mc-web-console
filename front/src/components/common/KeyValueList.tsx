'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';

/**
 * KeyValueList 컴포넌트
 *
 * 상세 정보 표시용 키-값 리스트
 * - 라벨: 값 형태로 표시
 * - 복사 버튼 (값 클립보드 복사)
 * - 링크 값 지원
 * - 태그 값 지원 (배열)
 * - 조건부 표시 (값이 없으면 숨김)
 *
 * @example
 * <KeyValueList
 *   items={[
 *     { label: 'ID', value: 'vm-123', copyable: true },
 *     { label: 'Status', value: <StatusBadge status="running" /> },
 *     { label: 'Tags', value: ['prod', 'web'], type: 'tags' },
 *   ]}
 * />
 */

export type KeyValueItemType = 'text' | 'link' | 'tags' | 'custom';

export interface KeyValueItem {
  /** 라벨 */
  label: string;

  /** 값 (문자열, 숫자, React 노드, 문자열 배열) */
  value: string | number | React.ReactNode | string[];

  /** 타입 */
  type?: KeyValueItemType;

  /** 복사 가능 여부 */
  copyable?: boolean;

  /** 링크 URL (type이 'link'일 때) */
  href?: string;

  /** 외부 링크 여부 */
  external?: boolean;

  /** 숨김 조건 (값이 없으면 숨김) */
  hideIfEmpty?: boolean;

  /** 라벨 너비 (기본값: auto) */
  labelWidth?: string;

  /** 추가 CSS 클래스 */
  className?: string;
}

export interface KeyValueListProps {
  /** 키-값 아이템 목록 */
  items: KeyValueItem[];

  /** 레이아웃 방향 */
  orientation?: 'horizontal' | 'vertical';

  /** 구분선 표시 */
  divider?: boolean;

  /** 라벨 너비 (모든 아이템 공통) */
  labelWidth?: string;

  /** 밀집도 */
  density?: 'compact' | 'default' | 'comfortable';

  /** 추가 CSS 클래스 */
  className?: string;
}

const DENSITY_CONFIG = {
  compact: 'py-1.5',
  default: 'py-2',
  comfortable: 'py-3',
};

export function KeyValueList({
  items,
  orientation = 'horizontal',
  divider = true,
  labelWidth,
  density = 'default',
  className,
}: KeyValueListProps) {
  return (
    <dl
      className={cn(
        'space-y-0',
        orientation === 'vertical' && 'space-y-2',
        className
      )}
    >
      {items.map((item, index) => {
        // hideIfEmpty가 true이고 값이 없으면 숨김
        if (item.hideIfEmpty && !item.value) {
          return null;
        }

        return (
          <KeyValueItem
            key={index}
            item={item}
            orientation={orientation}
            divider={divider && index < items.length - 1}
            labelWidth={item.labelWidth || labelWidth}
            density={density}
          />
        );
      })}
    </dl>
  );
}

/**
 * KeyValueItem 내부 컴포넌트
 */
interface KeyValueItemProps {
  item: KeyValueItem;
  orientation: 'horizontal' | 'vertical';
  divider: boolean;
  labelWidth?: string;
  density: 'compact' | 'default' | 'comfortable';
}

function KeyValueItem({
  item,
  orientation,
  divider,
  labelWidth = 'w-32',
  density,
}: KeyValueItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const textValue =
        typeof item.value === 'string' || typeof item.value === 'number'
          ? String(item.value)
          : Array.isArray(item.value)
          ? item.value.join(', ')
          : '';

      await navigator.clipboard.writeText(textValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const renderValue = () => {
    // 커스텀 타입이거나 React 노드인 경우
    if (
      item.type === 'custom' ||
      (typeof item.value !== 'string' &&
        typeof item.value !== 'number' &&
        !Array.isArray(item.value))
    ) {
      return <div className="flex items-center gap-2">{item.value}</div>;
    }

    // 링크 타입
    if (item.type === 'link' && item.href) {
      const linkContent = (
        <>
          <span>{item.value}</span>
          {item.external && <ExternalLink className="h-3 w-3 ml-1" />}
        </>
      );

      if (item.external) {
        return (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center"
          >
            {linkContent}
          </a>
        );
      }

      return (
        <Link
          href={item.href}
          className="text-primary hover:underline inline-flex items-center"
        >
          {linkContent}
        </Link>
      );
    }

    // 태그 타입 (배열)
    if (item.type === 'tags' && Array.isArray(item.value)) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {item.value.map((tag, idx) => (
            <Badge key={idx} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      );
    }

    // 일반 텍스트
    return <span className="text-foreground">{item.value}</span>;
  };

  return (
    <div
      className={cn(
        'group',
        DENSITY_CONFIG[density],
        divider && 'border-b',
        orientation === 'horizontal' && 'flex',
        orientation === 'vertical' && 'space-y-1',
        item.className
      )}
    >
      {/* 라벨 */}
      <dt
        className={cn(
          'text-sm font-medium text-muted-foreground',
          orientation === 'horizontal' && labelWidth,
          orientation === 'horizontal' && 'flex-shrink-0'
        )}
      >
        {item.label}
      </dt>

      {/* 값 */}
      <dd
        className={cn(
          'text-sm',
          orientation === 'horizontal' && 'flex-1',
          'flex items-center gap-2'
        )}
      >
        <div className="flex-1 min-w-0">{renderValue()}</div>

        {/* 복사 버튼 */}
        {item.copyable && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            onClick={handleCopy}
            title="복사"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </dd>
    </div>
  );
}

/**
 * KeyValueGrid 컴포넌트
 *
 * 그리드 레이아웃으로 표시하는 KeyValueList
 */
export interface KeyValueGridProps {
  items: KeyValueItem[];
  columns?: 1 | 2 | 3 | 4;
  divider?: boolean;
  labelWidth?: string;
  density?: 'compact' | 'default' | 'comfortable';
  className?: string;
}

export function KeyValueGrid({
  items,
  columns = 2,
  divider = false,
  labelWidth,
  density = 'default',
  className,
}: KeyValueGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {items.map((item, index) => {
        if (item.hideIfEmpty && !item.value) {
          return null;
        }

        return (
          <KeyValueList
            key={index}
            items={[item]}
            divider={divider}
            labelWidth={labelWidth}
            density={density}
            orientation="vertical"
          />
        );
      })}
    </div>
  );
}
