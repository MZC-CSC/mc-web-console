'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TreeNode } from '@/types/workspace';

interface TreeViewProps {
  data: TreeNode[];
  selectedNodes: string[];
  onSelectionChange: (selectedNodes: string[]) => void;
  checkbox?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * TreeView 컴포넌트
 * jstree 대체용 트리 뷰 컴포넌트
 * Platform access 권한 트리를 표시하는 데 사용
 */
export function TreeView({
  data,
  selectedNodes,
  onSelectionChange,
  checkbox = true,
  className,
  disabled = false,
}: TreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [internalSelectedNodes, setInternalSelectedNodes] = useState<Set<string>>(
    new Set(selectedNodes)
  );

  // 외부에서 selectedNodes가 변경되면 내부 상태 동기화
  useEffect(() => {
    setInternalSelectedNodes(new Set(selectedNodes));
  }, [selectedNodes]);

  const toggleNode = (nodeId: string) => {
    if (disabled) return;
    
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleSelection = (nodeId: string) => {
    if (disabled) return;
    
    const newSelected = new Set(internalSelectedNodes);
    if (newSelected.has(nodeId)) {
      newSelected.delete(nodeId);
    } else {
      newSelected.add(nodeId);
    }
    setInternalSelectedNodes(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  const isNodeExpanded = (nodeId: string) => expandedNodes.has(nodeId);
  const isNodeSelected = (nodeId: string) => internalSelectedNodes.has(nodeId);

  const renderNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = isNodeExpanded(node.id);
    const isSelected = isNodeSelected(node.id);

    return (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            'flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent cursor-pointer',
            isSelected && 'bg-accent',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        >
          {/* 확장/축소 아이콘 */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleNode(node.id)}
              disabled={disabled}
              className="p-0.5 hover:bg-accent-foreground/10 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-5" /> // 공간 확보
          )}

          {/* 체크박스 */}
          {checkbox && (
            <button
              type="button"
              onClick={() => toggleSelection(node.id)}
              disabled={disabled}
              className={cn(
                'flex items-center justify-center w-4 h-4 rounded border-2 transition-colors',
                isSelected
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-input bg-background',
                !disabled && 'hover:border-primary'
              )}
            >
              {isSelected && <Check className="h-3 w-3" />}
            </button>
          )}

          {/* 노드 텍스트 */}
          <span
            className={cn(
              'flex-1 text-sm',
              isSelected && 'font-medium',
              disabled && 'cursor-not-allowed'
            )}
            onClick={() => {
              if (!checkbox) {
                toggleNode(node.id);
              }
            }}
          >
            {node.text}
          </span>
        </div>

        {/* 자식 노드 */}
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('border rounded-md p-2 bg-background', className)}>
      {data.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <p>데이터가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {data.map((node) => renderNode(node, 0))}
        </div>
      )}
    </div>
  );
}
