'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MciStatusBadge } from './MciStatusBadge';
import { useMciControl, useMciDelete } from '@/hooks/useMci';
import type { MCI, MciControlAction } from '@/types/mci';
import {
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Eye,
  Server,
} from 'lucide-react';
import { toast } from 'sonner';

interface MciTableProps {
  data: MCI[];
  nsId: string;
}

export function MciTable({ data, nsId }: MciTableProps) {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; mciId: string; mciName: string }>({
    open: false,
    mciId: '',
    mciName: '',
  });

  const controlMutation = useMciControl();
  const deleteMutation = useMciDelete();

  const handleControl = async (mciId: string, action: MciControlAction) => {
    try {
      await controlMutation.mutateAsync({ nsId, mciId, action });
      toast.success(`MCI ${action} requested successfully`);
    } catch {
      toast.error(`Failed to ${action} MCI`);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ nsId, mciId: deleteDialog.mciId });
      toast.success('MCI deleted successfully');
      setDeleteDialog({ open: false, mciId: '', mciName: '' });
    } catch {
      toast.error('Failed to delete MCI');
    }
  };

  const handleViewDetails = (mciId: string) => {
    router.push(`/mci/${mciId}`);
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Server className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No MCI found</h3>
        <p className="text-muted-foreground mt-1">
          Get started by creating a new Multi-Cloud Infrastructure.
        </p>
        <Button className="mt-4" onClick={() => router.push('/mci/create')}>
          Create MCI
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>VMs</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((mci) => (
              <TableRow
                key={mci.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleViewDetails(mci.id)}
              >
                <TableCell className="font-medium">{mci.name}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <MciStatusBadge status={mci.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span>{mci.statusCount?.countTotal || mci.vm?.length || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {mci.description || '-'}
                </TableCell>
                <TableCell>
                  {mci.createdTime
                    ? new Date(mci.createdTime).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(mci.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleControl(mci.id, 'resume')}
                        disabled={controlMutation.isPending}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleControl(mci.id, 'suspend')}
                        disabled={controlMutation.isPending}
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        Suspend
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleControl(mci.id, 'reboot')}
                        disabled={controlMutation.isPending}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reboot
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() =>
                          setDeleteDialog({ open: true, mciId: mci.id, mciName: mci.name })
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, mciId: '', mciName: '' })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete MCI</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteDialog.mciName}&quot;? This action
              cannot be undone. All VMs in this MCI will be terminated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
