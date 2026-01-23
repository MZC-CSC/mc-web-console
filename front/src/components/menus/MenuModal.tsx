'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { FormSelect } from '@/components/common/FormSelect';
import { FormCheckbox } from '@/components/common/FormCheckbox';
import { Button } from '@/components/common/Button';
import { MenuItem } from '@/types/menu';
import { useMenus } from '@/hooks/api/useMenus';

interface MenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  menu?: MenuItem | null;
  onSubmit: (menu: Omit<MenuItem, 'id' | 'menus'> | MenuItem) => Promise<void>;
  isLoading?: boolean;
}

/**
 * 메뉴 생성/수정 모달
 */
export function MenuModal({
  open,
  onOpenChange,
  mode,
  menu,
  onSubmit,
  isLoading = false,
}: MenuModalProps) {
  const { menus } = useMenus();
  const [displayName, setDisplayName] = useState('');
  const [parentId, setParentId] = useState<string>('__none__');
  const [priority, setPriority] = useState<string>('0');
  const [menuNumber, setMenuNumber] = useState<string>('');
  const [isAction, setIsAction] = useState(false);
  const [path, setPath] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 부모 메뉴 선택 옵션 (현재 메뉴와 자식 메뉴는 제외)
  const parentMenuOptions = menus
    .filter((m) => m.id !== menu?.id && !isDescendant(m, menu?.id || ''))
    .map((m) => ({
      value: m.id,
      label: m.name,
    }));

  // 부모가 자식의 후손인지 확인하는 헬퍼 함수
  function isDescendant(menu: MenuItem, targetId: string): boolean {
    if (menu.id === targetId) {
      return true;
    }
    if (menu.menus) {
      return menu.menus.some((child) => isDescendant(child, targetId));
    }
    return false;
  }

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && menu) {
        setDisplayName(menu.name || '');
        setParentId(menu.parentId || '__none__');
        setPriority(String(menu.priority || 0));
        setMenuNumber(menu.menuNumber ? String(menu.menuNumber) : '');
        setIsAction(menu.isAction || false);
        setPath(menu.path || '');
      } else {
        setDisplayName('');
        setParentId('__none__');
        setPriority('0');
        setMenuNumber('');
        setIsAction(false);
        setPath('');
      }
      setError(null);
    }
  }, [open, mode, menu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    const priorityNum = parseInt(priority, 10);
    if (isNaN(priorityNum)) {
      setError('우선순위는 숫자여야 합니다.');
      return;
    }

    const menuNumberNum = menuNumber ? parseInt(menuNumber, 10) : undefined;
    if (menuNumber && isNaN(menuNumberNum!)) {
      setError('메뉴 번호는 숫자여야 합니다.');
      return;
    }

    try {
      const menuData: {
        displayName: string;
        parentMenuId?: string;
        priority: number;
        menunumber?: number;
        isAction: boolean;
        path?: string;
      } = {
        displayName: displayName.trim(),
        priority: priorityNum,
        isAction,
      };

      // parentMenuId 처리: '__none__'이면 undefined, 아니면 값 사용
      if (parentId !== '__none__') {
        menuData.parentMenuId = parentId;
      }

      // menunumber 처리: 값이 있을 때만 추가
      if (menuNumberNum !== undefined) {
        menuData.menunumber = menuNumberNum;
      }

      // path 처리: 값이 있을 때만 추가
      if (path.trim()) {
        menuData.path = path.trim();
      }

      if (mode === 'create') {
        await onSubmit(menuData);
      } else {
        await onSubmit({ id: menu!.id, ...menuData });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '작업에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '메뉴 추가' : '메뉴 수정'}</DialogTitle>
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
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="메뉴 이름을 입력하세요"
              required
              disabled={isLoading}
              error={error && !displayName.trim() ? error : undefined}
            />

            <FormSelect
              label="부모 메뉴"
              value={parentId}
              onChange={setParentId}
              options={[
                { value: '__none__', label: '없음 (최상위 메뉴)' },
                ...parentMenuOptions,
              ]}
              disabled={isLoading}
            />

            <FormInput
              label="우선순위"
              type="number"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="0"
              required
              disabled={isLoading}
            />

            <FormInput
              label="메뉴 번호"
              type="number"
              value={menuNumber}
              onChange={(e) => setMenuNumber(e.target.value)}
              placeholder="선택사항"
              disabled={isLoading}
            />

            <FormCheckbox
              label="액션 여부"
              checked={isAction}
              onCheckedChange={setIsAction}
              disabled={isLoading}
            />

            <FormInput
              label="경로"
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="예: /operations/manage/menus"
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
