'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { VM } from '@/types/mci';
import { Server, Globe, Lock, HardDrive } from 'lucide-react';

interface VmTableProps {
  data: VM[];
}

function getVmStatusColor(status: string): string {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('running')) {
    return 'bg-green-100 text-green-800';
  }
  if (lowerStatus.includes('suspended')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (lowerStatus.includes('terminated') || lowerStatus.includes('failed')) {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-gray-100 text-gray-600';
}

export function VmTable({ data }: VmTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Server className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No VMs found</h3>
        <p className="text-muted-foreground mt-1">
          This MCI does not have any virtual machines.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Public IP</TableHead>
            <TableHead>Private IP</TableHead>
            <TableHead>Spec</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((vm) => (
            <TableRow key={vm.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  {vm.name}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${getVmStatusColor(vm.status)} border-0`}>
                  {vm.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {vm.connectionConfig?.providerName || '-'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {vm.region?.Region || '-'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {vm.publicIP ? (
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-sm">{vm.publicIP}</span>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {vm.privateIP ? (
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-sm">{vm.privateIP}</span>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[150px]">
                    {vm.specId || '-'}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
