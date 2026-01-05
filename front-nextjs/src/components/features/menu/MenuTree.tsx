'use client';

/**
 * MenuTree Component
 * Displays menus in a hierarchical tree structure
 */

import { useState, useMemo } from 'react';
import { MenuTreeNode } from '@/types/menu';
import { MenuTreeItem } from './MenuTreeItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronsUpDown, ChevronsDownUp, Loader2 } from 'lucide-react';

interface MenuTreeProps {
  data: MenuTreeNode[];
  onSelect?: (menu: MenuTreeNode) => void;
  onEdit?: (menu: MenuTreeNode) => void;
  onDelete?: (menu: MenuTreeNode) => void;
  onAddChild?: (parentMenu: MenuTreeNode) => void;
  selectedId?: string;
  isLoading?: boolean;
}

export function MenuTree({
  data,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  selectedId,
  isLoading,
}: MenuTreeProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Filter tree based on search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const filterTree = (nodes: MenuTreeNode[]): MenuTreeNode[] => {
      return nodes
        .map((node) => {
          const matchesSearch =
            node.displayname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.id.toLowerCase().includes(searchTerm.toLowerCase());
          const filteredChildren = filterTree(node.children);

          if (matchesSearch || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
          return null;
        })
        .filter((node): node is MenuTreeNode => node !== null);
    };

    return filterTree(data);
  }, [data, searchTerm]);

  const handleToggleExpand = (menuId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: MenuTreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children.length > 0) {
          allIds.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(data);
    setExpandedIds(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleExpandAll}>
          <ChevronsUpDown className="h-4 w-4 mr-1" />
          Expand
        </Button>
        <Button variant="outline" size="sm" onClick={handleCollapseAll}>
          <ChevronsDownUp className="h-4 w-4 mr-1" />
          Collapse
        </Button>
      </div>

      {/* Tree */}
      <div className="border rounded-lg p-2 min-h-[200px]">
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No menus found matching your search.' : 'No menus available.'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredData.map((node) => (
              <MenuTreeItem
                key={node.id}
                node={node}
                expandedIds={expandedIds}
                selectedId={selectedId}
                onToggleExpand={handleToggleExpand}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
