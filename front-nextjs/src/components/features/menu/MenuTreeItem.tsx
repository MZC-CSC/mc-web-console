'use client';

/**
 * MenuTreeItem Component
 * Recursive component for rendering tree nodes
 */

import { MenuTreeNode } from '@/types/menu';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Folder,
  FileText,
} from 'lucide-react';

interface MenuTreeItemProps {
  node: MenuTreeNode;
  expandedIds: Set<string>;
  selectedId?: string;
  onToggleExpand: (id: string) => void;
  onSelect?: (menu: MenuTreeNode) => void;
  onEdit?: (menu: MenuTreeNode) => void;
  onDelete?: (menu: MenuTreeNode) => void;
  onAddChild?: (parentMenu: MenuTreeNode) => void;
}

export function MenuTreeItem({
  node,
  expandedIds,
  selectedId,
  onToggleExpand,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
}: MenuTreeItemProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const paddingLeft = node.level * 24;

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
          isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
        )}
        style={{ paddingLeft: `${paddingLeft + 8}px` }}
        onClick={() => onSelect?.(node)}
      >
        {/* Expand/Collapse button */}
        <button
          className="p-0.5 hover:bg-muted rounded"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggleExpand(node.id);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <span className="w-4" />
          )}
        </button>

        {/* Icon */}
        {hasChildren ? (
          <Folder className="h-4 w-4 text-muted-foreground" />
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground" />
        )}

        {/* Label */}
        <span className="flex-1 truncate text-sm">{node.displayname}</span>

        {/* Badges */}
        {node.isaction && (
          <Badge variant="outline" className="text-xs">
            Action
          </Badge>
        )}
        <Badge variant="secondary" className="text-xs">
          #{node.menunumber}
        </Badge>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(node)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddChild?.(node)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Child Menu
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(node)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <MenuTreeItem
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
