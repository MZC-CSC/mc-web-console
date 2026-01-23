'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { FormTextarea } from '@/components/common/FormTextarea';
import { Button } from '@/components/common/Button';
import { ServerSpec } from '@/types/resources';

interface SpecModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  spec?: ServerSpec | null;
  onSubmit: (data: Omit<ServerSpec, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Server Spec 생성/수정 모달
 */
export function SpecModal({
  open,
  onOpenChange,
  mode,
  spec,
  onSubmit,
  isLoading = false,
}: SpecModalProps) {
  const [name, setName] = useState('');
  const [cpu, setCpu] = useState('');
  const [memory, setMemory] = useState('');
  const [disk, setDisk] = useState('');
  const [description, setDescription] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && spec) {
        setName(spec.name || '');
        setCpu(spec.cpu?.toString() || '');
        setMemory(spec.memory?.toString() || '');
        setDisk(spec.disk?.toString() || '');
        setDescription(spec.description || '');
        setConnectionName(spec.connectionName || '');
      } else {
        setName('');
        setCpu('');
        setMemory('');
        setDisk('');
        setDescription('');
        setConnectionName('');
      }
      setError(null);
    }
  }, [open, mode, spec]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Server Spec 이름을 입력해주세요.');
      return;
    }

    try {
      const specData: Omit<ServerSpec, 'id'> = {
        name: name.trim(),
        cpu: cpu ? parseInt(cpu, 10) : undefined,
        memory: memory ? parseInt(memory, 10) : undefined,
        disk: disk ? parseInt(disk, 10) : undefined,
        description: description.trim() || undefined,
        connectionName: connectionName.trim() || undefined,
      };

      await onSubmit(specData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Server Spec 저장에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Server Spec 추가' : 'Server Spec 수정'}</DialogTitle>
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
              placeholder="Server Spec 이름을 입력하세요"
              required
              disabled={isLoading}
              error={error && !name.trim() ? error : undefined}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormInput
                label="CPU"
                type="number"
                value={cpu}
                onChange={(e) => setCpu(e.target.value)}
                placeholder="CPU 코어 수"
                disabled={isLoading}
              />

              <FormInput
                label="Memory (GB)"
                type="number"
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                placeholder="Memory 용량"
                disabled={isLoading}
              />

              <FormInput
                label="Disk (GB)"
                type="number"
                value={disk}
                onChange={(e) => setDisk(e.target.value)}
                placeholder="Disk 용량"
                disabled={isLoading}
              />
            </div>

            <FormInput
              label="Connection Name"
              type="text"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              placeholder="Connection 이름 (선택사항)"
              disabled={isLoading}
            />

            <FormTextarea
              label="설명"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Server Spec 설명을 입력하세요 (선택사항)"
              rows={3}
              disabled={isLoading}
            />
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
