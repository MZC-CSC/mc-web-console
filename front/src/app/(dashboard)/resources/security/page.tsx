'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { WorkspaceProjectSelector } from '@/components/common/WorkspaceProjectSelector';
import { useWorkspaceProjectSelection } from '@/hooks/useWorkspaceProjectSelection';
import { Card } from '@/components/ui/card';
import { SecurityGroup } from '@/types/resources';
import {
  useSecurityGroups,
  useCreateSecurityGroup,
  useDeleteSecurityGroup,
} from '@/hooks/api/useSecurityGroups';
import { SecurityGroupModal } from '@/components/security-groups/SecurityGroupModal';
import { SecurityGroupDetail } from '@/components/security-groups/SecurityGroupDetail';

/**
 * Security Groups 관리 페이지
 */
export default function SecurityGroupsPage() {
  const [selectedSecurityGroup, setSelectedSecurityGroup] = useState<SecurityGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Workspace/Project 선택 및 복원 (공통 Hook 사용)
  const {
    selectedWorkspaceId,
    selectedProjectId,
    selectedProject,
    isWorkspaceProjectSelected,
    handleWorkspaceChange,
    handleProjectChange,
  } = useWorkspaceProjectSelection();

  // 선택된 project의 ns_id 조회
  const nsId = selectedProject?.nsid;

  const { securityGroups, isLoading, refetch } = useSecurityGroups(nsId || null);
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
    if (!isWorkspaceProjectSelected || !nsId) {
      alert('Workspace와 Project를 선택해주세요.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (securityGroup: SecurityGroup) => {
    if (!isWorkspaceProjectSelected || !nsId) {
      alert('Workspace와 Project를 선택해주세요.');
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
      <Card className="p-6">
        <WorkspaceProjectSelector
          selectedWorkspaceId={selectedWorkspaceId}
          selectedProjectId={selectedProjectId}
          onWorkspaceChange={handleWorkspaceChange}
          onProjectChange={handleProjectChange}
        />
      </Card>

      {/* Workspace/Project 선택 안내 */}
      {!isWorkspaceProjectSelected && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">안내:</span>
            <span>
              {!selectedWorkspaceId
                ? 'Security Groups를 조회하려면 Workspace를 선택하세요.'
                : !selectedProjectId
                  ? 'Security Groups를 조회하려면 Project를 선택하세요.'
                  : ''}
            </span>
          </div>
        </Card>
      )}

      {/* Security Groups 목록 (Project 선택 시에만 표시) */}
      {isWorkspaceProjectSelected && (
        <>
          <CrudPageTemplate
            data={securityGroups}
            columns={columns}
            selectedItem={selectedSecurityGroup}
            onItemSelect={setSelectedSecurityGroup}
            onRefresh={refetch}
            isLoading={isLoading}
            onAdd={handleAdd}
            onDelete={handleDelete}
            detailComponent={(props) => <SecurityGroupDetail securityGroup={props.item} />}
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
        </>
      )}
    </div>
  );
}
