'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FormInput } from '@/components/common/FormInput';
import { FormTextarea } from '@/components/common/FormTextarea';
import { FormSelect } from '@/components/common/FormSelect';
import { Button } from '@/components/common/Button';
import { PMKClusterCreateRequest, NodeGroupCreateRequest } from '@/types/pmk-workloads';
import { NodeGroupConfigurationForm } from './NodeGroupConfigurationForm';
import { Plus } from 'lucide-react';

interface ClusterCreateFormProps {
  onSubmit: (data: PMKClusterCreateRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * PMK Cluster 생성 폼 컴포넌트
 */
export function ClusterCreateForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: ClusterCreateFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [cloudProvider, setCloudProvider] = useState('');
  const [region, setRegion] = useState('');
  const [cloudConnection, setCloudConnection] = useState('');
  const [nodeGroups, setNodeGroups] = useState<NodeGroupCreateRequest[]>([]);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 폼 초기화
    setName('');
    setDescription('');
    setVersion('');
    setCloudProvider('');
    setRegion('');
    setCloudConnection('');
    setNodeGroups([]);
    setIsExpertMode(false);
    setError(null);
  }, []);

  const handleAddNodeGroup = () => {
    const newNodeGroup: NodeGroupCreateRequest = {
      name: `NodeGroup ${nodeGroups.length + 1}`,
      minSize: 1,
      maxSize: 3,
      desiredSize: 1,
    };
    setNodeGroups([...nodeGroups, newNodeGroup]);
  };

  const handleUpdateNodeGroup = (index: number, updatedNodeGroup: NodeGroupCreateRequest) => {
    const updated = [...nodeGroups];
    updated[index] = updatedNodeGroup;
    setNodeGroups(updated);
  };

  const handleDeleteNodeGroup = (index: number) => {
    const updated = nodeGroups.filter((_, i) => i !== index);
    setNodeGroups(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Cluster 이름을 입력해주세요.');
      return;
    }

    if (!cloudProvider || !region) {
      setError('Cloud Provider와 Region을 선택해주세요.');
      return;
    }

    if (!cloudConnection) {
      setError('Cloud Connection을 선택해주세요.');
      return;
    }

    if (nodeGroups.length === 0) {
      setError('최소 하나의 NodeGroup을 추가해주세요.');
      return;
    }

    try {
      const requestData: PMKClusterCreateRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        version: version || undefined,
        nodeGroups,
      };
      await onSubmit(requestData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PMK Cluster 생성에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">PMK Cluster 생성</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpertMode(!isExpertMode)}
          >
            {isExpertMode ? '일반 모드' : 'Expert Creation 모드'}
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 클러스터 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">기본 정보</h3>

            <FormInput
              label="Cluster Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cluster 이름을 입력하세요"
              required
              disabled={isLoading}
              error={error && !name.trim() ? error : undefined}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Cloud Provider"
                value={cloudProvider}
                onChange={(value) => setCloudProvider(value)}
                options={[
                  { value: '', label: '선택하세요' },
                  { value: 'aws', label: 'AWS' },
                  { value: 'azure', label: 'Azure' },
                  { value: 'gcp', label: 'GCP' },
                ]}
                required
                disabled={isLoading}
              />

              <FormSelect
                label="Region"
                value={region}
                onChange={(value) => setRegion(value)}
                options={[
                  { value: '', label: '선택하세요' },
                  { value: 'us-east-1', label: 'US East (N. Virginia)' },
                  { value: 'us-west-2', label: 'US West (Oregon)' },
                  { value: 'ap-northeast-2', label: 'Asia Pacific (Seoul)' },
                ]}
                required
                disabled={isLoading}
              />
            </div>

            <FormTextarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cluster 설명을 입력하세요 (선택사항)"
              disabled={isLoading}
              rows={3}
            />

            <FormSelect
              label="Cloud Connection"
              value={cloudConnection}
              onChange={(value) => setCloudConnection(value)}
              options={[
                { value: '', label: '선택하세요' },
                // TODO: 실제 Connection 목록 조회
              ]}
              required
              disabled={isLoading}
            />

            {isExpertMode && (
              <FormInput
                label="Version"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Kubernetes 버전 (예: 1.28.0)"
                disabled={isLoading}
              />
            )}
          </div>

          {/* NodeGroup Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">NodeGroup Configuration</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNodeGroup}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                NodeGroup 추가
              </Button>
            </div>

            {nodeGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                NodeGroup이 없습니다. NodeGroup을 추가해주세요.
              </div>
            ) : (
              <div className="space-y-4">
                {nodeGroups.map((nodeGroup, index) => (
                  <NodeGroupConfigurationForm
                    key={index}
                    nodeGroup={nodeGroup}
                    index={index}
                    onUpdate={(updated) => handleUpdateNodeGroup(index, updated)}
                    onDelete={() => handleDeleteNodeGroup(index)}
                    isLoading={isLoading}
                    isExpertMode={isExpertMode}
                  />
                ))}
              </div>
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
              disabled={isLoading || !name.trim() || !cloudProvider || !region || !cloudConnection || nodeGroups.length === 0}
            >
              {isLoading ? '생성 중...' : 'Deploy'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
