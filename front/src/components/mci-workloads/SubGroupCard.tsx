'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { MCISubGroup, MCIServer, Spec, Image } from '@/types/mci-workloads';
import { X, Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SpecRecommendationModal } from './SpecRecommendationModal';
import { ImageRecommendationModal } from './ImageRecommendationModal';

interface SubGroupCardProps {
  subGroup: MCISubGroup;
  index: number;
  onUpdate: (subGroup: MCISubGroup) => void;
  onDelete: () => void;
  isLoading?: boolean;
}

/**
 * SubGroup 카드 컴포넌트
 */
export function SubGroupCard({
  subGroup,
  index,
  onUpdate,
  onDelete,
  isLoading = false,
}: SubGroupCardProps) {
  const [name, setName] = useState(subGroup.name || '');
  const [isOpen, setIsOpen] = useState(true);
  const [servers, setServers] = useState<MCIServer[]>(subGroup.servers || []);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentServerIndex, setCurrentServerIndex] = useState<number | null>(null);

  const handleNameChange = (newName: string) => {
    setName(newName);
    onUpdate({
      ...subGroup,
      name: newName,
      servers,
    });
  };

  const handleAddServer = () => {
    const newServer: MCIServer = {
      id: `server-${Date.now()}`,
      name: `Server ${servers.length + 1}`,
    };
    const updatedServers = [...servers, newServer];
    setServers(updatedServers);
    onUpdate({
      ...subGroup,
      name,
      servers: updatedServers,
    });
  };

  const handleUpdateServer = (serverIndex: number, updatedServer: MCIServer) => {
    const updatedServers = [...servers];
    updatedServers[serverIndex] = updatedServer;
    setServers(updatedServers);
    onUpdate({
      ...subGroup,
      name,
      servers: updatedServers,
    });
  };

  const handleDeleteServer = (serverIndex: number) => {
    const updatedServers = servers.filter((_, i) => i !== serverIndex);
    setServers(updatedServers);
    onUpdate({
      ...subGroup,
      name,
      servers: updatedServers,
    });
  };

  return (
    <Card className="p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium">SubGroup {index + 1}</span>
          </CollapsibleTrigger>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isLoading}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <CollapsibleContent className="mt-4 space-y-4">
          <FormInput
            label="SubGroup 이름"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="SubGroup 이름을 입력하세요"
            required
            disabled={isLoading}
          />

          {/* 서버 목록 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">서버</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddServer}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                서버 추가
              </Button>
            </div>

            {servers.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                서버가 없습니다. 서버를 추가해주세요.
              </div>
            ) : (
              <div className="space-y-2">
                {servers.map((server, serverIndex) => (
                  <ServerForm
                    key={server.id || serverIndex}
                    server={server}
                    index={serverIndex}
                    subGroupIndex={index}
                    onUpdate={(updated) => handleUpdateServer(serverIndex, updated)}
                    onDelete={() => handleDeleteServer(serverIndex)}
                    onOpenSpecModal={handleOpenSpecModal}
                    onOpenImageModal={handleOpenImageModal}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Recommendation 모달들 */}
      <SpecRecommendationModal
        open={isSpecModalOpen}
        onClose={() => {
          setIsSpecModalOpen(false);
          setCurrentServerIndex(null);
        }}
        onApply={handleApplySpec}
      />

      <ImageRecommendationModal
        open={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setCurrentServerIndex(null);
        }}
        onApply={handleApplyImage}
        specInfo={
          currentServerIndex !== null && servers[currentServerIndex]?.specId
            ? {
                // TODO: Spec 정보를 가져와서 전달
              }
            : undefined
        }
      />
    </Card>
  );
}

/**
 * 서버 설정 폼 컴포넌트
 */
interface ServerFormProps {
  server: MCIServer;
  index: number;
  subGroupIndex: number;
  onUpdate: (server: MCIServer) => void;
  onDelete: () => void;
  onOpenSpecModal: (subGroupIndex: number, serverIndex: number) => void;
  onOpenImageModal: (subGroupIndex: number, serverIndex: number) => void;
  isLoading?: boolean;
}

function ServerForm({
  server,
  index,
  subGroupIndex,
  onUpdate,
  onDelete,
  onOpenSpecModal,
  onOpenImageModal,
  isLoading = false,
}: ServerFormProps) {
  const [name, setName] = useState(server.name || '');
  const [specId, setSpecId] = useState(server.specId || '');
  const [imageId, setImageId] = useState(server.imageId || '');
  const [connectionName, setConnectionName] = useState(server.connectionName || '');

  const handleUpdate = () => {
    onUpdate({
      ...server,
      name,
      specId,
      imageId,
      connectionName,
    });
  };

  return (
    <div className="p-3 border rounded-lg space-y-2 bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">서버 {index + 1}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={isLoading}
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FormInput
          label="서버 이름"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            handleUpdate();
          }}
          placeholder="서버 이름"
          disabled={isLoading}
          className="text-sm"
        />

        <FormInput
          label="Connection Name"
          type="text"
          value={connectionName}
          onChange={(e) => {
            setConnectionName(e.target.value);
            handleUpdate();
          }}
          placeholder="Connection Name"
          disabled={isLoading}
          className="text-sm"
        />

        <FormInput
          label="Spec ID"
          type="text"
          value={specId}
          onChange={(e) => {
            setSpecId(e.target.value);
            handleUpdate();
          }}
          placeholder="Spec ID (선택사항)"
          disabled={isLoading}
          className="text-sm"
        />

        <FormInput
          label="Image ID"
          type="text"
          value={imageId}
          onChange={(e) => {
            setImageId(e.target.value);
            handleUpdate();
          }}
          placeholder="Image ID (선택사항)"
          disabled={isLoading}
          className="text-sm"
        />
      </div>
    </div>
  );
}
