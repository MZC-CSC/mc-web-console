// components/users/UsersTableActions.tsx

'use client';

import { Button } from '@/components/common/Button';
import { Plus } from 'lucide-react';

interface UsersTableActionsProps {
  onAddUser: () => void;
}

export function UsersTableActions({ onAddUser }: UsersTableActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button onClick={onAddUser}>
        <Plus className="mr-2 h-4 w-4" />
        Add User
      </Button>
    </div>
  );
}
