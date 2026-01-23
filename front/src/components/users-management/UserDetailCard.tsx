'use client';

import { Card } from '@/components/ui/card';
import { User } from '@/types/users';
import { useUser } from '@/hooks/api/useUsersManagement';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface UserDetailCardProps {
  item: User;
  onClose?: () => void;
}

/**
 * User 상세 정보 카드 컴포넌트
 */
export function UserDetailCard({ item, onClose }: UserDetailCardProps) {
  const { userDetail, isLoading } = useUser(item.id);

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner />
      </Card>
    );
  }

  if (!userDetail) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">사용자 정보를 불러올 수 없습니다.</div>
      </Card>
    );
  }

  const { user } = userDetail;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">User Information</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              닫기
            </button>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">First Name</label>
            <div className="mt-1">{user.firstName || '-'}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Name</label>
            <div className="mt-1">{user.lastName || '-'}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <div className="mt-1">{user.email}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-1">
              <span className={`px-2 py-1 rounded text-xs ${user.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {user.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Platform Roles */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Platform Roles</h4>
            <button className="text-sm text-primary hover:underline">Add Platform role</button>
          </div>
          {userDetail.platformRoles && userDetail.platformRoles.length > 0 ? (
            <div className="space-y-2">
              {userDetail.platformRoles.map((role) => (
                <div key={role.id} className="p-2 border rounded">
                  <div className="font-medium">{role.name}</div>
                  {role.description && (
                    <div className="text-sm text-muted-foreground">{role.description}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Platform Role이 없습니다.</div>
          )}
        </div>

        {/* Workspace Roles */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Workspace Roles</h4>
            <button className="text-sm text-primary hover:underline">Add Workspace role</button>
          </div>
          {userDetail.workspaceRoles && userDetail.workspaceRoles.length > 0 ? (
            <div className="space-y-2">
              {userDetail.workspaceRoles.map((role) => (
                <div key={role.id} className="p-2 border rounded">
                  <div className="font-medium">{role.roleName || role.roleId}</div>
                  {role.workspaceName && (
                    <div className="text-sm text-muted-foreground">Workspace: {role.workspaceName}</div>
                  )}
                  {role.roleDescription && (
                    <div className="text-sm text-muted-foreground">{role.roleDescription}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Workspace Role이 없습니다.</div>
          )}
        </div>

        {/* CSP Roles */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">CSP Roles</h4>
            <button className="text-sm text-primary hover:underline">Add CSP role</button>
          </div>
          {userDetail.cspRoles && userDetail.cspRoles.length > 0 ? (
            <div className="space-y-2">
              {userDetail.cspRoles.map((role) => (
                <div key={role.id} className="p-2 border rounded">
                  <div className="font-medium">{role.cspRoleName || role.cspRoleId}</div>
                  {role.cspRoleDescription && (
                    <div className="text-sm text-muted-foreground">{role.cspRoleDescription}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">CSP Role이 없습니다.</div>
          )}
        </div>
      </div>
    </Card>
  );
}
