'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CspRoleMapping } from '@/types/workspace';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CspRoleMappingCardProps {
  mappings?: CspRoleMapping[];
  onAddMapping?: (mapping: CspRoleMapping) => void;
  onRemoveMapping?: (mappingId: string) => void;
  mode: 'view' | 'create' | 'edit';
  workspaceId?: string | null;
  className?: string;
}

/**
 * CSP Role Mapping 카드 컴포넌트
 * CSP Role 매핑을 표시하는 카드
 */
export function CspRoleMappingCard({
  mappings = [],
  onAddMapping,
  onRemoveMapping,
  mode,
  workspaceId,
  className,
}: CspRoleMappingCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedRoleName, setSelectedRoleName] = useState<string>('');

  const hasMappings = mappings.length > 0;
  const isEditMode = mode === 'create' || mode === 'edit';

  // CSP Role 목록 조회 (Provider 선택 시)
  const { cspRoles: availableRoles, isLoading } = useCSPRoles(
    workspaceId,
    selectedProvider || undefined
  );

  const handleAdd = () => {
    if (!selectedProvider || !selectedRoleName || !onAddMapping) return;

    const selectedRole = availableRoles?.find((r) => r.name === selectedRoleName);
    if (!selectedRole) return;

    const newMapping: CspRoleMapping = {
      id: `temp-${Date.now()}`, // 임시 ID
      provider: selectedProvider as CspRoleMapping['provider'],
      roleName: selectedRoleName,
      roleArn: selectedRole.arn,
    };

    onAddMapping(newMapping);
    setSelectedProvider('');
    setSelectedRoleName('');
  };

  return (
    <Card className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">CSP Role Mapping</CardTitle>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {mode === 'view' && (
              <div className="space-y-2">
                {hasMappings ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Provider</TableHead>
                          <TableHead>Role Name</TableHead>
                          {mappings.some((m) => m.roleArn) && (
                            <TableHead>ARN</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mappings.map((mapping) => (
                          <TableRow key={mapping.id}>
                            <TableCell className="font-medium capitalize">
                              {mapping.provider}
                            </TableCell>
                            <TableCell>{mapping.roleName}</TableCell>
                            {mapping.roleArn && <TableCell className="text-muted-foreground text-xs">
                              {mapping.roleArn}
                            </TableCell>}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <p>CSP Role 매핑이 없습니다.</p>
                  </div>
                )}
              </div>
            )}
            {(mode === 'create' || mode === 'edit') && (
              <div className="space-y-2">
                {hasMappings ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Provider</TableHead>
                          <TableHead>Role Name</TableHead>
                          <TableHead className="w-[100px]">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mappings.map((mapping) => (
                          <TableRow key={mapping.id}>
                            <TableCell className="font-medium capitalize">
                              {mapping.provider}
                            </TableCell>
                            <TableCell>{mapping.roleName}</TableCell>
                            <TableCell>
                              {onRemoveMapping && (
                                <button
                                  type="button"
                                  onClick={() => onRemoveMapping(mapping.id)}
                                  className="text-sm text-destructive hover:underline"
                                >
                                  삭제
                                </button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    <p>CSP Role 매핑이 없습니다.</p>
                  </div>
                )}
                {onAddMapping && (
                  <div className="pt-2 space-y-3 border-t">
                    <div className="flex gap-2">
                      <FormSelect
                        label="Provider"
                        value={selectedProvider}
                        onChange={(value) => {
                          setSelectedProvider(value);
                          setSelectedRoleName('');
                        }}
                        options={[
                          { value: '', label: 'Provider 선택' },
                          { value: 'aws', label: 'AWS' },
                          { value: 'gcp', label: 'GCP' },
                          { value: 'azure', label: 'Azure' },
                          { value: 'alibaba', label: 'Alibaba' },
                          { value: 'tencent', label: 'Tencent' },
                        ]}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <FormSelect
                        label="Role Name"
                        value={selectedRoleName}
                        onChange={setSelectedRoleName}
                        options={[
                          { value: '', label: 'Role Name 선택' },
                          ...(availableRoles || []).map((role) => ({
                            value: role.name,
                            label: role.name,
                          })),
                        ]}
                        disabled={!selectedProvider || isLoading}
                        className="flex-1"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAdd}
                      disabled={!selectedProvider || !selectedRoleName || isLoading}
                      className="w-full"
                    >
                      CSP Role 추가
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
