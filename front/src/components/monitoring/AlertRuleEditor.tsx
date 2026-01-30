'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AlertRuleEditor 컴포넌트
 *
 * 알람 규칙 생성/편집 폼
 * - React Hook Form + Zod 기반
 * - 메트릭 조건 설정
 * - 알림 채널 설정
 * - 유효성 검사
 *
 * @example
 * <AlertRuleEditor
 *   mode="create"
 *   onSave={(rule) => handleSave(rule)}
 *   onCancel={() => handleCancel()}
 * />
 */

export type AlertConditionOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertChannel = 'email' | 'slack' | 'webhook' | 'sms';

// Zod 스키마
const alertConditionSchema = z.object({
  id: z.string(),
  metric: z.string().min(1, '메트릭을 선택하세요'),
  operator: z.enum(['>', '<', '>=', '<=', '==', '!=']),
  threshold: z.number().min(0, '임계값을 입력하세요'),
  duration: z.number().min(1, '지속 시간을 입력하세요'),
});

const alertNotificationSchema = z.object({
  channel: z.enum(['email', 'slack', 'webhook', 'sms']),
  recipients: z.array(z.string()).min(1, '수신자를 입력하세요'),
  message: z.string().optional(),
});

const alertRuleSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  description: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  conditions: z.array(alertConditionSchema).min(1, '최소 1개 조건이 필요합니다'),
  notifications: z.array(alertNotificationSchema).min(1, '최소 1개 알림 채널이 필요합니다'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  enabled: z.boolean(),
});

type AlertRuleFormData = z.infer<typeof alertRuleSchema>;

export interface AlertRule extends AlertRuleFormData {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AlertRuleEditorProps {
  /** 편집 모드 */
  mode: 'create' | 'edit';

  /** 초기 규칙 데이터 (편집 시) */
  initialRule?: AlertRule;

  /** 사용 가능한 메트릭 목록 */
  availableMetrics?: Array<{ value: string; label: string; unit: string }>;

  /** 사용 가능한 알림 채널 */
  availableChannels?: AlertChannel[];

  /** 저장 핸들러 */
  onSave: (rule: AlertRule) => void | Promise<void>;

  /** 취소 핸들러 */
  onCancel: () => void;

  /** 저장 중 상태 */
  isSaving?: boolean;

  /** 에러 메시지 */
  error?: string;

  /** 추가 CSS 클래스 */
  className?: string;
}

const DEFAULT_METRICS = [
  { value: 'cpu', label: 'CPU 사용률', unit: '%' },
  { value: 'memory', label: '메모리 사용률', unit: '%' },
  { value: 'disk', label: '디스크 사용률', unit: '%' },
  { value: 'network', label: '네트워크 사용량', unit: 'Mbps' },
];

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
  critical: '긴급',
};

export function AlertRuleEditor({
  mode,
  initialRule,
  availableMetrics = DEFAULT_METRICS,
  availableChannels = ['email', 'webhook'],
  onSave,
  onCancel,
  isSaving = false,
  error,
  className,
}: AlertRuleEditorProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AlertRuleFormData>({
    resolver: zodResolver(alertRuleSchema),
    defaultValues: initialRule || {
      name: '',
      description: '',
      conditions: [
        {
          id: '1',
          metric: '',
          operator: '>',
          threshold: 0,
          duration: 5,
        },
      ],
      notifications: [
        {
          channel: 'email',
          recipients: [],
          message: '',
        },
      ],
      severity: 'medium',
      enabled: true,
    },
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: 'conditions',
  });

  const {
    fields: notificationFields,
    append: appendNotification,
    remove: removeNotification,
  } = useFieldArray({
    control,
    name: 'notifications',
  });

  const onSubmit = async (data: AlertRuleFormData) => {
    await onSave(data as AlertRule);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'create' ? '알람 규칙 생성' : '알람 규칙 수정'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">기본 정보</h3>

            <div className="space-y-2">
              <Label htmlFor="name">규칙 이름 *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="예: 높은 CPU 사용률 경고"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="규칙 설명 (선택)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity">심각도 *</Label>
                <Select {...register('severity')}>
                  <SelectTrigger id="severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enabled" className="flex items-center gap-2">
                  <span>활성화</span>
                  <Switch {...register('enabled')} />
                </Label>
              </div>
            </div>
          </div>

          {/* 조건 설정 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">조건 설정</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendCondition({
                    id: Date.now().toString(),
                    metric: '',
                    operator: '>',
                    threshold: 0,
                    duration: 5,
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                조건 추가
              </Button>
            </div>

            {conditionFields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3">
                      <Label>메트릭 *</Label>
                      <Select {...register(`conditions.${index}.metric`)}>
                        <SelectTrigger>
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMetrics.map((metric) => (
                            <SelectItem key={metric.value} value={metric.value}>
                              {metric.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.conditions?.[index]?.metric && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.conditions[index]?.metric?.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Label>연산자 *</Label>
                      <Select {...register(`conditions.${index}.operator`)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=">">{'>'}</SelectItem>
                          <SelectItem value=">=">{'>='}</SelectItem>
                          <SelectItem value="<">{'<'}</SelectItem>
                          <SelectItem value="<=">{'<='}</SelectItem>
                          <SelectItem value="==">{'=='}</SelectItem>
                          <SelectItem value="!=">{'!='}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-3">
                      <Label>임계값 *</Label>
                      <Input
                        type="number"
                        step="0.1"
                        {...register(`conditions.${index}.threshold`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.conditions?.[index]?.threshold && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.conditions[index]?.threshold?.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-3">
                      <Label>지속 시간 (분) *</Label>
                      <Input
                        type="number"
                        {...register(`conditions.${index}.duration`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.conditions?.[index]?.duration && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.conditions[index]?.duration?.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-1 flex items-end">
                      {conditionFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCondition(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {errors.conditions && (
              <p className="text-sm text-destructive">
                {errors.conditions.message || errors.conditions.root?.message}
              </p>
            )}
          </div>

          {/* 알림 설정 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">알림 설정</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendNotification({
                    channel: 'email',
                    recipients: [],
                    message: '',
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                채널 추가
              </Button>
            </div>

            {notificationFields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>알림 채널 *</Label>
                    {notificationFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNotification(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <Select {...register(`notifications.${index}.channel`)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableChannels.map((channel) => (
                        <SelectItem key={channel} value={channel}>
                          {channel.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div>
                    <Label>수신자 (쉼표로 구분) *</Label>
                    <Input
                      {...register(`notifications.${index}.recipients`, {
                        setValueAs: (v) =>
                          typeof v === 'string' ? v.split(',').map((s) => s.trim()) : v,
                      })}
                      placeholder="예: user@example.com, admin@example.com"
                    />
                    {errors.notifications?.[index]?.recipients && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.notifications[index]?.recipients?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>메시지 템플릿 (선택)</Label>
                    <Input
                      {...register(`notifications.${index}.message`)}
                      placeholder="커스텀 알림 메시지"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {errors.notifications && (
              <p className="text-sm text-destructive">
                {errors.notifications.message || errors.notifications.root?.message}
              </p>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
