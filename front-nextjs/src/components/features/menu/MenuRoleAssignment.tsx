'use client';

/**
 * MenuRoleAssignment Component
 * Manage menu assignments to roles
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save } from 'lucide-react';
import type { MenuResource, RoleMenuMapping } from '@/types/menu';

interface Role {
  id: string;
  name: string;
}

interface MenuRoleAssignmentProps {
  menus: MenuResource[];
  roles: Role[];
  roleMappings: RoleMenuMapping[];
  onSave: (roleId: string, menuIds: string[]) => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
}

export function MenuRoleAssignment({
  menus,
  roles,
  roleMappings,
  onSave,
  isLoading,
  isSaving,
}: MenuRoleAssignmentProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string>>(new Set());

  // Load menu selections when role changes
  useEffect(() => {
    if (selectedRoleId) {
      const mapping = roleMappings.find((m) => m.roleId === selectedRoleId);
      setSelectedMenuIds(new Set(mapping?.menuIds || []));
    }
  }, [selectedRoleId, roleMappings]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
  };

  const handleMenuToggle = (menuId: string, checked: boolean) => {
    setSelectedMenuIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(menuId);
      } else {
        next.delete(menuId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedMenuIds(new Set(menus.map((m) => m.id)));
  };

  const handleDeselectAll = () => {
    setSelectedMenuIds(new Set());
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    await onSave(selectedRoleId, Array.from(selectedMenuIds));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Role Menu Assignment</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={selectedRoleId} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedRoleId ? (
          <div className="text-center py-8 text-muted-foreground">
            Select a role to manage menu assignments
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                Deselect All
              </Button>
              <div className="flex-1" />
              <Badge variant="secondary">
                {selectedMenuIds.size} of {menus.length} selected
              </Badge>
            </div>

            {/* Menu list */}
            <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
              {menus.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No menus available</div>
              ) : (
                menus
                  .sort((a, b) => a.menunumber - b.menunumber)
                  .map((menu) => (
                    <div
                      key={menu.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50"
                    >
                      <Checkbox
                        id={menu.id}
                        checked={selectedMenuIds.has(menu.id)}
                        onCheckedChange={(checked) => handleMenuToggle(menu.id, !!checked)}
                      />
                      <label htmlFor={menu.id} className="flex-1 cursor-pointer text-sm">
                        <span className="font-medium">{menu.displayname}</span>
                        <span className="ml-2 text-muted-foreground">({menu.id})</span>
                      </label>
                      <Badge variant="outline" className="text-xs">
                        #{menu.menunumber}
                      </Badge>
                      {menu.isaction && (
                        <Badge variant="secondary" className="text-xs">
                          Action
                        </Badge>
                      )}
                    </div>
                  ))
              )}
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Assignment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
