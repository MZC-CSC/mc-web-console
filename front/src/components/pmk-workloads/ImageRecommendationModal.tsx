'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormSelect } from '@/components/common/FormSelect';
import { FormInput } from '@/components/common/FormInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/common/Button';
import { Image, ImageRecommendationRequest } from '@/types/mci-workloads';
import { useImageRecommendations } from '@/hooks/api/useMCIWorkloads';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
 * Image Recommendation 모달 컴포넌트 (PMK용)
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

  const handleSearch = () => {
    refetch();
  };

  const handleApply = () => {
    if (selectedImage) {
      onApply(selectedImage);
      handleClose();
    }
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Image Recommendation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Spec 정보 표시 */}
          {specInfo && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Spec 정보</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Provider: </span>
                  <span>{specInfo.provider || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Region: </span>
                  <span>{specInfo.region || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">OS Architecture: </span>
                  <span>{specInfo.osArchitecture || '-'}</span>
                </div>
              </div>
            </div>
          )}

          {/* 검색 필터 */}
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Provider"
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="Provider"
              disabled={!!specInfo?.provider}
            />

            <FormInput
              label="Region"
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Region"
              disabled={!!specInfo?.region}
            />

            <FormInput
              label="OS Architecture"
              type="text"
              value={osArchitecture}
              onChange={(e) => setOsArchitecture(e.target.value)}
              placeholder="OS Architecture"
              disabled={!!specInfo?.osArchitecture}
            />

            <FormSelect
              label="OS Type"
              value={osType}
              onChange={(value) => setOsType(value)}
              options={[
                { value: '', label: '전체' },
                { value: 'ubuntu', label: 'Ubuntu' },
                { value: 'centos', label: 'CentOS' },
                { value: 'windows', label: 'Windows' },
              ]}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="gpu-image-pmk"
              checked={gpuImage}
              onCheckedChange={(checked) => setGpuImage(checked === true)}
            />
            <label
              htmlFor="gpu-image-pmk"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              GPU Image
            </label>
          </div>

          <Button onClick={handleSearch} disabled={isLoading}>
            검색
          </Button>

          {/* Image 목록 테이블 */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">검색 결과가 없습니다.</div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="radio"
                        checked={false}
                        onChange={() => {}}
                        className="cursor-pointer"
                      />
                    </TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>OS Type</TableHead>
                    <TableHead>OS Architecture</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {images.map((image) => (
                    <TableRow
                      key={image.id}
                      className={selectedImage?.id === image.id ? 'bg-muted' : ''}
                      onClick={() => setSelectedImage(image)}
                    >
                      <TableCell>
                        <input
                          type="radio"
                          checked={selectedImage?.id === image.id}
                          onChange={() => setSelectedImage(image)}
                          className="cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{image.name}</TableCell>
                      <TableCell>{image.provider || '-'}</TableCell>
                      <TableCell>{image.region || '-'}</TableCell>
                      <TableCell>{image.osType || '-'}</TableCell>
                      <TableCell>{image.osArchitecture || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleApply} disabled={!selectedImage}>
            적용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
