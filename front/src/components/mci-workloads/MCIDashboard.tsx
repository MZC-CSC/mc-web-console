'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MCIStatus, ServerStatus } from '@/types/mci-workloads';

interface MCIDashboardProps {
  mciStatus: MCIStatus;
  serverStatus: ServerStatus;
  isLoading?: boolean;
}

/**
 * MCI Status 및 Server Status 대시보드 컴포넌트
 * 참조 HTML과 디자인 일치: 각 상태별 색상 배경 카드 사용
 */
export function MCIDashboard({ mciStatus, serverStatus, isLoading = false }: MCIDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-6">
          <div className="h-32 animate-pulse bg-muted" />
        </Card>
        <Card className="p-6">
          <div className="h-32 animate-pulse bg-muted" />
        </Card>
      </div>
    );
  }

  // 참조 HTML 디자인: 각 상태별 배경색 카드
  const mciStatusItems = [
    { 
      label: 'Total', 
      value: mciStatus.total, 
      bgColor: '', 
      textColor: 'text-foreground' 
    },
    { 
      label: 'Running', 
      value: mciStatus.running, 
      bgColor: 'bg-green-50 dark:bg-green-950', 
      textColor: 'text-green-700 dark:text-green-300' 
    },
    { 
      label: 'Stopped', 
      value: mciStatus.stopped, 
      bgColor: 'bg-yellow-50 dark:bg-yellow-950', 
      textColor: 'text-yellow-700 dark:text-yellow-300' 
    },
    { 
      label: 'Terminated', 
      value: mciStatus.terminated, 
      bgColor: 'bg-muted', 
      textColor: 'text-muted-foreground' 
    },
    { 
      label: 'Failed', 
      value: mciStatus.failed, 
      bgColor: 'bg-red-50 dark:bg-red-950', 
      textColor: 'text-red-700 dark:text-red-300' 
    },
    { 
      label: 'ETC', 
      value: mciStatus.etc, 
      bgColor: 'bg-blue-50 dark:bg-blue-950', 
      textColor: 'text-blue-700 dark:text-blue-300' 
    },
  ];

  const serverStatusItems = [
    { 
      label: 'Total', 
      value: serverStatus.total, 
      bgColor: '', 
      textColor: 'text-foreground' 
    },
    { 
      label: 'Running', 
      value: serverStatus.running, 
      bgColor: 'bg-green-50 dark:bg-green-950', 
      textColor: 'text-green-700 dark:text-green-300' 
    },
    { 
      label: 'Stopped', 
      value: serverStatus.stopped, 
      bgColor: 'bg-yellow-50 dark:bg-yellow-950', 
      textColor: 'text-yellow-700 dark:text-yellow-300' 
    },
    { 
      label: 'Terminated', 
      value: serverStatus.terminated, 
      bgColor: 'bg-muted', 
      textColor: 'text-muted-foreground' 
    },
    { 
      label: 'Failed', 
      value: serverStatus.failed, 
      bgColor: 'bg-red-50 dark:bg-red-950', 
      textColor: 'text-red-700 dark:text-red-300' 
    },
    { 
      label: 'ETC', 
      value: serverStatus.etc, 
      bgColor: 'bg-blue-50 dark:bg-blue-950', 
      textColor: 'text-blue-700 dark:text-blue-300' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* MCI Status Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>MCI Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {mciStatusItems.map((item) => (
              <div
                key={item.label}
                className={`rounded-lg p-4 text-center border-0 ${
                  item.bgColor || 'bg-background'
                }`}
              >
                <div className={`text-2xl font-bold mb-1 ${item.textColor}`}>
                  {item.value}
                </div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Server Status Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Server Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {serverStatusItems.map((item) => (
              <div
                key={item.label}
                className={`rounded-lg p-4 text-center border-0 ${
                  item.bgColor || 'bg-background'
                }`}
              >
                <div className={`text-2xl font-bold mb-1 ${item.textColor}`}>
                  {item.value}
                </div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
