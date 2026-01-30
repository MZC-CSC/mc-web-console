'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { FormInput } from '@/components/common/FormInput';
import { FormNumberInput } from '@/components/common/FormNumberInput';
import { FormTextarea } from '@/components/common/FormTextarea';
import { Button } from '@/components/common/Button';
import { MciDynamicReq, CreateSubGroupDynamicReq, Spec, Image } from '@/types/mci-workloads';
import { Plus, Trash2, Search, CheckCircle, DollarSign } from 'lucide-react';
import { SpecRecommendationModal } from './SpecRecommendationModal';
import { ImageRecommendationModal } from './ImageRecommendationModal';
import { MCICostEstimationModal } from './MCICostEstimationModal';
import { useValidateMCICreation, useMCICostEstimation } from '@/hooks/api/useMCIWorkloads';
import { useWorkspaceProjectSelection } from '@/hooks/useWorkspaceProjectSelection';

interface MCICreateFormDynamicProps {
  onSubmit: (data: MciDynamicReq) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * MCI 생성 폼 - Dynamic Mode (Express Mode)
 * 간단한 Spec/Image 선택으로 MCI를 생성합니다.
 */
export function MCICreateFormDynamic({
  onSubmit,
  onCancel,
  isLoading = false,
}: MCICreateFormDynamicProps) {
  // Workspace/Project 선택
  const { selectedProject } = useWorkspaceProjectSelection();
  const nsId = selectedProject?.nsid;

  // MCI 기본 정보
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [installMonAgent, setInstallMonAgent] = useState<'yes' | 'no'>('no');

  // SubGroups
  const [subGroups, setSubGroups] = useState<CreateSubGroupDynamicReq[]>([]);

  // 모달 상태
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [costModalOpen, setCostModalOpen] = useState(false);
  const [currentSubGroupIndex, setCurrentSubGroupIndex] = useState<number | null>(null);
  const [costEstimationData, setCostEstimationData] = useState<any>(null);

  // 에러
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const validateMutation = useValidateMCICreation();
  const costEstimationMutation = useMCICostEstimation();

  // SubGroup 추가
  const handleAddSubGroup = () => {
    const newSubGroup: CreateSubGroupDynamicReq = {
      name: `subgroup-${subGroups.length + 1}`,
      subGroupSize: '1',
      specId: '',
      imageId: '',
      rootDiskSize: 'default',
      rootDiskType: 'default',
    };
    setSubGroups([...subGroups, newSubGroup]);
  };

  // SubGroup 삭제
  const handleDeleteSubGroup = (index: number) => {
    setSubGroups(subGroups.filter((_, i) => i !== index));
  };

  // SubGroup 필드 업데이트
  const handleUpdateSubGroup = (index: number, field: keyof CreateSubGroupDynamicReq, value: string) => {
    const updated = [...subGroups];
    updated[index] = { ...updated[index], [field]: value };
    setSubGroups(updated);
  };

  // Spec 선택 모달 열기
  const handleOpenSpecModal = (index: number) => {
    setCurrentSubGroupIndex(index);
    setSpecModalOpen(true);
  };

  // Spec 선택 완료
  const handleSelectSpec = (spec: Spec) => {
    if (currentSubGroupIndex !== null) {
      handleUpdateSubGroup(currentSubGroupIndex, 'specId', spec.id);
      // connectionName도 함께 설정
      if (spec.connectionName) {
        handleUpdateSubGroup(currentSubGroupIndex, 'connectionName', spec.connectionName);
      }
    }
    setSpecModalOpen(false);
    setCurrentSubGroupIndex(null);
  };

  // Image 선택 모달 열기
  const handleOpenImageModal = (index: number) => {
    setCurrentSubGroupIndex(index);
    setImageModalOpen(true);
  };

  // Image 선택 완료
  const handleSelectImage = (image: Image) => {
    if (currentSubGroupIndex !== null) {
      handleUpdateSubGroup(currentSubGroupIndex, 'imageId', image.id);
    }
    setImageModalOpen(false);
    setCurrentSubGroupIndex(null);
  };

  // 유효성 검증 공통 로직
  const validateFormData = (): MciDynamicReq | null => {
    setError(null);

    // 유효성 검사
    if (!name.trim()) {
      setError('MCI 이름을 입력해주세요.');
      return null;
    }

    if (subGroups.length === 0) {
      setError('최소 하나의 SubGroup을 추가해주세요.');
      return null;
    }

    // SubGroup 유효성 검사
    for (let i = 0; i < subGroups.length; i++) {
      const sg = subGroups[i];
      if (!sg.name.trim()) {
        setError(`SubGroup ${i + 1}: 이름을 입력해주세요.`);
        return null;
      }
      if (!sg.specId) {
        setError(`SubGroup ${i + 1}: Spec을 선택해주세요.`);
        return null;
      }
      if (!sg.imageId) {
        setError(`SubGroup ${i + 1}: Image를 선택해주세요.`);
        return null;
      }
      const size = parseInt(sg.subGroupSize || '0');
      if (isNaN(size) || size < 1 || size > 100) {
        setError(`SubGroup ${i + 1}: Size는 1-100 사이의 숫자여야 합니다.`);
        return null;
      }
    }

    return {
      name: name.trim(),
      description: description.trim() || undefined,
      installMonAgent,
      subGroups: subGroups.map(sg => ({
        ...sg,
        name: sg.name.trim(),
      })),
    };
  };

  // 유효성 검증
  const handleValidate = async () => {
    if (!nsId) {
      setError('Workspace와 Project를 선택해주세요.');
      return;
    }

    const requestData = validateFormData();
    if (!requestData) return;

    try {
      await validateMutation.mutateAsync({ nsId, data: requestData });
    } catch (error) {
      // 에러는 Hook의 onError에서 처리됨
    }
  };

  // 비용 예상
  const handleCostEstimation = async () => {
    if (!nsId) {
      setError('Workspace와 Project를 선택해주세요.');
      return;
    }

    const requestData = validateFormData();
    if (!requestData) return;

    try {
      const result = await costEstimationMutation.mutateAsync({ nsId, data: requestData });
      setCostEstimationData(result);
      setCostModalOpen(true);
    } catch (error) {
      // 에러는 Hook의 onError에서 처리됨
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requestData = validateFormData();
    if (!requestData) return;

    try {
      await onSubmit(requestData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'MCI 생성에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">MCI 생성 - Express Mode</h2>
          <div className="text-sm text-muted-foreground">
            간편한 Spec/Image 선택으로 빠르게 생성
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* MCI 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">기본 정보</h3>

            <FormInput
              label="MCI 이름"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: my-mci-01"
              required
              disabled={isLoading}
            />

            <FormTextarea
              label="설명"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="MCI 설명을 입력하세요 (선택사항)"
              disabled={isLoading}
              rows={2}
            />

            {/* Monitoring Agent 설치 옵션 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">모니터링 에이전트 설치</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="no"
                    checked={installMonAgent === 'no'}
                    onChange={() => setInstallMonAgent('no')}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">설치 안 함 (권장)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="yes"
                    checked={installMonAgent === 'yes'}
                    onChange={() => setInstallMonAgent('yes')}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">설치</span>
                </label>
              </div>
            </div>
          </div>

          {/* SubGroups */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">VM SubGroups</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSubGroup}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                SubGroup 추가
              </Button>
            </div>

            {subGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                SubGroup이 없습니다. SubGroup을 추가해주세요.
              </div>
            ) : (
              <div className="space-y-4">
                {subGroups.map((sg, index) => (
                  <Card key={index} className="p-4 border-2">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium">SubGroup {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubGroup(index)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {/* SubGroup Name */}
                      <FormInput
                        label="SubGroup 이름"
                        type="text"
                        value={sg.name}
                        onChange={(e) => handleUpdateSubGroup(index, 'name', e.target.value)}
                        placeholder="예: web-servers"
                        disabled={isLoading}
                        required
                      />

                      {/* SubGroup Size */}
                      <FormNumberInput
                        label="서버 개수"
                        value={sg.subGroupSize || '1'}
                        onChange={(e) => handleUpdateSubGroup(index, 'subGroupSize', e.target.value)}
                        placeholder="1-100"
                        disabled={isLoading}
                        min={1}
                        max={100}
                        required
                      />

                      {/* Spec 선택 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Spec <span className="text-destructive">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={sg.specId}
                            readOnly
                            placeholder="Spec을 선택하세요"
                            className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenSpecModal(index)}
                            disabled={isLoading}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            선택
                          </Button>
                        </div>
                      </div>

                      {/* Image 선택 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Image <span className="text-destructive">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={sg.imageId}
                            readOnly
                            placeholder="Image를 선택하세요"
                            className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenImageModal(index)}
                            disabled={isLoading}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            선택
                          </Button>
                        </div>
                      </div>

                      {/* Root Disk 설정 */}
                      <div className="grid grid-cols-2 gap-3">
                        <FormInput
                          label="Root Disk Size"
                          type="text"
                          value={sg.rootDiskSize || 'default'}
                          onChange={(e) => handleUpdateSubGroup(index, 'rootDiskSize', e.target.value)}
                          placeholder="default, 30, 50, ..."
                          disabled={isLoading}
                        />
                        <FormInput
                          label="Root Disk Type"
                          type="text"
                          value={sg.rootDiskType || 'default'}
                          onChange={(e) => handleUpdateSubGroup(index, 'rootDiskType', e.target.value)}
                          placeholder="default, gp3, ..."
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* 폼 액션 버튼 */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleValidate}
                disabled={isLoading || validateMutation.isPending || !name.trim() || subGroups.length === 0}
              >
                {validateMutation.isPending ? (
                  <>검증 중...</>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    유효성 검증
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCostEstimation}
                disabled={isLoading || costEstimationMutation.isPending || !name.trim() || subGroups.length === 0}
              >
                {costEstimationMutation.isPending ? (
                  <>예상 중...</>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    비용 예상
                  </>
                )}
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !name.trim() || subGroups.length === 0}
              >
                {isLoading ? '생성 중...' : 'MCI 생성'}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Spec 선택 모달 */}
      <SpecRecommendationModal
        open={specModalOpen}
        onClose={() => {
          setSpecModalOpen(false);
          setCurrentSubGroupIndex(null);
        }}
        onApply={handleSelectSpec}
      />

      {/* Image 선택 모달 */}
      <ImageRecommendationModal
        open={imageModalOpen}
        onClose={() => {
          setImageModalOpen(false);
          setCurrentSubGroupIndex(null);
        }}
        onApply={handleSelectImage}
      />

      {/* 비용 예상 모달 */}
      <MCICostEstimationModal
        open={costModalOpen}
        onClose={() => setCostModalOpen(false)}
        data={costEstimationData}
      />
    </div>
  );
}
