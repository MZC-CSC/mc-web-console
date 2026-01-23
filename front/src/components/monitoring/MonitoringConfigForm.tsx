'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FormSelect } from '@/components/common/FormSelect';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { Switch } from '@/components/ui/switch';
import { MonitoringConfig } from '@/types/mcis-monitoring';
import {
  useMCIsWorkloads,
  useMCIsServers,
  useMeasurements,
  useMetrics,
} from '@/hooks/api/useMCIsMonitoring';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface MonitoringConfigFormProps {
  config: MonitoringConfig;
  onConfigChange: (config: Partial<MonitoringConfig>) => void;
  onStartMonitoring: () => void;
  isMonitoring: boolean;
}

/**
 * Monitoring 설정 폼 컴포넌트
 */
export function MonitoringConfigForm({
  config,
  onConfigChange,
  onStartMonitoring,
  isMonitoring,
}: MonitoringConfigFormProps) {
  const { workloads, isLoading: isWorkloadsLoading } = useMCIsWorkloads();
  const { servers, isLoading: isServersLoading } = useMCIsServers(config.workload);
  const { measurements, isLoading: isMeasurementsLoading } = useMeasurements(config.server);
  const { metrics, isLoading: isMetricsLoading } = useMetrics(config.measurement);

  useEffect(() => {
    // Workload 변경 시 Server 초기화
    if (!config.workload) {
      onConfigChange({ server: null, measurement: null, metric: null });
    }
  }, [config.workload, onConfigChange]);

  useEffect(() => {
    // Server 변경 시 Measurement 초기화
    if (!config.server) {
      onConfigChange({ measurement: null, metric: null });
    }
  }, [config.server, onConfigChange]);

  useEffect(() => {
    // Measurement 변경 시 Metric 초기화
    if (!config.measurement) {
      onConfigChange({ metric: null });
    }
  }, [config.measurement, onConfigChange]);

  const workloadOptions = workloads.map((w) => ({
    value: w.id,
    label: w.name,
  }));

  const serverOptions = servers.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const measurementOptions = measurements.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  const metricOptions = metrics.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  const aggregationOptions = [
    { value: 'avg', label: 'Average' },
    { value: 'sum', label: 'Sum' },
    { value: 'min', label: 'Min' },
    { value: 'max', label: 'Max' },
    { value: 'count', label: 'Count' },
  ];

  const rangeOptions = [
    { value: '1h', label: '1H' },
    { value: '2h', label: '2H' },
    { value: '3h', label: '3H' },
    { value: '4h', label: '4H' },
    { value: '5h', label: '5H' },
    { value: '6h', label: '6H' },
  ];

  const periodOptions = [
    { value: '1m', label: '1m' },
    { value: '3m', label: '3m' },
    { value: '5m', label: '5m' },
    { value: '10m', label: '10m' },
    { value: '12m', label: '12m' },
    { value: '15m', label: '15m' },
    { value: '30m', label: '30m' },
  ];

  const isFormValid =
    config.workload &&
    config.server &&
    config.measurement &&
    config.metric &&
    config.range &&
    config.period;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Monitoring Trend / Workload</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormSelect
              label="Workload"
              value={config.workload || ''}
              onChange={(e) => onConfigChange({ workload: e.target.value || null })}
              options={workloadOptions}
              placeholder="Workload 선택"
              disabled={isWorkloadsLoading}
              required
            />
            {isWorkloadsLoading && <LoadingSpinner size="sm" className="mt-2" />}
          </div>

          <div>
            <FormSelect
              label="Server"
              value={config.server || ''}
              onChange={(e) => onConfigChange({ server: e.target.value || null })}
              options={serverOptions}
              placeholder="Server 선택"
              disabled={!config.workload || isServersLoading}
              required
            />
            {isServersLoading && <LoadingSpinner size="sm" className="mt-2" />}
          </div>

          <div>
            <FormSelect
              label="Measurement"
              value={config.measurement || ''}
              onChange={(e) => onConfigChange({ measurement: e.target.value || null })}
              options={measurementOptions}
              placeholder="Measurement 선택"
              disabled={!config.server || isMeasurementsLoading}
              required
            />
            {isMeasurementsLoading && <LoadingSpinner size="sm" className="mt-2" />}
          </div>

          <div>
            <FormSelect
              label="Metric"
              value={config.metric || ''}
              onChange={(e) => onConfigChange({ metric: e.target.value || null })}
              options={metricOptions}
              placeholder="Metric 선택"
              disabled={!config.measurement || isMetricsLoading}
              required
            />
            {isMetricsLoading && <LoadingSpinner size="sm" className="mt-2" />}
          </div>

          <div>
            <FormSelect
              label="Aggregation"
              value={config.aggregation || ''}
              onChange={(e) => onConfigChange({ aggregation: e.target.value || null })}
              options={aggregationOptions}
              placeholder="Aggregation 선택"
            />
          </div>

          <div>
            <FormSelect
              label="Range"
              value={config.range || ''}
              onChange={(e) => onConfigChange({ range: e.target.value || null })}
              options={rangeOptions}
              placeholder="Range 선택"
              required
            />
          </div>

          <div>
            <FormSelect
              label="Period"
              value={config.period || ''}
              onChange={(e) => onConfigChange({ period: e.target.value || null })}
              options={periodOptions}
              placeholder="Period 선택"
              required
            />
          </div>

          <div>
            <FormSelect
              label="Prediction"
              value={config.prediction || ''}
              onChange={(e) => onConfigChange({ prediction: e.target.value || null })}
              options={[]}
              placeholder="Prediction 선택"
            />
          </div>
        </div>

        {/* Switches */}
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Switch
              id="extend-prediction"
              checked={config.extendPrediction}
              onCheckedChange={(checked) => onConfigChange({ extendPrediction: checked })}
            />
            <label htmlFor="extend-prediction" className="text-sm font-medium">
              Extend Prediction
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="extend-detection"
              checked={config.extendDetection}
              onCheckedChange={(checked) => onConfigChange({ extendDetection: checked })}
            />
            <label htmlFor="extend-detection" className="text-sm font-medium">
              Extend Detection
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={onStartMonitoring}
            disabled={!isFormValid || isMonitoring}
            loading={isMonitoring}
          >
            {isMonitoring ? 'Monitoring...' : 'Start Monitoring'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
