'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/common/Button';
import { FormSelect } from '@/components/common/FormSelect';
import { DataTable } from '@/components/common/DataTable';
import { SpecConfigForm } from './SpecConfigForm';
import { AcceleratorConfigForm } from './AcceleratorConfigForm';
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

  // API Hook
  const { mutate, data, isPending } = useServerRecommendation();

  // 테이블 컬럼 정의
  const columns = useMemo<ColumnDef<Spec>[]>(
    () => [
      {
        id: 'select',
        header: '선택',
        cell: ({ row }) => {
          const spec = row.original;
          return (
            <input
              type="radio"
              checked={selectedSpec?.id === spec.id}
              onChange={() => {
                console.log('[SpecRecommendationModal] Radio selected:', spec);
                setSelectedSpec(spec);
              }}
              className="cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          );
        },
        size: 50,
      },
      {
        accessorKey: 'providerName',
        header: 'Provider',
        cell: ({ row }) => {
          const provider = row.original.providerName || row.original.provider || '-';
          return (
            <div className="max-w-[10ch] truncate cursor-help" title={provider}>
              {provider}
            </div>
          );
        },
      },
      {
        accessorKey: 'regionName',
        header: 'Region',
        cell: ({ row }) => {
          const region = row.original.regionName || row.original.region || '-';
          return (
            <div className="max-w-[15ch] truncate cursor-help" title={region}>
              {region}
            </div>
          );
        },
      },
      {
        accessorKey: 'cspSpecName',
        header: 'Spec Name',
        cell: ({ row }) => {
          const specName = row.original.cspSpecName || row.original.name;
          return (
            <div className="font-medium max-w-[20ch] truncate cursor-help" title={specName}>
              {specName}
            </div>
          );
        },
      },
      {
        accessorKey: 'costPerHour',
        header: 'Price',
        cell: ({ row }) => <div>{row.getValue('costPerHour') || '-'}</div>,
      },
      {
        accessorKey: 'memoryGiB',
        header: 'Memory (GB)',
        cell: ({ row }) => (
          <div>{row.original.memoryGiB || row.original.memory || '-'}</div>
        ),
      },
      {
        accessorKey: 'vCPU',
        header: 'vCPU',
        cell: ({ row }) => (
          <div>{row.original.vCPU || row.original.cpu || '-'}</div>
        ),
      },
      {
        accessorKey: 'architecture',
        header: 'Architecture',
        cell: ({ row }) => (
          <div className="font-semibold text-primary">
            {row.getValue('architecture') || '-'}
          </div>
        ),
      },
    ],
    [selectedSpec]
  );

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

    console.log('[SpecRecommendationModal] Apply - selectedSpec:', selectedSpec);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!w-[90vw] !max-w-[calc(100%-2rem)] sm:!max-w-[90vw] md:!max-w-[90vw] lg:!max-w-[1400px] !max-w-[1400px] max-h-[90vh] flex flex-col p-0">
        {/* Title 영역 - 고정 */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Server Recommendation</DialogTitle>
        </DialogHeader>

        {/* 본문 영역 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
          {/* 조회 조건 영역 (좌측) + Search 버튼 (우측) */}
          <div className="flex gap-4">
            {/* 좌측: 조회 조건 */}
            <div className="flex-1 space-y-4">
              {/* Region Selection */}
              <FormSelect
                label="Region"
                value={region}
                onChange={(value) => setRegion(value as RegionKey | '')}
                options={Object.entries(REGIONS).map(([key, { label }]) => ({
                  value: key,
                  label,
                }))}
                horizontal
                fullWidth
              />

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
              <FormSelect
                label="Provider"
                value={providerFilter}
                onChange={setProviderFilter}
                options={PROVIDER_OPTIONS}
                defaultOptionLabel="All"
                horizontal
              />
            </div>

            {/* 우측: Search 버튼 */}
            <div className="flex-shrink-0 flex items-start pt-6">
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

          {/* Results Table */}
          <DataTable
            data={filteredSpecs}
            columns={columns}
            onRowClick={(spec) => {
              console.log('[SpecRecommendationModal] Row clicked:', spec);
              setSelectedSpec(spec);
            }}
            isLoading={isPending}
            emptyMessage={
              !data
                ? 'Region을 선택하고 Search를 클릭하세요.'
                : '검색 결과가 없습니다.'
            }
            selectedItem={selectedSpec}
            getRowId={(row) => row.id}
          />
          </div>
        </div>

        {/* Footer 영역 - 고정 */}
        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
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
