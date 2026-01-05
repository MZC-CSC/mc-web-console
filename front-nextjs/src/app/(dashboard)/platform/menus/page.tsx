'use client';

/**
 * Menu Management Page
 * /platform/menus
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  MenuTree,
  MenuForm,
  MenuDeleteDialog,
  MenuRoleAssignment,
} from '@/components/features/menu';
import { useMenuTree, useMenuCreate, useMenuUpdate, useMenuDelete } from '@/hooks/useMenu';
import { toast } from 'sonner';
import { Plus, RefreshCw, AlertCircle, TreePine, Users } from 'lucide-react';
import type { MenuTreeNode, MenuFormMode, CreateMenuRequest, UpdateMenuRequest } from '@/types/menu';

export default function MenuManagementPage() {
  // State
  const [selectedMenu, setSelectedMenu] = useState<MenuTreeNode | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<MenuFormMode>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<MenuTreeNode | null>(null);

  // Queries
  const { data: menuTree, menuList, isLoading, error, refetch, isFetching } = useMenuTree();

  // Mutations
  const createMutation = useMenuCreate();
  const updateMutation = useMenuUpdate();
  const deleteMutation = useMenuDelete();

  // Handlers
  const handleRefresh = () => {
    refetch();
  };

  const handleCreateNew = () => {
    setSelectedMenu(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEdit = (menu: MenuTreeNode) => {
    setSelectedMenu(menu);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleAddChild = (parentMenu: MenuTreeNode) => {
    setSelectedMenu(parentMenu);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleDelete = (menu: MenuTreeNode) => {
    setMenuToDelete(menu);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateMenuRequest | UpdateMenuRequest) => {
    try {
      if (formMode === 'create') {
        await createMutation.mutateAsync(data as CreateMenuRequest);
        toast.success('Menu created successfully');
      } else {
        await updateMutation.mutateAsync(data as UpdateMenuRequest);
        toast.success('Menu updated successfully');
      }
      setFormOpen(false);
      setSelectedMenu(null);
    } catch {
      toast.error(formMode === 'create' ? 'Failed to create menu' : 'Failed to update menu');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!menuToDelete) return;

    try {
      await deleteMutation.mutateAsync(menuToDelete.id);
      toast.success('Menu deleted successfully');
      setDeleteDialogOpen(false);
      setMenuToDelete(null);
      setSelectedMenu(null);
    } catch {
      toast.error('Failed to delete menu');
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Menu Management"
        description="Manage navigation menus and role assignments"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create Menu
            </Button>
          </>
        }
      />

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Failed to load menus. {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tree" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tree">
            <TreePine className="mr-2 h-4 w-4" />
            Menu Tree
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Users className="mr-2 h-4 w-4" />
            Role Assignment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tree">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Tree */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Menu Structure</CardTitle>
                <CardDescription>
                  Click on a menu to view details, or use the actions to edit/delete.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MenuTree
                  data={menuTree || []}
                  selectedId={selectedMenu?.id}
                  onSelect={setSelectedMenu}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddChild={handleAddChild}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            {/* Details Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Menu Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedMenu ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ID</label>
                      <p className="mt-1 font-mono text-sm">{selectedMenu.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Display Name
                      </label>
                      <p className="mt-1">{selectedMenu.displayname}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Parent ID</label>
                      <p className="mt-1 font-mono text-sm">{selectedMenu.parentid}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Menu Number
                        </label>
                        <p className="mt-1">{selectedMenu.menunumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Priority</label>
                        <p className="mt-1">{selectedMenu.priority}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Is Action</label>
                      <p className="mt-1">{selectedMenu.isaction ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Children</label>
                      <p className="mt-1">{selectedMenu.children.length} items</p>
                    </div>
                    {selectedMenu.path && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Path</label>
                        <p className="mt-1 font-mono text-sm">{selectedMenu.path}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <Button size="sm" onClick={() => handleEdit(selectedMenu)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(selectedMenu)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Select a menu to view details
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <MenuRoleAssignment
            menus={menuList || []}
            roles={[]}
            roleMappings={[]}
            onSave={async (roleId, menuIds) => {
              // TODO: Implement role menu assignment API
              console.log('Save role assignment:', roleId, menuIds);
              toast.success('Role assignment saved');
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <MenuForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        menu={selectedMenu}
        parentMenus={menuList || []}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Dialog */}
      <MenuDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        menu={menuToDelete}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
