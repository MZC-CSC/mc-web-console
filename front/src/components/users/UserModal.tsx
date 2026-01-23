'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { UserInfo } from '@/types/auth';

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  user?: UserInfo | null;
  onSubmit: (user: Omit<UserInfo, 'id'> | UserInfo) => Promise<void>;
  isLoading?: boolean;
}

/**
 * 사용자 생성/수정 모달
 */
export function UserModal({
  open,
  onOpenChange,
  mode,
  user,
  onSubmit,
  isLoading = false,
}: UserModalProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && user) {
        setUsername(user.username || '');
        setEmail(user.email || '');
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
      } else {
        setUsername('');
        setEmail('');
        setFirstName('');
        setLastName('');
      }
      setError(null);
    }
  }, [open, mode, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('사용자명을 입력해주세요.');
      return;
    }

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      const userData: Partial<UserInfo> = {
        username: username.trim(),
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      };

      if (mode === 'create') {
        await onSubmit(userData as Omit<UserInfo, 'id'>);
      } else {
        await onSubmit({ id: user!.id, ...userData } as UserInfo);
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
          <DialogTitle>{mode === 'create' ? '사용자 추가' : '사용자 수정'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormInput
              label="사용자명"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="사용자명을 입력하세요"
              required
              disabled={isLoading || mode === 'edit'}
              error={error && !username.trim() ? error : undefined}
            />

            <FormInput
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              disabled={isLoading}
              error={error && !email.trim() ? error : undefined}
            />

            <FormInput
              label="이름"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="이름을 입력하세요 (선택사항)"
              disabled={isLoading}
            />

            <FormInput
              label="성"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="성을 입력하세요 (선택사항)"
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
