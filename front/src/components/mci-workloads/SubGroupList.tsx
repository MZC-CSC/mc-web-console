'use client';

import { MCISubGroup } from '@/types/mci-workloads';
import { SubGroupCard } from './SubGroupCard';

interface SubGroupListProps {
  subGroups: MCISubGroup[];
  onUpdate: (index: number, subGroup: MCISubGroup) => void;
  onDelete: (index: number) => void;
  isLoading?: boolean;
}

/**
 * SubGroup 목록 컴포넌트
 */
export function SubGroupList({
  subGroups,
  onUpdate,
  onDelete,
  isLoading = false,
}: SubGroupListProps) {
  return (
    <div className="space-y-4">
      {subGroups.map((subGroup, index) => (
        <SubGroupCard
          key={subGroup.id || index}
          subGroup={subGroup}
          index={index}
          onUpdate={(updated) => onUpdate(index, updated)}
          onDelete={() => onDelete(index)}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
