'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { SecurityGroup } from '@/types/resources';

interface SecurityGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<SecurityGroup, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Security Group 생성 모달
 */
export function SecurityGroupModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: SecurityGroupModalProps) {
  const [name, setName] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setConnectionName('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Security Group 이름을 입력해주세요.');
      return;
    }

    try {
      const securityGroupData: Omit<SecurityGroup, 'id'> = {
        name: name.trim(),
        connectionName: connectionName.trim() || undefined,
      };

      await onSubmit(securityGroupData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Security Group 생성에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Security Group 추가</DialogTitle>
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
              placeholder="Security Group 이름을 입력하세요"
              required
              disabled={isLoading}
              error={error && !name.trim() ? error : undefined}
            />

            <FormInput
              label="Connection Name"
              type="text"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              placeholder="Connection 이름 (선택사항)"
              disabled={isLoading}
            />

            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              Security Group 생성 후 Rules를 추가할 수 있습니다.
            </div>
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
