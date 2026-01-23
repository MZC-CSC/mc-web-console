'use client';

import { FormSelect } from './FormSelect';
import { useRoles } from '@/hooks/api/useRoles';
import { LoadingSpinner } from './LoadingSpinner';

interface RoleSelectorProps {
  value: string;
  onChange: (roleId: string) => void;
  workspaceId?: string;
  className?: string;
}

export function RoleSelector({
  value,
  onChange,
  workspaceId,
  className,
}: RoleSelectorProps) {
  const { roles, isLoading } = useRoles(workspaceId);

  if (isLoading) {
    return <LoadingSpinner size="sm" />;
  }

  const options = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  return (
    <FormSelect
      label="Role"
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Role 선택"
      className={className}
    />
  );
}
