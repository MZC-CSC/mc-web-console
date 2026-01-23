'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FormInput } from '@/components/common/FormInput';
import { FormTextarea } from '@/components/common/FormTextarea';
import { FormSelect } from '@/components/common/FormSelect';
import { Button } from '@/components/common/Button';
import { MCICreateRequest, MCISubGroup } from '@/types/mci-workloads';
import { SubGroupList } from './SubGroupList';
import { Plus, X } from 'lucide-react';

interface MCICreateFormProps {
  onSubmit: (data: MCICreateRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * MCI 생성 폼 컴포넌트
 */
export function MCICreateForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: MCICreateFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deploymentAlgorithm, setDeploymentAlgorithm] = useState('');
  const [policy, setPolicy] = useState('');
  const [subGroups, setSubGroups] = useState<MCISubGroup[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 폼 초기화
    setName('');
    setDescription('');
    setDeploymentAlgorithm('');
    setPolicy('');
    setSubGroups([]);
    setError(null);
  }, []);

  const handleAddSubGroup = () => {
    const newSubGroup: MCISubGroup = {
      id: `subgroup-${Date.now()}`,
      name: `SubGroup ${subGroups.length + 1}`,
      servers: [],
    };
    setSubGroups([...subGroups, newSubGroup]);
  };

  const handleUpdateSubGroup = (index: number, updatedSubGroup: MCISubGroup) => {
    const updated = [...subGroups];
    updated[index] = updatedSubGroup;
    setSubGroups(updated);
  };

  const handleDeleteSubGroup = (index: number) => {
    const updated = subGroups.filter((_, i) => i !== index);
    setSubGroups(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('MCI 이름을 입력해주세요.');
      return;
    }

    if (subGroups.length === 0) {
      setError('최소 하나의 SubGroup을 추가해주세요.');
      return;
    }

    try {
      const requestData: MCICreateRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        deploymentAlgorithm: deploymentAlgorithm || undefined,
        policy: policy || undefined,
        subgroups: subGroups,
      };
      await onSubmit(requestData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'MCI 생성에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">MCI 생성</h2>

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
              placeholder="MCI 이름을 입력하세요"
              required
              disabled={isLoading}
              error={error && !name.trim() ? error : undefined}
            />

            <FormTextarea
              label="설명"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="MCI 설명을 입력하세요 (선택사항)"
              disabled={isLoading}
              rows={3}
            />

            <FormSelect
              label="Deployment Algorithm"
              value={deploymentAlgorithm}
              onChange={(value) => setDeploymentAlgorithm(value)}
              options={[
                { value: '', label: '선택하세요' },
                { value: 'round-robin', label: 'Round Robin' },
                { value: 'least-connection', label: 'Least Connection' },
                { value: 'weighted', label: 'Weighted' },
              ]}
              disabled={isLoading}
            />

            <FormInput
              label="Policy"
              type="text"
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
              placeholder="Policy를 입력하세요 (선택사항)"
              disabled={isLoading}
            />
          </div>

          {/* SubGroup 목록 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">SubGroups</h3>
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
              <SubGroupList
                subGroups={subGroups}
                onUpdate={handleUpdateSubGroup}
                onDelete={handleDeleteSubGroup}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* 폼 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              {isLoading ? '생성 중...' : '생성'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
