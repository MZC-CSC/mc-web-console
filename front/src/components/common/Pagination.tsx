'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

/**
 * Pagination 컴포넌트
 *
 * 독립적인 페이지네이션 컴포넌트
 * - 페이지 번호 표시 (1, 2, 3 ... 10)
 * - 이전/다음 버튼
 * - 첫 페이지/마지막 페이지 버튼
 * - 페이지 크기 선택
 * - 총 아이템 수 표시
 * - 모바일 대응 (간소화된 UI)
 *
 * @example
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={setPage}
 *   totalItems={100}
 *   pageSize={10}
 *   onPageSizeChange={setPageSize}
 * />
 */

export interface PaginationProps {
  /** 현재 페이지 (1부터 시작) */
  currentPage: number;

  /** 전체 페이지 수 */
  totalPages: number;

  /** 페이지 변경 핸들러 */
  onPageChange: (page: number) => void;

  /** 총 아이템 수 */
  totalItems?: number;

  /** 페이지 크기 */
  pageSize?: number;

  /** 페이지 크기 변경 핸들러 */
  onPageSizeChange?: (size: number) => void;

  /** 페이지 크기 옵션 */
  pageSizeOptions?: number[];

  /** 표시할 페이지 버튼 개수 */
  siblingCount?: number;

  /** 첫/마지막 페이지 버튼 표시 */
  showFirstLast?: boolean;

  /** 페이지 크기 선택기 표시 */
  showPageSize?: boolean;

  /** 총 아이템 수 표시 */
  showTotalItems?: boolean;

  /** 모바일 간소화 모드 */
  simplified?: boolean;

  /** 추가 CSS 클래스 */
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  siblingCount = 1,
  showFirstLast = true,
  showPageSize = true,
  showTotalItems = true,
  simplified = false,
  className,
}: PaginationProps) {
  // 페이지 번호 배열 생성
  const pages = useMemo(() => {
    return generatePageNumbers(currentPage, totalPages, siblingCount);
  }, [currentPage, totalPages, siblingCount]);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  if (simplified) {
    return (
      <div className={cn('flex items-center justify-between gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          이전
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          다음
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
      {/* 좌측: 총 아이템 수 & 페이지 크기 */}
      <div className="flex items-center gap-4">
        {showTotalItems && totalItems !== undefined && (
          <div className="text-sm text-muted-foreground">
            총 {totalItems.toLocaleString()}개 항목
          </div>
        )}
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">페이지당</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* 우측: 페이지 네비게이션 */}
      <div className="flex items-center gap-1">
        {/* 첫 페이지 */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={!canGoPrevious}
            className="h-8 w-8"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* 이전 페이지 */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 페이지 번호들 */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((page, index) => {
            if (page === 'ellipsis-left' || page === 'ellipsis-right') {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="h-8 w-8 flex items-center justify-center"
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isActive ? 'default' : 'outline'}
                size="icon"
                onClick={() => handlePageChange(pageNumber)}
                className={cn('h-8 w-8', isActive && 'pointer-events-none')}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* 모바일: 현재 페이지 표시 */}
        <div className="sm:hidden flex items-center px-3">
          <span className="text-sm">
            {currentPage} / {totalPages}
          </span>
        </div>

        {/* 다음 페이지 */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* 마지막 페이지 */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(totalPages)}
            disabled={!canGoNext}
            className="h-8 w-8"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * 페이지 번호 배열 생성 함수
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | 'ellipsis-left' | 'ellipsis-right')[] {
  // 전체 표시할 페이지 수 계산
  const totalNumbers = siblingCount * 2 + 3; // 현재 + 좌우 sibling + 첫/마지막
  const totalBlocks = totalNumbers + 2; // + 2 ellipsis

  if (totalPages <= totalBlocks) {
    // 페이지가 충분히 적으면 전부 표시
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];

  // 첫 페이지
  pages.push(1);

  // 왼쪽 ellipsis
  if (shouldShowLeftEllipsis) {
    pages.push('ellipsis-left');
  } else if (leftSiblingIndex === 2) {
    pages.push(2);
  }

  // 중간 페이지들
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }

  // 오른쪽 ellipsis
  if (shouldShowRightEllipsis) {
    pages.push('ellipsis-right');
  } else if (rightSiblingIndex === totalPages - 1) {
    pages.push(totalPages - 1);
  }

  // 마지막 페이지
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * SimplePagination 컴포넌트
 *
 * 더 간단한 페이지네이션 (이전/다음만)
 */
export interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: SimplePaginationProps) {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      simplified
      showPageSize={false}
      showTotalItems={false}
      showFirstLast={false}
      className={className}
    />
  );
}
