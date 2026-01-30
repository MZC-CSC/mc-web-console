'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { Workspace, Project } from '@/types/workspace';
import { ProjectSelectModal } from './ProjectSelectModal';
import { X } from 'lucide-react';

interface WorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  workspace?: Workspace | null;
  onSubmit: (workspace: Omit<Workspace, 'id'> | Workspace, selectedProjects?: Project[]) => Promise<void>;
  isLoading?: boolean;
}

/**
 * 워크스페이스 생성/수정 모달
 */
export function WorkspaceModal({
  open,
  onOpenChange,
  mode,
  workspace,
  onSubmit,
  isLoading = false,
}: WorkspaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [isProjectSelectModalOpen, setIsProjectSelectModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && workspace) {
        setName(workspace.name || '');
        setDescription(workspace.description || '');
      } else {
        setName('');
        setDescription('');
        setSelectedProjects([]);
      }
      setError(null);
    }
  }, [open, mode, workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    try {
      if (mode === 'create') {
        await onSubmit(
          { name: name.trim(), description: description.trim() || undefined },
          selectedProjects.length > 0 ? selectedProjects : undefined
        );
      } else {
        await onSubmit({ id: workspace!.id, name: name.trim(), description: description.trim() || undefined });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '작업에 실패했습니다.';
      setError(errorMessage);
    }
  };

  const handleAddProject = (project: Project) => {
    if (!selectedProjects.some((p) => p.id === project.id)) {
      setSelectedProjects([...selectedProjects, project]);
    }
  };

  const handleRemoveProject = (projectId: string) => {
    setSelectedProjects(selectedProjects.filter((p) => p.id !== projectId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '워크스페이스 추가' : '워크스페이스 수정'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormInput
              label="이름"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="워크스페이스 이름을 입력하세요"
              required
              disabled={isLoading}
              error={error && !name.trim() ? error : undefined}
            />

            <FormInput
              label="설명"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="워크스페이스 설명을 입력하세요 (선택사항)"
              disabled={isLoading}
            />

            {/* 프로젝트 할당 (생성 모드일 때만 표시) */}
            {mode === 'create' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">프로젝트 할당 (선택사항)</label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsProjectSelectModalOpen(true)}
                  disabled={isLoading}
                >
                  프로젝트 추가
                </Button>

                {/* 선택된 프로젝트 목록 */}
                {selectedProjects.length > 0 && (
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    {selectedProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-2 bg-accent rounded-md"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{project.name}</p>
                          {project.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-2"
                          onClick={() => handleRemoveProject(project.id)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
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

      {/* 프로젝트 선택 모달 */}
      {mode === 'create' && (
        <ProjectSelectModal
          open={isProjectSelectModalOpen}
          onOpenChange={setIsProjectSelectModalOpen}
          onSelect={handleAddProject}
          excludeProjectIds={selectedProjects.map((p) => p.id)}
          isLoading={isLoading}
        />
      )}
    </Dialog>
  );
}
