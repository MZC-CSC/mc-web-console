'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { FormSelect } from '@/components/common/FormSelect';
import { Button } from '@/components/common/Button';
import { Disk } from '@/types/resources';

interface DiskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  disk?: Disk | null;
  onSubmit: (data: Omit<Disk, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

const DISK_TYPE_OPTIONS = [
  { value: 'ssd', label: 'SSD' },
  { value: 'hdd', label: 'HDD' },
  { value: 'nvme', label: 'NVMe' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
];

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'attached', label: 'Attached' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

/**
 * Disk 생성/수정 모달
 */
export function DiskModal({
  open,
  onOpenChange,
  mode,
  disk,
  onSubmit,
  isLoading = false,
}: DiskModalProps) {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [type, setType] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && disk) {
        setName(disk.name || '');
        setSize(disk.size?.toString() || '');
        setType(disk.type || '');
        setConnectionName(disk.connectionName || '');
        setStatus(disk.status || '');
      } else {
        setName('');
        setSize('');
        setType('');
        setConnectionName('');
        setStatus('');
      }
      setError(null);
    }
  }, [open, mode, disk]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Disk 이름을 입력해주세요.');
      return;
    }

    try {
      const diskData: Omit<Disk, 'id'> = {
        name: name.trim(),
        size: size ? parseInt(size, 10) : undefined,
        type: type || undefined,
        connectionName: connectionName.trim() || undefined,
        status: status || undefined,
      };

      await onSubmit(diskData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Disk 저장에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Disk 추가' : 'Disk 수정'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormInput
              label="이름"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Disk 이름을 입력하세요"
              required
              disabled={isLoading}
              error={error && !name.trim() ? error : undefined}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Size (GB)"
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Disk 크기"
                disabled={isLoading}
              />

              <FormSelect
                label="Type"
                value={type}
                onChange={setType}
                options={DISK_TYPE_OPTIONS}
                placeholder="Disk 타입을 선택하세요 (선택사항)"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Connection Name"
                type="text"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                placeholder="Connection 이름 (선택사항)"
                disabled={isLoading}
              />

              {mode === 'edit' && (
                <FormSelect
                  label="Status"
                  value={status}
                  onChange={setStatus}
                  options={STATUS_OPTIONS}
                  placeholder="Status를 선택하세요 (선택사항)"
                  disabled={isLoading}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" loading={isLoading} disabled={isLoading}>
              {mode === 'create' ? '생성' : '수정'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
