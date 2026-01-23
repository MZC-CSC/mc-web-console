'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface WorkspaceAccessCardProps {
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  mode: 'view' | 'create' | 'edit';
  className?: string;
}

/**
 * Workspace Access 카드 컴포넌트
 * Workspace access 토글을 표시하는 카드
 */
export function WorkspaceAccessCard({
  enabled = false,
  onToggle,
  mode,
  className,
}: WorkspaceAccessCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const isDisabled = mode === 'view';

  return (
    <Card className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Workspace Access</CardTitle>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="workspace-access-toggle" className="text-sm font-medium">
                  Workspace Access 활성화
                </Label>
                <p className="text-xs text-muted-foreground">
                  {enabled
                    ? '이 Role은 Workspace에 접근할 수 있습니다.'
                    : '이 Role은 Workspace에 접근할 수 없습니다.'}
                </p>
              </div>
              <Switch
                id="workspace-access-toggle"
                checked={enabled}
                onCheckedChange={onToggle}
                disabled={isDisabled}
              />
            </div>
            {mode === 'view' && (
              <div className="mt-2">
                <span
                  className={`text-sm font-medium ${
                    enabled ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  상태: {enabled ? '활성화됨' : '비활성화됨'}
                </span>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
