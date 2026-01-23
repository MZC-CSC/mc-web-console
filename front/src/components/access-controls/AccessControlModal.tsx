'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { FormSelect } from '@/components/common/FormSelect';
import { FormTextarea } from '@/components/common/FormTextarea';
import { Button } from '@/components/common/Button';
import { AccessControl, PermissionPolicy } from '@/types/workspace';

interface AccessControlModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  accessControl?: AccessControl | null;
  onSubmit: (data: { operationId: string; policy: PermissionPolicy }) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Access Control Policy 생성/수정 모달
 */
export function AccessControlModal({
  open,
  onOpenChange,
  mode,
  accessControl,
  onSubmit,
  isLoading = false,
}: AccessControlModalProps) {
  const [operationId, setOperationId] = useState('');
  const [policyName, setPolicyName] = useState('');
  const [effect, setEffect] = useState<'allow' | 'deny'>('allow');
  const [actions, setActions] = useState('');
  const [resources, setResources] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && accessControl) {
        setOperationId(accessControl.operationId);
        const firstPolicy = accessControl.policies?.[0];
        if (firstPolicy) {
          setPolicyName(firstPolicy.name || '');
          setEffect(firstPolicy.effect || 'allow');
          setActions(firstPolicy.actions?.join(', ') || '');
          setResources(firstPolicy.resources?.join(', ') || '');
        }
      } else {
        setOperationId('');
        setPolicyName('');
        setEffect('allow');
        setActions('');
        setResources('');
      }
      setError(null);
    }
  }, [open, mode, accessControl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!operationId.trim()) {
      setError('Operation ID를 입력해주세요.');
      return;
    }

    if (!policyName.trim()) {
      setError('Policy 이름을 입력해주세요.');
      return;
    }

    try {
      const policy: PermissionPolicy = {
        name: policyName.trim(),
        effect,
        actions: actions.trim() ? actions.split(',').map(a => a.trim()) : undefined,
        resources: resources.trim() ? resources.split(',').map(r => r.trim()) : undefined,
      };

      await onSubmit({
        operationId: operationId.trim(),
        policy,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '작업에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '권한 정책 추가' : '권한 정책 수정'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormInput
              label="Operation ID"
              type="text"
              value={operationId}
              onChange={(e) => setOperationId(e.target.value)}
              placeholder="Operation ID를 입력하세요"
              required
              disabled={isLoading || mode === 'edit'}
              error={error && !operationId.trim() ? error : undefined}
            />

            <FormInput
              label="Policy 이름"
              type="text"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
              placeholder="Policy 이름을 입력하세요"
              required
              disabled={isLoading}
              error={error && !policyName.trim() ? error : undefined}
            />

            <FormSelect
              label="Effect"
              value={effect}
              onChange={(value) => setEffect(value as 'allow' | 'deny')}
              required
              disabled={isLoading}
              options={[
                { value: 'allow', label: 'Allow' },
                { value: 'deny', label: 'Deny' },
              ]}
            />

            <FormTextarea
              label="Actions (쉼표로 구분)"
              value={actions}
              onChange={(e) => setActions(e.target.value)}
              placeholder="create, read, update, delete"
              disabled={isLoading}
              rows={2}
            />

            <FormTextarea
              label="Resources (쉼표로 구분)"
              value={resources}
              onChange={(e) => setResources(e.target.value)}
              placeholder="resource1, resource2"
              disabled={isLoading}
              rows={2}
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
