'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

/**
 * ChartWidget 컴포넌트
 *
 * 다양한 차트 타입을 지원하는 범용 차트 위젯
 * - Recharts 기반
 * - Line, Bar, Area, Pie, Donut 차트 지원
 * - 다중 시리즈 지원
 * - 툴팁, 범례, 그리드 커스터마이징
 *
 * @example
 * <ChartWidget
 *   type="line"
 *   data={[
 *     { name: 'Jan', value: 400 },
 *     { name: 'Feb', value: 300 }
 *   ]}
 *   title="월별 매출"
 * />
 */

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'donut';

export interface ChartDataPoint {
  [key: string]: string | number | Date;
}

export interface ChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
  stackId?: string;
}

export interface ChartWidgetProps {
  /** 차트 타입 */
  type: ChartType;

  /** 차트 데이터 */
  data: ChartDataPoint[];

  /** 시리즈 설정 (다중 시리즈 시 필수) */
  series?: ChartSeries[];

  /** 단일 시리즈용 데이터 키 (series 미사용 시) */
  dataKey?: string;

  /** 차트 제목 */
  title?: string;

  /** 차트 설명 */
  description?: string;

  /** X축 데이터 키 */
  xAxisKey?: string;

  /** X축 레이블 */
  xAxisLabel?: string;

  /** Y축 레이블 */
  yAxisLabel?: string;

  /** 범례 표시 여부 (기본: true) */
  showLegend?: boolean;

  /** 그리드 표시 여부 (기본: true) */
  showGrid?: boolean;

  /** 툴팁 표시 여부 (기본: true) */
  showTooltip?: boolean;

  /** 애니메이션 활성화 (기본: true) */
  animate?: boolean;

  /** 색상 팔레트 */
  colorPalette?: string[];

  /** 높이 (px) */
  height?: number;

  /** 로딩 상태 */
  isLoading?: boolean;

  /** 에러 메시지 */
  error?: string;

  /** 추가 CSS 클래스 */
  className?: string;
}

// 기본 색상 팔레트 (Tailwind 기반)
const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#22c55e', // green-500
  '#eab308', // yellow-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
];

export function ChartWidget({
  type,
  data,
  series,
  dataKey,
  title,
  description,
  xAxisKey = 'name',
  xAxisLabel,
  yAxisLabel,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  animate = true,
  colorPalette = DEFAULT_COLORS,
  height = 300,
  isLoading = false,
  error,
  className,
}: ChartWidgetProps) {
  // 시리즈 설정 (단일/다중 처리)
  const chartSeries = useMemo(() => {
    if (series) return series;
    if (dataKey) return [{ dataKey, name: dataKey }];

    // dataKey도 series도 없으면 데이터의 첫 번째 숫자 키 사용
    const firstDataPoint = data[0];
    if (!firstDataPoint) return [];

    const numericKeys = Object.keys(firstDataPoint).filter(
      (key) => key !== xAxisKey && typeof firstDataPoint[key] === 'number'
    );

    return numericKeys.map((key) => ({ dataKey: key, name: key }));
  }, [series, dataKey, data, xAxisKey]);

  // 색상 할당
  const seriesWithColors = useMemo(() => {
    return chartSeries.map((s, index) => ({
      ...s,
      color: s.color || colorPalette[index % colorPalette.length],
    }));
  }, [chartSeries, colorPalette]);

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const animationProps = animate
      ? { animationBegin: 0, animationDuration: 800 }
      : { isAnimationActive: false };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis
              dataKey={xAxisKey}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
              className="text-muted-foreground"
            />
            <YAxis
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              className="text-muted-foreground"
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {seriesWithColors.map((s) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={{ fill: s.color, r: 4 }}
                activeDot={{ r: 6 }}
                {...animationProps}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis
              dataKey={xAxisKey}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
              className="text-muted-foreground"
            />
            <YAxis
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              className="text-muted-foreground"
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {seriesWithColors.map((s) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                fill={s.color}
                stackId={s.stackId}
                {...animationProps}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis
              dataKey={xAxisKey}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
              className="text-muted-foreground"
            />
            <YAxis
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              className="text-muted-foreground"
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {seriesWithColors.map((s) => (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.6}
                stackId={s.stackId}
                {...animationProps}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
      case 'donut':
        const pieData = data.map((item, index) => ({
          ...item,
          fill: colorPalette[index % colorPalette.length],
        }));

        return (
          <PieChart>
            <Pie
              data={pieData}
              dataKey={seriesWithColors[0]?.dataKey || 'value'}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              innerRadius={type === 'donut' ? '60%' : 0}
              outerRadius="80%"
              label={showLegend ? undefined : true}
              {...animationProps}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill as string} />
              ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  // 빈 데이터 체크
  if (!isLoading && !error && (!data || data.length === 0)) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            데이터가 없습니다
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * CustomTooltip 컴포넌트
 * Recharts 툴팁 커스터마이징
 */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
      <p className="font-medium text-sm mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
