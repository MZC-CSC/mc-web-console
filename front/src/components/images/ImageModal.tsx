'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { FormSelect } from '@/components/common/FormSelect';
import { Button } from '@/components/common/Button';
import { Image } from '@/types/resources';

interface ImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  image?: Image | null;
  onSubmit: (data: Omit<Image, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

const OS_OPTIONS = [
  { value: 'linux', label: 'Linux' },
  { value: 'windows', label: 'Windows' },
  { value: 'ubuntu', label: 'Ubuntu' },
  { value: 'centos', label: 'CentOS' },
  { value: 'debian', label: 'Debian' },
  { value: 'rhel', label: 'RHEL' },
];

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

/**
 * Image 생성/수정 모달
 */
export function ImageModal({
  open,
  onOpenChange,
  mode,
  image,
  onSubmit,
  isLoading = false,
}: ImageModalProps) {
  const [name, setName] = useState('');
  const [os, setOs] = useState('');
  const [size, setSize] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && image) {
        setName(image.name || '');
        setOs(image.os || '');
        setSize(image.size?.toString() || '');
        setConnectionName(image.connectionName || '');
        setStatus(image.status || '');
      } else {
        setName('');
        setOs('');
        setSize('');
        setConnectionName('');
        setStatus('');
      }
      setError(null);
    }
  }, [open, mode, image]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Image 이름을 입력해주세요.');
      return;
    }

    try {
      const imageData: Omit<Image, 'id'> = {
        name: name.trim(),
        os: os || undefined,
        size: size ? parseInt(size, 10) : undefined,
        connectionName: connectionName.trim() || undefined,
        status: status || undefined,
      };

      await onSubmit(imageData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Image 저장에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Image 추가' : 'Image 수정'}</DialogTitle>
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
              placeholder="Image 이름을 입력하세요"
              required
              disabled={isLoading}
              error={error && !name.trim() ? error : undefined}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="OS"
                value={os}
                onChange={setOs}
                options={OS_OPTIONS}
                placeholder="OS를 선택하세요 (선택사항)"
                disabled={isLoading}
              />

              <FormInput
                label="Size (GB)"
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Image 크기"
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
