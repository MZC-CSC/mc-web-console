'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormSelect } from '@/components/common/FormSelect';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { Spec, SpecRecommendationRequest } from '@/types/mci-workloads';
import { useSpecRecommendations } from '@/hooks/api/useMCIWorkloads';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SpecRecommendationModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (spec: Spec) => void;
  cloudConnection?: string;
}

/**
 * Spec Recommendation 모달 컴포넌트 (PMK용)
 */
export function SpecRecommendationModal({
  open,
  onClose,
  onApply,
  cloudConnection,
}: SpecRecommendationModalProps) {
  const [priority, setPriority] = useState('');
  const [limit, setLimit] = useState('');
  const [connectionName, setConnectionName] = useState(cloudConnection || '');
  const [selectedSpec, setSelectedSpec] = useState<Spec | null>(null);

  const { specs, isLoading, refetch } = useSpecRecommendations({
    priority: priority || undefined,
    limit: limit || undefined,
    connectionName: connectionName || undefined,
  });

  const handleSearch = () => {
    refetch();
  };

  const handleApply = () => {
    if (selectedSpec) {
      onApply(selectedSpec);
      handleClose();
    }
  };

  const handleClose = () => {
    setPriority('');
    setLimit('');
    setConnectionName(cloudConnection || '');
    setSelectedSpec(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Server Spec Recommendation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 검색 필터 */}
          <div className="grid grid-cols-3 gap-4">
            <FormSelect
              label="Priority Option"
              value={priority}
              onChange={(value) => setPriority(value)}
              options={[
                { value: '', label: '전체' },
                { value: 'cost', label: 'Cost' },
                { value: 'performance', label: 'Performance' },
              ]}
            />

            <FormInput
              label="Limit (Location)"
              type="text"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="지역 제한"
            />

            <FormInput
              label="Connection Name"
              type="text"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              placeholder="Connection Name"
              disabled={!!cloudConnection}
            />
          </div>

          <Button onClick={handleSearch} disabled={isLoading}>
            검색
          </Button>

          {/* Spec 목록 테이블 */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : specs.length === 0 ? (
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
                    <TableHead>CPU</TableHead>
                    <TableHead>Memory</TableHead>
                    <TableHead>Disk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specs.map((spec) => (
                    <TableRow
                      key={spec.id}
                      className={selectedSpec?.id === spec.id ? 'bg-muted' : ''}
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
                      <TableCell className="font-medium">{spec.name}</TableCell>
                      <TableCell>{spec.provider || '-'}</TableCell>
                      <TableCell>{spec.region || '-'}</TableCell>
                      <TableCell>{spec.cpu || '-'}</TableCell>
                      <TableCell>{spec.memory || '-'}</TableCell>
                      <TableCell>{spec.disk || '-'}</TableCell>
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
          <Button onClick={handleApply} disabled={!selectedSpec}>
            적용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
