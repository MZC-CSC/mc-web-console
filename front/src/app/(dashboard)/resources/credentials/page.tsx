'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { Credential } from '@/types/resources';
import {
  useCredentials,
  useRegisterCredential,
} from '@/hooks/api/useCredentials';
import { CredentialModal } from '@/components/credentials/CredentialModal';
import { CredentialDetail } from '@/components/credentials/CredentialDetail';

/**
 * Credentials 관리 페이지
 */
export default function CredentialsPage() {
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { credentials, isLoading, refetch } = useCredentials();
  const registerMutation = useRegisterCredential();

  // 테이블 컬럼 정의
  const columns: ColumnDef<Credential>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'provider',
      header: 'Provider',
      cell: ({ row }) => <div>{row.getValue('provider') || '-'}</div>,
    },
    {
      accessorKey: 'connectionName',
      header: 'Connection',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('connectionName') || '-'}</div>,
    },
  ];

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: Record<string, unknown>) => {
    try {
      await registerMutation.mutateAsync(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Credential 등록 오류:', error);
    }
  };

  return (
    <>
      <CrudPageTemplate
        data={credentials}
        columns={columns}
        selectedItem={selectedCredential}
        onItemSelect={setSelectedCredential}
        onRefresh={refetch}
        isLoading={isLoading}
        onAdd={handleAdd}
        detailComponent={CredentialDetail}
        title="Credentials"
        addButtonLabel="Credential 등록"
        emptyMessage="Credential이 없습니다."
      />

      {isModalOpen && (
        <CredentialModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSubmit={handleModalSubmit}
          isLoading={registerMutation.isPending}
        />
      )}
    </>
  );
}
