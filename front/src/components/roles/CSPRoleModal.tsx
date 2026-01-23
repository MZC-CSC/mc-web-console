'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { FormSelect } from '@/components/common/FormSelect';
import { FormTextarea } from '@/components/common/FormTextarea';
import { Button } from '@/components/common/Button';
import { CSPRole } from '@/types/workspace';

interface CSPRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  role?: CSPRole | null;
  onSubmit: (role: Omit<CSPRole, 'id'> | CSPRole) => Promise<void>;
  isLoading?: boolean;
}

/**
 * CSP Role 생성/수정 모달
 */
export function CSPRoleModal({
  open,
  onOpenChange,
  mode,
  role,
  onSubmit,
  isLoading = false,
}: CSPRoleModalProps) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<CSPRole['provider']>('aws');
  const [description, setDescription] = useState('');
  const [arn, setArn] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && role) {
        setName(role.name || '');
        setProvider(role.provider || 'aws');
        setDescription(role.description || '');
        setArn(role.arn || '');
      } else {
        setName('');
        setProvider('aws');
        setDescription('');
        setArn('');
      }
      setError(null);
    }
  }, [open, mode, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (!provider) {
      setError('Provider를 선택해주세요.');
      return;
    }

    try {
      const roleData: Partial<CSPRole> = {
        name: name.trim(),
        provider,
        description: description.trim() || undefined,
        arn: arn.trim() || undefined,
      };

      if (mode === 'create') {
        await onSubmit(roleData as Omit<CSPRole, 'id'>);
      } else {
        await onSubmit({ id: role!.id, ...roleData } as CSPRole);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '작업에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'CSP Role 추가' : 'CSP Role 수정'}</DialogTitle>
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
              placeholder="CSP Role 이름을 입력하세요"
              required
              disabled={isLoading}
              error={error && !name.trim() ? error : undefined}
            />

            <FormSelect
              label="Provider"
              value={provider}
              onChange={(value) => setProvider(value as CSPRole['provider'])}
              required
              disabled={isLoading || mode === 'edit'}
              options={[
                { value: 'aws', label: 'AWS' },
                { value: 'gcp', label: 'GCP' },
                { value: 'azure', label: 'Azure' },
                { value: 'alibaba', label: 'Alibaba' },
                { value: 'tencent', label: 'Tencent' },
              ]}
            />

            <FormInput
              label="ARN"
              type="text"
              value={arn}
              onChange={(e) => setArn(e.target.value)}
              placeholder="ARN을 입력하세요 (선택사항)"
              disabled={isLoading}
            />

            <FormTextarea
              label="설명"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="CSP Role 설명을 입력하세요 (선택사항)"
              disabled={isLoading}
              rows={3}
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
