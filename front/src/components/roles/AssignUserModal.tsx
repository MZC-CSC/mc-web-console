'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { Role } from '@/types/workspace';
import { UserInfo } from '@/types/auth';
import { useUsers } from '@/hooks/api/useUsers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

interface AssignUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  workspaceId?: string | null;
  onAssign: (userIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Assign User 모달 컴포넌트
 * Role에 사용자를 할당하는 모달
 */
export function AssignUserModal({
  open,
  onOpenChange,
  role,
  workspaceId,
  onAssign,
  isLoading = false,
}: AssignUserModalProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // 사용자 목록 조회
  const { users, isLoading: isUsersLoading } = useUsers({
    search: searchQuery,
    workspaceId: workspaceId || undefined,
  });

  useEffect(() => {
    if (open) {
      setSelectedUserIds(new Set());
      setSearchQuery('');
    }
  }, [open]);

  const handleToggleUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUserIds.size === users.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(users.map((u) => u.id)));
    }
  };

  const handleAssign = async () => {
    if (selectedUserIds.size === 0) {
      return;
    }
    await onAssign(Array.from(selectedUserIds));
    setSelectedUserIds(new Set());
  };

  const isAllSelected = users.length > 0 && selectedUserIds.size === users.length;
  const isIndeterminate = selectedUserIds.size > 0 && selectedUserIds.size < users.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign User to Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              사용자를 선택된 역할에 할당합니다.
            </p>
          </div>

          {/* Role 표시 */}
          <div>
            <FormInput
              label="Role"
              type="text"
              value={role?.name || ''}
              placeholder="Selected role will be displayed here"
              readOnly
              disabled
            />
          </div>

          {/* 사용자 검색 */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="사용자 검색..."
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
          </div>

          {/* 사용자 목록 테이블 */}
          <div className="border rounded-md">
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>사용자명</TableHead>
                    <TableHead>이메일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isUsersLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground">
                        로딩 중...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground">
                        사용자를 찾을 수 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const isSelected = selectedUserIds.has(user.id);
                      return (
                        <TableRow
                          key={user.id}
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleToggleUser(user.id)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleUser(user.id)}
                              aria-label={`Select ${user.username}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {selectedUserIds.size > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedUserIds.size}명의 사용자가 선택되었습니다.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            취소
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            loading={isLoading}
            disabled={isLoading || selectedUserIds.size === 0}
          >
            Assign User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
