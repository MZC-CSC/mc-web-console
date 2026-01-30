'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/common/Button';
import { FormSelect } from '@/components/common/FormSelect';
import { SpecConfigForm } from './SpecConfigForm';
import { AcceleratorConfigForm } from './AcceleratorConfigForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { Spec, SpecConfig, AcceleratorConfig, RecommendVmRequest } from '@/types/mci-workloads';
import { useServerRecommendation } from '@/hooks/api/useMCIWorkloads';
import {
  REGIONS,
  PROVIDER_OPTIONS,
  buildFilterPolicies,
  buildPriorityPolicies,
  validateSpecConfig,
  validateAcceleratorConfig,
  type RegionKey,
} from '@/lib/utils/recommendationUtils';
import { toastError } from '@/lib/utils/toast';

interface SpecRecommendationModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (spec: Spec) => void;
}

/**
 * Server Spec Recommendation Modal (Buffalo 호환)
 * Region, Spec Config, Accelerator Config 기반 서버 스펙 추천
 */
export function SpecRecommendationModal({
  open,
  onClose,
  onApply,
}: SpecRecommendationModalProps) {
  // Region 선택
  const [region, setRegion] = useState<RegionKey | ''>('seoul');

  // Spec Config
  const [specConfig, setSpecConfig] = useState<SpecConfig>({});

  // Accelerator Config
  const [acceleratorConfig, setAcceleratorConfig] = useState<AcceleratorConfig>({});

  // Provider Filter
  const [providerFilter, setProviderFilter] = useState('');

  // 선택된 Spec
  const [selectedSpec, setSelectedSpec] = useState<Spec | null>(null);

  // Pagination 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // API Hook
  const { mutate, data, isPending } = useServerRecommendation();

  /**
   * 검색 실행
   */
  const handleSearch = () => {
    // Validation
    const specErrors = validateSpecConfig(specConfig);
    const acceleratorErrors = validateAcceleratorConfig(acceleratorConfig);
    const allErrors = [...specErrors, ...acceleratorErrors];

    if (allErrors.length > 0) {
      allErrors.forEach((error) => toastError(error));
      return;
    }

    // Build Filter Policies
    const filterPolicies = buildFilterPolicies(specConfig, acceleratorConfig);

    // Build Priority Policies (Location)
    // Region이 빈 값일 경우 기본 Region(seoul) 사용
    const selectedRegion = region || 'seoul';
    const coordinates = REGIONS[selectedRegion];
    const priorityPolicies = buildPriorityPolicies(coordinates.lat, coordinates.lon);

    // API Request
    const request: RecommendVmRequest = {
      request: {
        filter: {
          policy: filterPolicies,
        },
        priority: {
          policy: priorityPolicies,
        },
        limit: '1000',
      },
    };

    console.log('[SpecRecommendationModal] Search request:', request);

    // 검색 시 페이지 리셋
    setCurrentPage(1);

    mutate(request);
  };

  /**
   * Apply 실행
   */
  const handleApply = () => {
    if (!selectedSpec) {
      toastError('스펙을 선택해주세요');
      return;
    }

    onApply(selectedSpec);
    handleClose();
  };

  /**
   * Modal 닫기
   */
  const handleClose = () => {
    setRegion('seoul');
    setSpecConfig({});
    setAcceleratorConfig({});
    setProviderFilter('');
    setSelectedSpec(null);
    setCurrentPage(1);
    setPageSize(20);
    onClose();
  };

  // Filter by Provider (클라이언트 사이드)
  const filteredSpecs = data?.responseData
    ? providerFilter
      ? data.responseData.filter(
          (spec) =>
            spec.provider?.toLowerCase() === providerFilter.toLowerCase() ||
            spec.providerName?.toLowerCase() === providerFilter.toLowerCase()
        )
      : data.responseData
    : [];

  // Pagination 계산
  const totalPages = Math.ceil(filteredSpecs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredSpecs.slice(startIndex, endIndex);

  /**
   * 페이지 변경
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  /**
   * 페이지 크기 변경
   */
  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size));
    setCurrentPage(1); // 첫 페이지로 리셋
  };

  /**
   * 페이지 번호 목록 생성
   */
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // 전체 페이지가 maxVisible 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 주변만 표시
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('ellipsis');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!w-[90vw] !max-w-[calc(100%-2rem)] sm:!max-w-[90vw] md:!max-w-[90vw] lg:!max-w-[1400px] !max-w-[1400px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Server Recommendation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Region Selection & Search Button */}
          <div className="flex gap-4">
            <div className="flex-1">
              <FormSelect
                label="Select Region"
                value={region}
                onChange={(value) => setRegion(value as RegionKey | '')}
                options={Object.entries(REGIONS).map(([key, { label }]) => ({
                  value: key,
                  label,
                }))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isPending}>
                {isPending ? (
                  <>Loading...</>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Spec & Accelerator Config (Accordion) */}
          <Accordion type="multiple" defaultValue={['spec']} className="w-full">
            {/* Spec Config */}
            <AccordionItem value="spec">
              <AccordionTrigger>Spec Config</AccordionTrigger>
              <AccordionContent>
                <SpecConfigForm value={specConfig} onChange={setSpecConfig} />
              </AccordionContent>
            </AccordionItem>

            {/* Accelerator Config */}
            <AccordionItem value="accelerator">
              <AccordionTrigger>Accelerator Config</AccordionTrigger>
              <AccordionContent>
                <AcceleratorConfigForm value={acceleratorConfig} onChange={setAcceleratorConfig} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Provider Filter */}
          <div className="grid grid-cols-4 gap-4">
            <FormSelect
              label="Cloud Provider Filter"
              value={providerFilter}
              onChange={setProviderFilter}
              options={PROVIDER_OPTIONS}
              defaultOptionLabel="All"
            />
          </div>

          {/* Results Table */}
          {isPending ? (
            <div className="text-center py-8 text-muted-foreground">검색 중...</div>
          ) : filteredSpecs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {data ? '검색 결과가 없습니다.' : 'Region을 선택하고 Search를 클릭하세요.'}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* 결과 요약 및 페이지 크기 선택 */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredSpecs.length)} of{' '}
                  {filteredSpecs.length} results
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <FormSelect
                    label=""
                    value={String(pageSize)}
                    onChange={handlePageSizeChange}
                    options={[
                      { value: '10', label: '10' },
                      { value: '20', label: '20' },
                      { value: '50', label: '50' },
                      { value: '100', label: '100' },
                    ]}
                    className="w-20"
                  />
                </div>
              </div>

              {/* 테이블 - 고정 높이 with 스크롤 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-12 bg-background">선택</TableHead>
                        <TableHead className="bg-background">Provider</TableHead>
                        <TableHead className="bg-background">Region</TableHead>
                        <TableHead className="bg-background">Spec Name</TableHead>
                        <TableHead className="bg-background">Price</TableHead>
                        <TableHead className="bg-background">Memory (GB)</TableHead>
                        <TableHead className="bg-background">vCPU</TableHead>
                        <TableHead className="bg-background">Architecture ✨</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.map((spec) => (
                        <TableRow
                          key={spec.id}
                          className={`cursor-pointer hover:bg-muted/50 ${
                            selectedSpec?.id === spec.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedSpec(spec)}
                        >
                          <TableCell>
                            <input
                              type="radio"
                              checked={selectedSpec?.id === spec.id}
                              onChange={() => setSelectedSpec(spec)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell>{spec.providerName || spec.provider || '-'}</TableCell>
                          <TableCell>{spec.regionName || spec.region || '-'}</TableCell>
                          <TableCell className="font-medium">
                            {spec.cspSpecName || spec.name}
                          </TableCell>
                          <TableCell>{spec.costPerHour || '-'}</TableCell>
                          <TableCell>{spec.memoryGiB || spec.memory || '-'}</TableCell>
                          <TableCell>{spec.vCPU || spec.cpu || '-'}</TableCell>
                          <TableCell className="font-semibold text-primary">
                            {spec.architecture || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={
                          currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!selectedSpec || isPending}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
