'use client';

import { MonitoringConfigDetail } from '@/types/monitoring';

interface DetailsTabProps {
  configDetail: MonitoringConfigDetail;
}

/**
 * Details 탭 컴포넌트
 * Monitor Setting 및 Server 정보 표시
 */
export function DetailsTab({ configDetail }: DetailsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-md font-semibold mb-4">Monitor Setting</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Workload Type</label>
            <p className="mt-1 text-sm">{configDetail.workloadType || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Workload Name</label>
            <p className="mt-1 text-sm">{configDetail.workloadName || '-'}</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold mb-4">Server (VM) Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Server ID</label>
            <p className="mt-1 text-sm">{configDetail.serverId || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Server Name</label>
            <p className="mt-1 text-sm">{configDetail.serverName || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Monitoring Agent Status</label>
            <p className="mt-1 text-sm">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  configDetail.monitoringAgentStatus === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {configDetail.monitoringAgentStatus || '-'}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Log Agent Status</label>
            <p className="mt-1 text-sm">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  configDetail.logAgentStatus === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {configDetail.logAgentStatus || '-'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
