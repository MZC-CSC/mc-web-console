'use client';

/**
 * MenuForm Component
 * Dialog form for creating and editing menus
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import type { MenuResource, MenuFormMode, MenuTreeNode } from '@/types/menu';

// Form values type
interface MenuFormValues {
  id: string;
  parentid: string;
  displayname: string;
  isaction: boolean;
  priority: number;
  menunumber: number;
  path?: string;
  icon?: string;
  description?: string;
}

interface MenuFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: MenuFormMode;
  menu?: MenuTreeNode | null;
  parentMenus: MenuResource[];
  onSubmit: (data: MenuFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function MenuForm({
  open,
  onOpenChange,
  mode,
  menu,
  parentMenus,
  onSubmit,
  isLoading,
}: MenuFormProps) {
  const form = useForm<MenuFormValues>({
    defaultValues: {
      id: '',
      parentid: 'home',
      displayname: '',
      isaction: false,
      priority: 2,
      menunumber: 1000,
      path: '',
      icon: '',
      description: '',
    },
  });

  // Reset form when dialog opens/closes or menu changes
  useEffect(() => {
    if (open && menu && mode === 'edit') {
      form.reset({
        id: menu.id,
        parentid: menu.parentid,
        displayname: menu.displayname,
        isaction: menu.isaction,
        priority: menu.priority,
        menunumber: menu.menunumber,
        path: menu.path || '',
        icon: menu.icon || '',
        description: menu.description || '',
      });
    } else if (open && mode === 'create') {
      form.reset({
        id: '',
        parentid: menu?.id || 'home',
        displayname: '',
        isaction: false,
        priority: 2,
        menunumber: 1000,
        path: '',
        icon: '',
        description: '',
      });
    }
  }, [open, menu, mode, form]);

  const handleSubmit = async (values: MenuFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Menu' : 'Edit Menu'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new menu item to the navigation.'
              : 'Update the menu item details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Menu ID */}
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., settings-users"
                      disabled={mode === 'edit'}
                    />
                  </FormControl>
                  <FormDescription>Unique identifier (lowercase, no spaces)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Name */}
            <FormField
              control={form.control}
              name="displayname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., User Settings" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parent Menu */}
            <FormField
              control={form.control}
              name="parentid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Menu</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent menu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="home">Home (Root)</SelectItem>
                      {parentMenus.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.displayname} ({m.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Menu Number & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="menunumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Menu Number</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>Sort order</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>Display priority</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Is Action */}
            <FormField
              control={form.control}
              name="isaction"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Is Action Menu</FormLabel>
                    <FormDescription>Action menus represent executable operations</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Path (optional) */}
            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Path (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., /settings/users" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Icon (optional) */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Settings" />
                  </FormControl>
                  <FormDescription>Lucide icon name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Create' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
