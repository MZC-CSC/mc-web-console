'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { Workspace } from '@/types/workspace';

interface WorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  workspace?: Workspace | null;
  onSubmit: (workspace: Omit<Workspace, 'id'> | Workspace) => Promise<void>;
  isLoading?: boolean;
}

/**
 * 워크스페이스 생성/수정 모달
 */
export function WorkspaceModal({
  open,
  onOpenChange,
  mode,
  workspace,
  onSubmit,
  isLoading = false,
}: WorkspaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && workspace) {
        setName(workspace.name || '');
        setDescription(workspace.description || '');
      } else {
        setName('');
        setDescription('');
      }
      setError(null);
    }
  }, [open, mode, workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    try {
      if (mode === 'create') {
        await onSubmit({ name: name.trim(), description: description.trim() || undefined });
      } else {
        await onSubmit({ id: workspace!.id, name: name.trim(), description: description.trim() || undefined });
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
          <DialogTitle>{mode === 'create' ? '워크스페이스 추가' : '워크스페이스 수정'}</DialogTitle>
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
              placeholder="워크스페이스 이름을 입력하세요"
              required
              disabled={isLoading}
              error={error && !name.trim() ? error : undefined}
            />

            <FormInput
              label="설명"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="워크스페이스 설명을 입력하세요 (선택사항)"
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
