'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormSelect } from '@/components/common/FormSelect';
import { FormInput } from '@/components/common/FormInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/common/Button';
import { DataTable } from '@/components/common/DataTable';
import { Image } from '@/types/mci-workloads';
import { useImageRecommendations } from '@/hooks/api/useMCIWorkloads';
import { toastError } from '@/lib/utils/toast';

interface ImageRecommendationModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (image: Image) => void;
  specInfo?: {
    provider?: string;
    region?: string;
    osArchitecture?: string;
  };
}

/**
 * Image Recommendation 모달 컴포넌트
 */
export function ImageRecommendationModal({
  open,
  onClose,
  onApply,
  specInfo,
}: ImageRecommendationModalProps) {
  const [provider, setProvider] = useState(specInfo?.provider || '');
  const [region, setRegion] = useState(specInfo?.region || '');
  const [osArchitecture, setOsArchitecture] = useState(specInfo?.osArchitecture || '');
  const [osType, setOsType] = useState('');
  const [gpuImage, setGpuImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const { images, isLoading, refetch } = useImageRecommendations({
    provider: provider || undefined,
    region: region || undefined,
    osArchitecture: osArchitecture || undefined,
    osType: osType || undefined,
    gpuImage: gpuImage || undefined,
  });

  // specInfo가 변경되면 입력 필드 업데이트
  useEffect(() => {
    if (specInfo) {
      setProvider(specInfo.provider || '');
      setRegion(specInfo.region || '');
      setOsArchitecture(specInfo.osArchitecture || '');
    }
  }, [specInfo]);

  // 테이블 컬럼 정의
  const columns = useMemo<ColumnDef<Image>[]>(
    () => [
      {
        id: 'select',
        header: '선택',
        cell: ({ row }) => {
          const image = row.original;
          return (
            <input
              type="radio"
              checked={selectedImage?.id === image.id}
              onChange={() => setSelectedImage(image)}
              className="cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          );
        },
        size: 50,
      },
      {
        accessorKey: 'name',
        header: 'Image Name',
        cell: ({ row }) => {
          const imageName = row.original.name || row.original.cspImageName || '-';
          return (
            <div
              className="font-medium max-w-[15ch] truncate cursor-help"
              title={imageName}
            >
              {imageName}
            </div>
          );
        },
      },
      {
        accessorKey: 'providerName',
        header: 'Provider',
        cell: ({ row }) => {
          const provider = row.original.providerName || '-';
          return (
            <div className="max-w-[10ch] truncate cursor-help" title={provider}>
              {provider}
            </div>
          );
        },
      },
      {
        accessorKey: 'regionList',
        header: 'Region',
        cell: ({ row }) => {
          const regionList = row.original.regionList || [];
          const regionText = regionList.length > 0 ? regionList.join(', ') : '-';
          return (
            <div className="max-w-[15ch] truncate cursor-help" title={regionText}>
              {regionText}
            </div>
          );
        },
      },
      {
        accessorKey: 'osType',
        header: 'OS Type',
        cell: ({ row }) => <div>{row.getValue('osType') || '-'}</div>,
      },
      {
        accessorKey: 'osDistribution',
        header: 'OS Distribution',
        cell: ({ row }) => {
          const osDistribution = row.getValue('osDistribution') as string || '-';
          return (
            <div
              className="max-w-[20ch] truncate cursor-help"
              title={osDistribution}
            >
              {osDistribution}
            </div>
          );
        },
      },
      {
        accessorKey: 'osArchitecture',
        header: 'OS Architecture',
        cell: ({ row }) => (
          <div className="font-semibold text-primary">
            {row.getValue('osArchitecture') || '-'}
          </div>
        ),
      },
    ],
    [selectedImage]
  );

  const handleSearch = () => {
    refetch();
  };

  const handleApply = () => {
    if (!selectedImage) {
      toastError('이미지를 선택해주세요');
      return;
    }
    onApply(selectedImage);
    handleClose();
  };

  const handleClose = () => {
    setProvider(specInfo?.provider || '');
    setRegion(specInfo?.region || '');
    setOsArchitecture(specInfo?.osArchitecture || '');
    setOsType('');
    setGpuImage(false);
    setSelectedImage(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!w-[90vw] !max-w-[calc(100%-2rem)] sm:!max-w-[90vw] md:!max-w-[90vw] lg:!max-w-[1400px] !max-w-[1400px] max-h-[90vh] flex flex-col p-0">
        {/* Title 영역 - 고정 */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Image Recommendation</DialogTitle>
        </DialogHeader>

        {/* 본문 영역 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* 첫 번째 줄: Provider, Region, OS Architecture, Search 버튼 */}
            <div className="flex gap-4 items-center">
              <FormInput
                label="Provider"
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Provider"
                disabled={!!specInfo?.provider}
                horizontal
                className="flex-1 min-w-0"
              />

              <FormInput
                label="Region"
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Region"
                disabled={!!specInfo?.region}
                horizontal
                className="flex-1 min-w-0"
              />

              <FormInput
                label="OS Architecture"
                type="text"
                value={osArchitecture}
                onChange={(e) => setOsArchitecture(e.target.value)}
                placeholder="OS Architecture"
                disabled={!!specInfo?.osArchitecture}
                horizontal
                className="flex-1 min-w-0"
              />

              <Button onClick={handleSearch} disabled={isLoading} className="flex-shrink-0">
                {isLoading ? (
                  <>Loading...</>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* 두 번째 줄: OS Type, GPU Image, 빈 공간 */}
            <div className="flex gap-4">
              <div className="flex-1 min-w-0">
                <FormSelect
                  label="OS Type"
                  value={osType}
                  onChange={(value) => setOsType(value)}
                  options={[
                    { value: 'ubuntu', label: 'Ubuntu' },
                    { value: 'centos', label: 'CentOS' },
                    { value: 'windows', label: 'Windows' },
                  ]}
                  horizontal
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 flex-nowrap">
                  <label className="text-sm font-medium whitespace-nowrap flex-shrink-0 w-20 text-right">
                    GPU Image
                  </label>
                  <div className="w-40 flex items-center space-x-2">
                    <Checkbox
                      id="gpu-image"
                      checked={gpuImage}
                      onCheckedChange={(checked) => setGpuImage(checked === true)}
                    />
                    <label
                      htmlFor="gpu-image"
                      className="text-sm leading-none cursor-pointer"
                    >
                      Enable
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0"></div>
            </div>

            {/* Results Table */}
            <DataTable
              data={images}
              columns={columns}
              onRowClick={(image) => setSelectedImage(image)}
              isLoading={isLoading}
              emptyMessage="검색 버튼을 클릭하여 이미지를 검색하세요."
              selectedItem={selectedImage}
              getRowId={(row) => row.id}
            />
          </div>
        </div>

        {/* Footer 영역 - 고정 */}
        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!selectedImage || isLoading}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
