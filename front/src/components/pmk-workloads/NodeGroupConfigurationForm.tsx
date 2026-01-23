'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { FormInput } from '@/components/common/FormInput';
import { FormSelect } from '@/components/common/FormSelect';
import { Button } from '@/components/common/Button';
import { NodeGroupCreateRequest } from '@/types/pmk-workloads';
import { Spec, Image } from '@/types/mci-workloads';
import { X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { SpecRecommendationModal } from './SpecRecommendationModal';
import { ImageRecommendationModal } from './ImageRecommendationModal';

interface NodeGroupConfigurationFormProps {
  nodeGroup: NodeGroupCreateRequest;
  index: number;
  onUpdate: (nodeGroup: NodeGroupCreateRequest) => void;
  onDelete: () => void;
  isLoading?: boolean;
  isExpertMode?: boolean;
}

/**
 * NodeGroup Configuration 폼 컴포넌트
 */
export function NodeGroupConfigurationForm({
  nodeGroup,
  index,
  onUpdate,
  onDelete,
  isLoading = false,
  isExpertMode = false,
}: NodeGroupConfigurationFormProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [name, setName] = useState(nodeGroup.name || '');
  const [instanceType, setInstanceType] = useState(nodeGroup.instanceType || '');
  const [minSize, setMinSize] = useState(nodeGroup.minSize?.toString() || '1');
  const [maxSize, setMaxSize] = useState(nodeGroup.maxSize?.toString() || '3');
  const [desiredSize, setDesiredSize] = useState(nodeGroup.desiredSize?.toString() || '1');
  const [autoScaling, setAutoScaling] = useState(true);
  const [rootDiskType, setRootDiskType] = useState('');
  const [rootDiskSize, setRootDiskSize] = useState('');

  const handleUpdate = () => {
    onUpdate({
      name,
      instanceType: instanceType || undefined,
      imageId: imageId || undefined,
      minSize: parseInt(minSize) || 1,
      maxSize: parseInt(maxSize) || 3,
      desiredSize: parseInt(desiredSize) || 1,
      rootDiskType: rootDiskType || undefined,
      rootDiskSize: rootDiskSize ? parseInt(rootDiskSize) : undefined,
    });
  };

  const handleApplySpec = (spec: Spec) => {
    setInstanceType(spec.id);
    handleUpdate();
  };

  const handleApplyImage = (image: Image) => {
    setImageId(image.id);
    handleUpdate();
  };

  return (
    <Card className="p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium">NodeGroup {index + 1}</span>
          </CollapsibleTrigger>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isLoading}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <CollapsibleContent className="mt-4 space-y-4">
          <FormInput
            label="NodeGroup Name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              handleUpdate();
            }}
            placeholder="NodeGroup 이름을 입력하세요"
            required
            disabled={isLoading}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-2">
              <FormInput
                label="Spec"
                type="text"
                value={instanceType}
                onChange={(e) => {
                  setInstanceType(e.target.value);
                  handleUpdate();
                }}
                placeholder="Spec ID (선택사항)"
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Spec 검색 모달 열기
                  alert('Spec 검색 기능은 곧 구현될 예정입니다.');
                }}
                disabled={isLoading}
                className="mt-6"
              >
                검색
              </Button>
            </div>

            <div className="flex gap-2">
              <FormInput
                label="Image"
                type="text"
                value=""
                onChange={() => {}}
                placeholder="Image ID (선택사항)"
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Image 검색 모달 열기
                  alert('Image 검색 기능은 곧 구현될 예정입니다.');
                }}
                disabled={isLoading}
                className="mt-6"
              >
                검색
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Min Node Size"
              type="number"
              value={minSize}
              onChange={(e) => {
                setMinSize(e.target.value);
                handleUpdate();
              }}
              placeholder="1"
              required
              disabled={isLoading}
              min="1"
            />

            <FormInput
              label="Max Node Size"
              type="number"
              value={maxSize}
              onChange={(e) => {
                setMaxSize(e.target.value);
                handleUpdate();
              }}
              placeholder="3"
              required
              disabled={isLoading}
              min="1"
            />

            <FormInput
              label="Desired Node Size"
              type="number"
              value={desiredSize}
              onChange={(e) => {
                setDesiredSize(e.target.value);
                handleUpdate();
              }}
              placeholder="1"
              required
              disabled={isLoading}
              min="1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`auto-scaling-${index}`}
              checked={autoScaling}
              onCheckedChange={(checked) => {
                setAutoScaling(checked === true);
                handleUpdate();
              }}
            />
            <label
              htmlFor={`auto-scaling-${index}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              AutoScaling
            </label>
          </div>

          {isExpertMode && (
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Root Disk Type"
                value={rootDiskType}
                onChange={(value) => {
                  setRootDiskType(value);
                  handleUpdate();
                }}
                options={[
                  { value: '', label: '선택하세요' },
                  { value: 'gp3', label: 'GP3' },
                  { value: 'gp2', label: 'GP2' },
                  { value: 'io1', label: 'IO1' },
                ]}
                disabled={isLoading}
              />

              <FormInput
                label="Root Disk Size (GB)"
                type="number"
                value={rootDiskSize}
                onChange={(e) => {
                  setRootDiskSize(e.target.value);
                  handleUpdate();
                }}
                placeholder="20"
                disabled={isLoading}
                min="1"
              />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Recommendation 모달들 */}
      <SpecRecommendationModal
        open={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onApply={handleApplySpec}
      />

      <ImageRecommendationModal
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onApply={handleApplyImage}
        specInfo={
          instanceType
            ? {
                // TODO: Spec 정보를 가져와서 전달
              }
            : undefined
        }
      />
    </Card>
  );
}
