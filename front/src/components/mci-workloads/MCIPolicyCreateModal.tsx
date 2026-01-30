'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/common/FormInput';
import { FormNumberInput } from '@/components/common/FormNumberInput';
import { FormTextarea } from '@/components/common/FormTextarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { SpecRecommendationModal } from './SpecRecommendationModal';
import { ImageRecommendationModal } from './ImageRecommendationModal';
import { useCreateMCIPolicy } from '@/hooks/api/useMCIWorkloads';
import { MciPolicyReq } from '@/types/mci-policy';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MCIPolicyCreateModalProps {
  open: boolean;
  onClose: () => void;
  mciId: string;
  mciName: string;
  nsId: string;
  onSuccess?: () => void;
}

/**
 * Policy 생성 모달 컴포넌트
 * 
 * Policy 정책 설정과 scaleout될 server 정보 설정을 포함합니다.
 */
export function MCIPolicyCreateModal({
  open,
  onClose,
  mciId,
  mciName,
  nsId,
  onSuccess,
}: MCIPolicyCreateModalProps) {
  // Policy 기본 정보
  const [policyName, setPolicyName] = useState('');
  const [description, setDescription] = useState('');
  const [policyType, setPolicyType] = useState<'ScaleOut' | 'ScaleIn'>('ScaleOut');
  const [placementAlgo, setPlacementAlgo] = useState('random');
  const [command, setCommand] = useState('');
  const [userName, setUserName] = useState('cb-user');

  // Policy Condition
  const [metric, setMetric] = useState('cpu');
  const [operator, setOperator] = useState('>=');
  const [operand, setOperand] = useState('50');

  // Server Configuration
  const [serverName, setServerName] = useState('d1');
  const [serverDescription, setServerDescription] = useState('');
  const [specId, setSpecId] = useState('');
  const [specDisplayName, setSpecDisplayName] = useState('');
  const [imageId, setImageId] = useState('');
  const [imageDisplayName, setImageDisplayName] = useState('');
  const [rootDiskType, setRootDiskType] = useState('default');
  const [rootDiskSize, setRootDiskSize] = useState('default');
  const [subGroupSize, setSubGroupSize] = useState(1);

  // 모달 상태
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // API Hook
  const createPolicyMutation = useCreateMCIPolicy();

  // Spec 선택 처리
  const handleSpecSelect = (spec: any) => {
    setSpecId(spec.id || spec.specId || '');
    setSpecDisplayName(spec.name || spec.cspSpecName || spec.id || '');
    setSpecModalOpen(false);
  };

  // Image 선택 처리
  const handleImageSelect = (image: any) => {
    setImageId(image.id || image.imageId || '');
    setImageDisplayName(image.name || image.cspImageName || image.id || '');
    setImageModalOpen(false);
  };

  // 폼 제출
  const handleSubmit = async () => {
    if (!policyName.trim()) {
      alert('Policy Name을 입력해주세요.');
      return;
    }
    if (!specId || !imageId) {
      alert('Spec과 Image를 선택해주세요.');
      return;
    }

    // Policy Name과 Description을 결합하여 description 필드에 저장
    const fullDescription = policyName
      ? description
        ? `${policyName}: ${description}`
        : policyName
      : description;

    const policyData: MciPolicyReq = {
      description: fullDescription || undefined,
      policy: [
        {
          autoCondition: {
            metric,
            operator: operator as '<' | '<=' | '>' | '>=',
            operand,
            evaluationPeriod: '10', // 기본값
          },
          autoAction: {
            actionType: policyType,
            placementAlgo,
            postCommand: command
              ? {
                  command: command.split('\n').filter((c) => c.trim()),
                  userName,
                }
              : undefined,
            subGroupDynamicReq: {
              name: serverName,
              subGroupSize: subGroupSize.toString(),
              specId,
              imageId,
              rootDiskType: rootDiskType !== 'default' ? rootDiskType : undefined,
              rootDiskSize: rootDiskSize !== 'default' ? rootDiskSize : undefined,
              description: serverDescription || undefined,
            },
          },
        },
      ],
    };

    try {
      await createPolicyMutation.mutateAsync({
        nsId,
        mciId,
        data: policyData,
      });
      onSuccess?.();
    } catch (error) {
      // 에러는 useCreateMCIPolicy의 onError에서 처리됨
      console.error('Policy 생성 실패:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Policy</DialogTitle>
            <DialogDescription>
              Policy 정책과 scaleout될 server 정보를 설정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Policy 기본 정보 */}
            <div className="space-y-4">
              <FormInput
                label="Policy name *"
                type="text"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="Input Policy Name"
                required
              />

              <FormTextarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Input Policy Description"
                rows={3}
              />

              {/* Policy Type / placementAlgo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Policy Type / placementAlgo</Label>
                  <Select
                    value={policyType}
                    onValueChange={(value) => setPolicyType(value as 'ScaleOut' | 'ScaleIn')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ScaleOut">ScaleOut</SelectItem>
                      <SelectItem value="ScaleIn">ScaleIn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Placement Algorithm</Label>
                  <Select value={placementAlgo} onValueChange={setPlacementAlgo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">random</SelectItem>
                      <SelectItem value="lowest-cost">lowest-cost</SelectItem>
                      <SelectItem value="highest-performance">highest-performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Command / UserName */}
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Command"
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="ex: List [ client_ip=$(echo $SSH_CLIENT | awk '{print $1}'); ech"
                />
                <FormInput
                  label="UserName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="ex: cb-user"
                />
              </div>
            </div>

            {/* Metric and Condition */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold">Trigger for Policy</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Metric *</Label>
                  <Select value={metric} onValueChange={setMetric}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpu">CPU Usage</SelectItem>
                      <SelectItem value="memory">Memory Usage</SelectItem>
                      <SelectItem value="network">Network Usage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Operator *</Label>
                  <Select value={operator} onValueChange={setOperator}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<">Less than (&lt;)</SelectItem>
                      <SelectItem value="<=">Less than or equal (&lt;=)</SelectItem>
                      <SelectItem value=">">Greater than (&gt;)</SelectItem>
                      <SelectItem value=">=">Greater than or equal (&gt;=)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <FormNumberInput
                    label="Operand"
                    value={operand}
                    onChange={(e) => setOperand(e.target.value)}
                    placeholder="50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Server Configuration */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-primary">Server Configuration</h4>
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="Server Name *"
                      type="text"
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      placeholder="Input Name"
                      required
                    />
                    <FormTextarea
                      label="Description"
                      value={serverDescription}
                      onChange={(e) => setServerDescription(e.target.value)}
                      placeholder="type Description"
                      rows={2}
                    />
                  </div>

                  {/* Spec 선택 */}
                  <div className="space-y-2">
                    <Label>Spec *</Label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={specDisplayName}
                        readOnly
                        placeholder="Please Use Search"
                        className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSpecModalOpen(true)}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>

                  {/* Image 선택 */}
                  <div className="space-y-2">
                    <Label>Image *</Label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={imageDisplayName}
                        readOnly
                        placeholder="Please Use Search"
                        className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setImageModalOpen(true)}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>

                  {/* Root Disk */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Root Disk Type</Label>
                      <Select value={rootDiskType} onValueChange={setRootDiskType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">default</SelectItem>
                          <SelectItem value="gp3">gp3</SelectItem>
                          <SelectItem value="standard">standard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <FormInput
                      label="Root Disk Size(GB)"
                      type="text"
                      value={rootDiskSize}
                      onChange={(e) => setRootDiskSize(e.target.value)}
                      placeholder="default, 30, 50, ..."
                    />
                  </div>

                  {/* SubGroup Size */}
                  <div className="space-y-2">
                    <Label>SubGroup Size</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setSubGroupSize(Math.max(1, subGroupSize - 1))}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center">{subGroupSize}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setSubGroupSize(subGroupSize + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={createPolicyMutation.isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createPolicyMutation.isPending}>
                {createPolicyMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spec 선택 모달 */}
      <SpecRecommendationModal
        open={specModalOpen}
        onClose={() => setSpecModalOpen(false)}
        onApply={handleSpecSelect}
      />

      {/* Image 선택 모달 */}
      <ImageRecommendationModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onApply={handleImageSelect}
      />
    </>
  );
}
