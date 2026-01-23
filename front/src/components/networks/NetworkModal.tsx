'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { Network } from '@/types/resources';

interface NetworkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Network, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Network 생성 모달
 */
export function NetworkModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: NetworkModalProps) {
  const [name, setName] = useState('');
  const [cidr, setCidr] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setCidr('');
      setConnectionName('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Network 이름을 입력해주세요.');
      return;
    }

    try {
      const networkData: Omit<Network, 'id'> = {
        name: name.trim(),
        cidr: cidr.trim() || undefined,
        connectionName: connectionName.trim() || undefined,
      };

      await onSubmit(networkData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network 생성에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Network 추가</DialogTitle>
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
              placeholder="Network 이름을 입력하세요"
              required
              disabled={isLoading}
              error={error && !name.trim() ? error : undefined}
            />

            <FormInput
              label="CIDR"
              type="text"
              value={cidr}
              onChange={(e) => setCidr(e.target.value)}
              placeholder="예: 10.0.0.0/16 (선택사항)"
              disabled={isLoading}
              helperText="네트워크 CIDR 블록을 입력하세요"
            />

            <FormInput
              label="Connection Name"
              type="text"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              placeholder="Connection 이름 (선택사항)"
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" loading={isLoading} disabled={isLoading}>
              생성
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
