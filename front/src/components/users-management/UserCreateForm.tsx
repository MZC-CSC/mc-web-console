'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { UserCreateRequest } from '@/types/users';
import { ArrowLeft } from 'lucide-react';

interface UserCreateFormProps {
  onSubmit: (data: UserCreateRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * User 생성 폼 컴포넌트
 */
export function UserCreateForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: UserCreateFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 폼 초기화
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setEnabled(true);
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError('First Name을 입력해주세요.');
      return;
    }

    if (!lastName.trim()) {
      setError('Last Name을 입력해주세요.');
      return;
    }

    if (!email.trim()) {
      setError('Email을 입력해주세요.');
      return;
    }

    try {
      const requestData: UserCreateRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
        enabled,
      };
      await onSubmit(requestData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '사용자 생성에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-xl font-semibold">Create User</h2>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">User Information</h3>

            <FormInput
              label="First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name을 입력하세요"
              required
              disabled={isLoading}
              error={error && !firstName.trim() ? error : undefined}
            />

            <FormInput
              label="Last Name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name을 입력하세요"
              required
              disabled={isLoading}
              error={error && !lastName.trim() ? error : undefined}
            />

            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email을 입력하세요"
              required
              disabled={isLoading}
              error={error && !email.trim() ? error : undefined}
            />

            <FormInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password를 입력하세요 (선택사항)"
              disabled={isLoading}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enabled"
                checked={enabled}
                onCheckedChange={(checked) => setEnabled(checked === true)}
              />
              <label
                htmlFor="enabled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enabled
              </label>
            </div>
          </div>

          {/* 폼 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !firstName.trim() || !lastName.trim() || !email.trim()}
            >
              {isLoading ? '생성 중...' : 'Deploy'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
