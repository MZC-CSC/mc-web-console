'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { WorkspaceSelector } from '@/components/common/WorkspaceSelector';
import { ProjectSelector } from '@/components/common/ProjectSelector';
import { SecurityGroup } from '@/types/resources';
import {
  useSecurityGroups,
  useCreateSecurityGroup,
  useDeleteSecurityGroup,
} from '@/hooks/api/useSecurityGroups';
import { useProject } from '@/hooks/useProject';
import { SecurityGroupModal } from '@/components/security-groups/SecurityGroupModal';
import { SecurityGroupDetail } from '@/components/security-groups/SecurityGroupDetail';

/**
 * Security Groups 관리 페이지
 */
export default function SecurityGroupsPage() {
  const { currentProject } = useProject();
  const nsId = currentProject?.ns_id || null;
  const [selectedSecurityGroup, setSelectedSecurityGroup] = useState<SecurityGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { securityGroups, isLoading, refetch } = useSecurityGroups(nsId);
  const createMutation = useCreateSecurityGroup();
  const deleteMutation = useDeleteSecurityGroup();

  // 테이블 컬럼 정의
  const columns: ColumnDef<SecurityGroup>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'rules',
      header: 'Rules',
      cell: ({ row }) => {
        const rules = row.getValue('rules') as SecurityGroup['rules'];
        return <div>{rules?.length || 0}</div>;
      },
    },
    {
      accessorKey: 'connectionName',
      header: 'Connection',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('connectionName') || '-'}</div>,
    },
  ];

  const handleAdd = () => {
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (securityGroup: SecurityGroup) => {
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
      return;
    }
    if (confirm(`정말로 "${securityGroup.name}" Security Group을 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync({ nsId, securityGroupId: securityGroup.id });
        if (selectedSecurityGroup?.id === securityGroup.id) {
          setSelectedSecurityGroup(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleModalSubmit = async (data: Omit<SecurityGroup, 'id'>) => {
    if (!nsId) {
      return;
    }

    try {
      await createMutation.mutateAsync({ nsId, securityGroup: data });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace/Project 선택 */}
      <div className="flex gap-4">
        <WorkspaceSelector />
        <ProjectSelector />
      </div>

      {/* Security Groups 목록 */}
      <CrudPageTemplate
        data={securityGroups}
        columns={columns}
        selectedItem={selectedSecurityGroup}
        onItemSelect={setSelectedSecurityGroup}
        onRefresh={refetch}
        isLoading={isLoading}
        onAdd={handleAdd}
        onDelete={handleDelete}
        detailComponent={SecurityGroupDetail}
        title="Security Groups"
        addButtonLabel="Security Group 추가"
        emptyMessage="Security Group이 없습니다."
      />

      {isModalOpen && (
        <SecurityGroupModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSubmit={handleModalSubmit}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
}
