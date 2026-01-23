'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { FormTextarea } from '@/components/common/FormTextarea';
import { Button } from '@/components/common/Button';
import { Role, CspRoleMapping } from '@/types/workspace';
import { PlatformAccessCard } from './PlatformAccessCard';
import { WorkspaceAccessCard } from './WorkspaceAccessCard';
import { CspRoleMappingCard } from './CspRoleMappingCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  role?: Role | null;
  workspaceId?: string | null;
  onSubmit: (role: Omit<Role, 'id'> | Role) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Role 생성/수정 모달
 */
export function RoleModal({
  open,
  onOpenChange,
  mode,
  role,
  workspaceId,
  onSubmit,
  isLoading = false,
}: RoleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [platformPermissions, setPlatformPermissions] = useState<string[]>([]);
  const [workspaceAccess, setWorkspaceAccess] = useState(false);
  const [cspRoleMappings, setCspRoleMappings] = useState<CspRoleMapping[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && role) {
        setName(role.name || '');
        setDescription(role.description || '');
        setPlatformPermissions(role.platformAccess?.permissions || []);
        setWorkspaceAccess(role.workspaceAccess || false);
        setCspRoleMappings(role.cspRoleMappings || []);
      } else {
        setName('');
        setDescription('');
        setPlatformPermissions([]);
        setWorkspaceAccess(false);
        setCspRoleMappings([]);
      }
      setError(null);
    }
  }, [open, mode, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    try {
      const roleData: Omit<Role, 'id'> | Role = {
        ...(mode === 'edit' && role ? { id: role.id } : {}),
        name: name.trim(),
        description: description.trim() || undefined,
        workspaceId: workspaceId || undefined,
        roleType: 'workspace',
        platformAccess: {
          permissions: platformPermissions,
        },
        workspaceAccess,
        cspRoleMappings: cspRoleMappings.length > 0 ? cspRoleMappings : undefined,
      };

      await onSubmit(roleData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '작업에 실패했습니다.';
      setError(errorMessage);
    }
  };

  const handleAddCspMapping = (mapping: CspRoleMapping) => {
    setCspRoleMappings([...cspRoleMappings, mapping]);
  };

  const handleRemoveCspMapping = (mappingId: string) => {
    setCspRoleMappings(cspRoleMappings.filter((m) => m.id !== mappingId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Role 추가' : 'Role 수정'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-4 py-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* 기본 정보 */}
              <div className="space-y-4">
                <FormInput
                  label="이름"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Role 이름을 입력하세요"
                  required
                  disabled={isLoading || (mode === 'edit')}
                  error={error && !name.trim() ? error : undefined}
                />

                <FormTextarea
                  label="설명"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Role 설명을 입력하세요 (선택사항)"
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              {/* Platform Access */}
              <PlatformAccessCard
                platformAccess={{
                  permissions: platformPermissions,
                }}
                onPermissionsChange={setPlatformPermissions}
                mode={mode}
                workspaceId={workspaceId}
              />

              {/* Workspace Access */}
              <WorkspaceAccessCard
                enabled={workspaceAccess}
                onToggle={setWorkspaceAccess}
                mode={mode}
              />

              {/* CSP Role Mapping */}
              <CspRoleMappingCard
                mappings={cspRoleMappings}
                onAddMapping={handleAddCspMapping}
                onRemoveMapping={handleRemoveCspMapping}
                mode={mode}
                workspaceId={workspaceId}
              />
            </div>
          </ScrollArea>
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
