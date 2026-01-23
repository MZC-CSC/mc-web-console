'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/workspace';
import { useAllProjects, useCreateProject } from '@/hooks/api/useProjects';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { FormInput } from '@/components/common/FormInput';
import { FormTextarea } from '@/components/common/FormTextarea';
import { Search } from 'lucide-react';

interface ProjectSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (project: Project) => void;
  excludeProjectIds?: string[]; // 이미 추가된 프로젝트 ID 목록
  isLoading?: boolean;
}

/**
 * 워크스페이스에 추가할 프로젝트 선택 모달
 */
export function ProjectSelectModal({
  open,
  onOpenChange,
  onSelect,
  excludeProjectIds = [],
  isLoading = false,
}: ProjectSelectModalProps) {
  const { projects, isLoading: isLoadingProjects } = useAllProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'select' | 'create'>('select');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateProject();

  // 이미 추가된 프로젝트 제외 및 검색 필터링
  const availableProjects = projects.filter((project) => {
    const isNotExcluded = !excludeProjectIds.includes(project.id);
    const matchesSearch =
      searchTerm === '' ||
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return isNotExcluded && matchesSearch;
  });

  const handleSelect = (project: Project) => {
    onSelect(project);
    onOpenChange(false);
    resetForm();
  };

  /**
   * 생성 폼 검증
   */
  const validateCreateForm = (): boolean => {
    if (!projectName.trim()) {
      setError('프로젝트 이름을 입력해주세요.');
      return false;
    }
    if (!projectDescription.trim()) {
      setError('프로젝트 설명을 입력해주세요.');
      return false;
    }
    setError(null);
    return true;
  };

  /**
   * 프로젝트 생성 핸들러
   */
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    try {
      const createdProject = await createMutation.mutateAsync({
        name: projectName.trim(),
        description: projectDescription.trim(),
      });

      // 생성된 프로젝트를 워크스페이스에 할당 (기존 로직 재사용)
      onSelect(createdProject);

      resetForm();
      onOpenChange(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '프로젝트 생성에 실패했습니다.';
      setError(errorMessage);
    }
  };

  /**
   * 폼 초기화
   */
  const resetForm = () => {
    setProjectName('');
    setProjectDescription('');
    setError(null);
    setSearchTerm('');
    setActiveTab('select');
  };

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>프로젝트 추가</DialogTitle>
          <DialogDescription>
            기존 프로젝트를 선택하거나 새로운 프로젝트를 생성하세요.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'select' | 'create')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">기존 프로젝트 선택</TabsTrigger>
            <TabsTrigger value="create">새 프로젝트 생성</TabsTrigger>
          </TabsList>

          {/* 탭 1: 기존 프로젝트 선택 */}
          <TabsContent value="select" className="space-y-4 mt-4">
            {/* 검색 입력 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="프로젝트 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* 프로젝트 목록 */}
            <div className="h-[400px] rounded-md border overflow-y-auto">
              {isLoadingProjects ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">로딩 중...</p>
                </div>
              ) : availableProjects.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">
                    {searchTerm
                      ? '검색 결과가 없습니다.'
                      : '추가할 수 있는 프로젝트가 없습니다.'}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {availableProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleSelect(project)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{project.name}</p>
                        {project.description && (
                          <p className="text-sm text-muted-foreground">
                            {project.description}
                          </p>
                        )}
                        {project.ns_id && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Namespace: {project.ns_id}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(project);
                        }}
                        disabled={isLoading}
                      >
                        추가
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* 탭 2: 새 프로젝트 생성 */}
          <TabsContent value="create" className="mt-4">
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <FormInput
                  label="프로젝트 이름"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="프로젝트 이름을 입력하세요"
                  required
                  disabled={createMutation.isPending || isLoading}
                />

                <FormTextarea
                  label="프로젝트 설명"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="프로젝트 설명을 입력하세요"
                  required
                  disabled={createMutation.isPending || isLoading}
                  rows={4}
                />
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={createMutation.isPending || isLoading}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || isLoading}
                >
                  {createMutation.isPending || isLoading
                    ? '처리 중...'
                    : '생성 및 할당'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>

        {/* 선택 탭일 때만 취소 버튼 표시 */}
        {activeTab === 'select' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
