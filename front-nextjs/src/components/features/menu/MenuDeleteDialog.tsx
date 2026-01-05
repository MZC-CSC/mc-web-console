'use client';

/**
 * MenuDeleteDialog Component
 * Confirmation dialog for deleting menus
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import type { MenuTreeNode } from '@/types/menu';

interface MenuDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu: MenuTreeNode | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function MenuDeleteDialog({
  open,
  onOpenChange,
  menu,
  onConfirm,
  isLoading,
}: MenuDeleteDialogProps) {
  const hasChildren = menu?.children && menu.children.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Menu</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{menu?.displayname}&quot;?
            {hasChildren && (
              <span className="block mt-2 text-destructive font-medium">
                Warning: This menu has {menu?.children.length} child menu(s). Deleting this menu
                may affect the child menus.
              </span>
            )}
            <span className="block mt-2">This action cannot be undone.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
