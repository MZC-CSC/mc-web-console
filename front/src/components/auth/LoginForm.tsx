'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { FormInput } from '@/components/common/FormInput';
import { PasswordFieldWithLink } from './PasswordFieldWithLink';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthLink } from './AuthLink';
import { LoginRequest } from '@/types/auth';

interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

/**
 * 로그인 폼 컴포넌트
 * 사용자 ID와 비밀번호를 입력받아 로그인을 처리합니다.
 */
export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [rememberId, setRememberId] = useState(false);

  // 컴포넌트 마운트 시 저장된 ID 불러오기
  // Load saved ID on component mount
  useEffect(() => {
    const savedId = localStorage.getItem('savedUserId');
    if (savedId) {
      setId(savedId);
      setRememberId(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    // 입력 검증
    if (!id.trim()) {
      setFormError('사용자 ID를 입력해주세요.');
      return;
    }

    if (!password.trim()) {
      setFormError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      // ID 저장/제거 처리
      // Handle save/remove ID
      if (rememberId) {
        localStorage.setItem('savedUserId', id.trim());
      } else {
        localStorage.removeItem('savedUserId');
      }

      await onSubmit({ id: id.trim(), password });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setFormError(errorMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      const form = e.currentTarget.closest('form');
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const displayError = error || formError;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
        <CardDescription className="text-center">
          MC Web Console에 로그인하세요
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {displayError && !formError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {displayError}
            </div>
          )}

          <FormInput
            label="사용자 ID"
            type="text"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setFormError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="사용자 ID를 입력하세요"
            autoComplete="username"
            required
            disabled={isLoading}
            error={formError && !id.trim() ? formError : undefined}
          />

          <PasswordFieldWithLink
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFormError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="비밀번호를 입력하세요"
            disabled={isLoading}
            error={formError && !password.trim() ? formError : undefined}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-id"
                checked={rememberId}
                onCheckedChange={(checked) => setRememberId(checked === true)}
                disabled={isLoading}
              />
              <label
                htmlFor="remember-id"
                className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                아이디 저장
              </label>
            </div>
            <AuthLink
              variant="forgot"
              onClick={() => {
                // TODO: 비밀번호 찾기 페이지로 이동
                console.log('Forgot password clicked');
              }}
            >
              비밀번호를 잊으셨나요?
            </AuthLink>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pt-4">
          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            로그인
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
