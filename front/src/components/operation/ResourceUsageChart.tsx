'use client';

import { useMemo, useState } from 'react';
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * ResourceUsageChart 컴포넌트
 *
 * 리소스 사용량 시계열 차트
 * - CPU, Memory, Disk, Network 등 다중 메트릭 지원
 * - 다중 Y축 (메트릭별 다른 단위)
 * - 시간 범위 선택
 * - 메트릭 토글
 * - 임계값 표시
 *
 * @example
 * <ResourceUsageChart
 *   metrics={[
 *     {
 *       type: 'cpu',
 *       label: 'CPU 사용률',
 *       data: cpuData,
 *       unit: '%',
 *       threshold: { warning: 70, critical: 90 }
 *     }
 *   ]}
 * />
 */

export type ResourceMetricType = 'cpu' | 'memory' | 'disk' | 'network';

export interface ResourceMetricData {
  timestamp: Date | string;
  value: number;
}

export interface ResourceMetric {
  type: ResourceMetricType;
  label: string;
  data: ResourceMetricData[];
  unit: string; // '%', 'GB', 'Mbps'
  color?: string;
  threshold?: {
    warning?: number;
    critical?: number;
  };
}

export interface ResourceUsageChartProps {
  /** 리소스 메트릭 목록 */
  metrics: ResourceMetric[];

  /** 차트 제목 */
  title?: string;

  /** 시간 범위 (분 단위) */
  timeRange?: number;

  /** 시간 범위 선택기 표시 */
  showTimeRangeSelector?: boolean;

  /** 사용 가능한 시간 범위 옵션 */
  timeRangeOptions?: Array<{ label: string; value: number }>;

  /** 메트릭 토글 활성화 */
  enableMetricToggle?: boolean;

  /** 임계값 표시 */
  showThresholds?: boolean;

  /** 높이 */
  height?: number;

  /** 로딩 상태 */
  isLoading?: boolean;

  /** 에러 메시지 */
  error?: string;

  /** 시간 범위 변경 핸들러 */
  onTimeRangeChange?: (range: number) => void;

  /** 추가 CSS 클래스 */
  className?: string;
}

const DEFAULT_TIME_RANGES = [
  { label: '1시간', value: 60 },
  { label: '6시간', value: 360 },
  { label: '24시간', value: 1440 },
  { label: '7일', value: 10080 },
  { label: '30일', value: 43200 },
];

const METRIC_CONFIG: Record<ResourceMetricType, { color: string; yAxisId: string }> = {
  cpu: { color: '#3b82f6', yAxisId: 'percent' },
  memory: { color: '#22c55e', yAxisId: 'percent' },
  disk: { color: '#eab308', yAxisId: 'percent' },
  network: { color: '#a855f7', yAxisId: 'bytes' },
};

export function ResourceUsageChart({
  metrics,
  title = '리소스 사용량',
  timeRange = 60,
  showTimeRangeSelector = true,
  timeRangeOptions = DEFAULT_TIME_RANGES,
  enableMetricToggle = true,
  showThresholds = true,
  height = 400,
  isLoading = false,
  error,
  onTimeRangeChange,
  className,
}: ResourceUsageChartProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [activeMetrics, setActiveMetrics] = useState<Set<ResourceMetricType>>(
    new Set(metrics.map((m) => m.type))
  );

  // 데이터 변환 및 필터링
  const chartData = useMemo(() => {
    // 시간 범위로 필터링
    const now = new Date();
    const startTime = new Date(now.getTime() - selectedTimeRange * 60 * 1000);

    // 메트릭 데이터 병합
    const dataMap = new Map<string, any>();

    metrics.forEach((metric) => {
      if (!activeMetrics.has(metric.type)) return;

      metric.data.forEach((point) => {
        const timestamp: Date = typeof point.timestamp === 'string'
          ? new Date(point.timestamp)
          : point.timestamp;

        // 유효한 Date 객체인지 확인
        if (!(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
          return;
        }

        if (timestamp < startTime) return;

        const key = timestamp.toISOString();
        const existing = dataMap.get(key) || { timestamp: timestamp.getTime() };
        existing[metric.type] = point.value;
        dataMap.set(key, existing);
      });
    });

    return Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp);
  }, [metrics, selectedTimeRange, activeMetrics]);

  const handleTimeRangeChange = (value: string) => {
    const range = parseInt(value);
    setSelectedTimeRange(range);
    onTimeRangeChange?.(range);
  };

  const toggleMetric = (metricType: ResourceMetricType) => {
    if (!enableMetricToggle) return;

    setActiveMetrics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(metricType)) {
        newSet.delete(metricType);
      } else {
        newSet.add(metricType);
      }
      return newSet;
    });
  };

  // 메트릭별 색상 및 설정
  const metricsWithConfig = useMemo(() => {
    return metrics.map((metric) => ({
      ...metric,
      ...METRIC_CONFIG[metric.type],
      color: metric.color || METRIC_CONFIG[metric.type].color,
    }));
  }, [metrics]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {showTimeRangeSelector && (
            <Select value={selectedTimeRange.toString()} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* 메트릭 토글 */}
        {enableMetricToggle && (
          <div className="flex gap-3 mt-4">
            {metricsWithConfig.map((metric) => {
              const isActive = activeMetrics.has(metric.type);

              return (
                <label
                  key={metric.type}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleMetric(metric.type)}
                >
                  <Checkbox checked={isActive} />
                  <Badge
                    variant={isActive ? 'default' : 'outline'}
                    style={isActive ? { backgroundColor: metric.color } : undefined}
                  >
                    {metric.label}
                  </Badge>
                </label>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => {
                const date = new Date(value);
                return selectedTimeRange > 1440
                  ? date.toLocaleDateString()
                  : date.toLocaleTimeString();
              }}
              className="text-muted-foreground"
            />
            <YAxis
              yAxisId="percent"
              label={{ value: '%', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
              className="text-muted-foreground"
            />
            <YAxis
              yAxisId="bytes"
              orientation="right"
              label={{ value: 'Mbps', angle: -90, position: 'insideRight' }}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip metrics={metricsWithConfig} />} />
            <Legend />

            {metricsWithConfig.map((metric) => {
              const isActive = activeMetrics.has(metric.type);
              if (!isActive) return null;

              return (
                <Area
                  key={metric.type}
                  type="monotone"
                  dataKey={metric.type}
                  stroke={metric.color}
                  fill={metric.color}
                  fillOpacity={0.3}
                  yAxisId={metric.yAxisId}
                  name={metric.label}
                  isAnimationActive={true}
                />
              );
            })}

            {/* 임계값 표시 */}
            {showThresholds &&
              metricsWithConfig.map((metric) => {
                if (!activeMetrics.has(metric.type) || !metric.threshold) return null;

                return (
                  <g key={`threshold-${metric.type}`}>
                    {metric.threshold.warning && (
                      <ReferenceLine
                        y={metric.threshold.warning}
                        yAxisId={metric.yAxisId}
                        stroke="#eab308"
                        strokeDasharray="3 3"
                        label={{ value: `${metric.label} 경고`, fill: '#eab308', fontSize: 12 }}
                      />
                    )}
                    {metric.threshold.critical && (
                      <ReferenceLine
                        y={metric.threshold.critical}
                        yAxisId={metric.yAxisId}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        label={{ value: `${metric.label} 위험`, fill: '#ef4444', fontSize: 12 }}
                      />
                    )}
                  </g>
                );
              })}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * CustomTooltip 컴포넌트
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number | string;
    color: string;
  }>;
  label?: number;
  metrics: (ResourceMetric & { color: string; yAxisId: string })[];
}

function CustomTooltip({ active, payload, label, metrics }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const timestamp = new Date(label || 0);

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
      <p className="font-medium text-sm mb-2">{timestamp.toLocaleString()}</p>
      {payload.map((entry: { dataKey: string; value: number | string; color: string }, index: number) => {
        const metric = metrics.find((m) => m.type === entry.dataKey);
        if (!metric) return null;

        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{metric.label}:</span>
            <span className="font-medium">
              {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value} {metric.unit}
            </span>
          </div>
        );
      })}
    </div>
  );
}
