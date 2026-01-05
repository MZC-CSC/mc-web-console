'use client';

/**
 * MCI Workloads List Page
 */

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout';
import { MciTable } from '@/components/features/mci';
import { useMciList } from '@/hooks/useMci';
import { useWorkspaceStore } from '@/stores';
import { Plus, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

export default function MciListPage() {
  const router = useRouter();
  const { currentProject } = useWorkspaceStore();
  const nsId = currentProject?.id || '';

  const { data: mciList, isLoading, error, refetch, isFetching } = useMciList(nsId);

  const handleRefresh = () => {
    refetch();
  };

  const handleCreate = () => {
    router.push('/mci/create');
  };

  return (
    <div>
      <PageHeader
        title="MCI Workloads"
        description="Manage your Multi-Cloud Infrastructure workloads"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create MCI
            </Button>
          </div>
        }
      />

      {!nsId && (
        <Card className="mb-6">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-muted-foreground">
              Please select a project (namespace) to view MCI workloads.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>MCI List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">Failed to load MCI list</h3>
              <p className="text-muted-foreground mt-1">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
              <Button className="mt-4" variant="outline" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          ) : (
            <MciTable data={mciList || []} nsId={nsId} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
