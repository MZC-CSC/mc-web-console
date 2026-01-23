'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { FormSelect } from '@/components/common/FormSelect';
import { FormTextarea } from '@/components/common/FormTextarea';
import { Button } from '@/components/common/Button';
import { Credential } from '@/types/resources';

interface CredentialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isLoading?: boolean;
}

const PROVIDER_OPTIONS = [
  { value: 'aws', label: 'AWS' },
  { value: 'gcp', label: 'GCP' },
  { value: 'azure', label: 'Azure' },
  { value: 'alibaba', label: 'Alibaba Cloud' },
  { value: 'tencent', label: 'Tencent Cloud' },
];

/**
 * Credential 등록 모달
 */
export function CredentialModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CredentialModalProps) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [configJson, setConfigJson] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setProvider('');
      setConfigJson('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Credential 이름을 입력해주세요.');
      return;
    }

    if (!provider) {
      setError('Provider를 선택해주세요.');
      return;
    }

    let config: Record<string, unknown> = {};
    if (configJson.trim()) {
      try {
        config = JSON.parse(configJson.trim());
      } catch (err) {
        setError('Config JSON 형식이 올바르지 않습니다.');
        return;
      }
    }

    try {
      const credentialData: Record<string, unknown> = {
        name: name.trim(),
        provider,
        ...config,
      };

      await onSubmit(credentialData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Credential 등록에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Credential 등록</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormInput
              label="Credential 이름"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Credential 이름을 입력하세요"
              required
              disabled={isLoading}
              error={error && !name.trim() ? error : undefined}
            />

            <FormSelect
              label="Provider"
              value={provider}
              onChange={setProvider}
              options={PROVIDER_OPTIONS}
              placeholder="Provider를 선택하세요"
              required
              disabled={isLoading}
              error={error && !provider ? error : undefined}
            />

            <FormTextarea
              label="Config (JSON)"
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              placeholder='{"accessKey": "...", "secretKey": "...", ...}'
              rows={8}
              disabled={isLoading}
              helperText="Provider별 설정 정보를 JSON 형식으로 입력하세요 (선택사항)"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" loading={isLoading} disabled={isLoading}>
              등록
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
