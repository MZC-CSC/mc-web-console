'use client';

/**
 * MCI Detail Page
 */

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout';
import { MciStatusBadge, VmTable } from '@/components/features/mci';
import { useMci, useMciControl, useMciDelete } from '@/hooks/useMci';
import { useWorkspaceStore } from '@/stores';
import { mciService } from '@/services/mci';
import {
  ArrowLeft,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Loader2,
  AlertCircle,
  Server,
  Calendar,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
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
import { useState } from 'react';
import type { MciControlAction } from '@/types/mci';

export default function MciDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mciId = params.id as string;
  const { currentProject } = useWorkspaceStore();
  const nsId = currentProject?.id || '';

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: mci, isLoading, error, refetch, isFetching } = useMci(nsId, mciId);
  const controlMutation = useMciControl();
  const deleteMutation = useMciDelete();

  const handleBack = () => {
    router.push('/mci');
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleControl = async (action: MciControlAction) => {
    try {
      await controlMutation.mutateAsync({ nsId, mciId, action });
      toast.success(`MCI ${action} requested successfully`);
    } catch {
      toast.error(`Failed to ${action} MCI`);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ nsId, mciId });
      toast.success('MCI deleted successfully');
      router.push('/mci');
    } catch {
      toast.error('Failed to delete MCI');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !mci) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">MCI not found</h3>
        <p className="text-muted-foreground mt-1">
          The requested MCI could not be found.
        </p>
        <Button className="mt-4" variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>
    );
  }

  const providerCount = mciService.calculateProviderCount(mci);
  const providers = Array.from(providerCount.entries());

  return (
    <div>
      <PageHeader
        title={mci.name}
        description={mci.description || 'No description'}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleControl('resume')}
              disabled={controlMutation.isPending}
            >
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleControl('suspend')}
              disabled={controlMutation.isPending}
            >
              <Pause className="mr-2 h-4 w-4" />
              Suspend
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleControl('reboot')}
              disabled={controlMutation.isPending}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reboot
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      {/* MCI Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <MciStatusBadge status={mci.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VMs</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mci.statusCount?.countTotal || mci.vm?.length || 0}
            </div>
            {mci.statusCount && (
              <p className="text-xs text-muted-foreground mt-1">
                {mci.statusCount.countRunning} running
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {providers.length > 0 ? (
                providers.map(([provider, count]) => (
                  <span
                    key={provider}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs"
                  >
                    {provider}: {count}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {mci.createdTime
                ? new Date(mci.createdTime).toLocaleString()
                : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Labels */}
      {mci.label && Object.keys(mci.label).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4" />
              Labels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(mci.label).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* VM List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Virtual Machines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VmTable data={mci.vm || []} />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete MCI</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{mci.name}&quot;? This action cannot
              be undone. All VMs in this MCI will be terminated.
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
    </div>
  );
}
