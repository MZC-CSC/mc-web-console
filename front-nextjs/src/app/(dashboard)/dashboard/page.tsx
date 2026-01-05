'use client';

/**
 * Dashboard Page
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout';
import { Server, Boxes, Folder, Cloud, Activity, TrendingUp } from 'lucide-react';

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatsCard({ title, value, icon, description, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${!trend.isPositive && 'rotate-180'}`} />
            {trend.value}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mock data for demonstration
const mockStats = {
  totalVms: 24,
  totalClusters: 3,
  activeWorkspaces: 5,
  cloudConnections: 8,
};

const mockMcis = [
  { id: '1', name: 'production-mci', status: 'Running', vmCount: 8 },
  { id: '2', name: 'staging-mci', status: 'Running', vmCount: 4 },
  { id: '3', name: 'dev-mci', status: 'Stopped', vmCount: 2 },
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your multi-cloud infrastructure"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total VMs"
          value={mockStats.totalVms}
          icon={<Server className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Clusters"
          value={mockStats.totalClusters}
          icon={<Boxes className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Active Workspaces"
          value={mockStats.activeWorkspaces}
          icon={<Folder className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Cloud Connections"
          value={mockStats.cloudConnections}
          icon={<Cloud className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* MCI Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent MCI Workloads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">VMs</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockMcis.map((mci) => (
                  <tr key={mci.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{mci.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          mci.status === 'Running'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {mci.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{mci.vmCount}</td>
                    <td className="py-3 px-4">
                      <button className="text-sm text-primary hover:underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Server className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Create MCI</h3>
              <p className="text-sm text-muted-foreground">Deploy new multi-cloud infrastructure</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Add Connection</h3>
              <p className="text-sm text-muted-foreground">Connect a new cloud provider</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">View Monitoring</h3>
              <p className="text-sm text-muted-foreground">Check resource metrics and alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
