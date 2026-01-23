'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { FormTextarea } from '@/components/common/FormTextarea';
import { Button } from '@/components/common/Button';
import { SSHKey } from '@/types/resources';

interface SSHKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  sshKey?: SSHKey | null;
  onSubmit: (data: Omit<SSHKey, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

/**
 * SSH Key 생성/수정 모달
 */
export function SSHKeyModal({
  open,
  onOpenChange,
  mode,
  sshKey,
  onSubmit,
  isLoading = false,
}: SSHKeyModalProps) {
  const [name, setName] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && sshKey) {
        setName(sshKey.name || '');
        setConnectionName(sshKey.connectionName || '');
        setPublicKey('');
      } else {
        setName('');
        setConnectionName('');
        setPublicKey('');
      }
      setError(null);
    }
  }, [open, mode, sshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('SSH Key 이름을 입력해주세요.');
      return;
    }

    if (mode === 'create' && !publicKey.trim()) {
      setError('공개키를 입력해주세요.');
      return;
    }

    try {
      const sshKeyData: Omit<SSHKey, 'id'> & { publicKey?: string } = {
        name: name.trim(),
        connectionName: connectionName.trim() || undefined,
      };

      // Create 모드일 때만 publicKey 포함
      if (mode === 'create' && publicKey.trim()) {
        (sshKeyData as any).publicKey = publicKey.trim();
      }

      await onSubmit(sshKeyData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SSH Key 저장에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'SSH Key 추가' : 'SSH Key 수정'}</DialogTitle>
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
              placeholder="SSH Key 이름을 입력하세요"
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

            {mode === 'create' && (
              <FormTextarea
                label="공개키 (Public Key)"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ..."
                rows={6}
                required
                disabled={isLoading}
                helperText="SSH 공개키를 입력하세요"
                error={error && !publicKey.trim() ? error : undefined}
              />
            )}

            {mode === 'edit' && sshKey?.fingerprint && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fingerprint</label>
                <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
                  {sshKey.fingerprint}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fingerprint는 읽기 전용입니다.
                </p>
              </div>
            )}
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
