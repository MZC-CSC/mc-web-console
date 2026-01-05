'use client';

import { Badge } from '@/components/ui/badge';
import { mciService } from '@/services/mci';
import type { MciDisplayStatus } from '@/types/mci';
import { Loader2 } from 'lucide-react';

interface MciStatusBadgeProps {
  status: string;
}

const statusLabels: Record<MciDisplayStatus, string> = {
  'running': 'Running',
  'running-ing': 'Starting...',
  'stopped': 'Stopped',
  'stopped-ing': 'Stopping...',
  'terminated': 'Terminated',
  'terminated-ing': 'Terminating...',
  'failed': 'Failed',
  'etc': 'Unknown',
};

const statusColors: Record<MciDisplayStatus, string> = {
  'running': 'bg-green-100 text-green-800 hover:bg-green-100',
  'running-ing': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  'stopped': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  'stopped-ing': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  'terminated': 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  'terminated-ing': 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  'failed': 'bg-red-100 text-red-800 hover:bg-red-100',
  'etc': 'bg-gray-100 text-gray-600 hover:bg-gray-100',
};

export function MciStatusBadge({ status }: MciStatusBadgeProps) {
  const displayStatus = mciService.getMciStatusDisplay(status);
  const isLoading = displayStatus.endsWith('-ing');

  return (
    <Badge variant="outline" className={`${statusColors[displayStatus]} border-0`}>
      {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
      {statusLabels[displayStatus]}
    </Badge>
  );
}
