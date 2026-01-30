'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/common/Button';
import { DollarSign, Server, HardDrive, Network } from 'lucide-react';

interface MCICostEstimationModalProps {
  open: boolean;
  onClose: () => void;
  data: any; // TODO: 실제 API 응답 타입 정의 필요
}

/**
 * MCI 비용 예상 모달
 * PostMciDynamicReview API 응답을 표시합니다.
 */
export function MCICostEstimationModal({
  open,
  onClose,
  data,
}: MCICostEstimationModalProps) {
  if (!data) return null;

  // API 응답 구조에 따라 데이터 파싱
  // TODO: 실제 API 응답 구조 확인 후 수정 필요
  const estimatedCost = data.estimatedCost || data.totalCost || 0;
  const currency = data.currency || 'USD';
  const period = data.period || 'hour';
  const subGroups = data.subGroups || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            MCI 비용 예상
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 총 예상 비용 */}
          <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">예상 비용 ({period})</div>
              <div className="text-4xl font-bold text-primary">
                ${typeof estimatedCost === 'number' ? estimatedCost.toFixed(2) : estimatedCost}
                <span className="text-lg ml-2 text-muted-foreground">{currency}</span>
              </div>
            </div>
          </div>

          {/* SubGroup별 비용 상세 */}
          {subGroups.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Server className="h-5 w-5" />
                SubGroup 상세
              </h3>
              <div className="space-y-3">
                {subGroups.map((sg: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-muted/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{sg.name || `SubGroup ${index + 1}`}</div>
                      <div className="text-lg font-semibold text-primary">
                        ${typeof sg.cost === 'number' ? sg.cost.toFixed(2) : sg.cost || '0.00'} / {period}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">서버 개수:</span> {sg.count || sg.subGroupSize || '-'}
                      </div>
                      <div>
                        <span className="font-medium">Spec:</span> {sg.specId || '-'}
                      </div>
                      <div>
                        <span className="font-medium">Image:</span> {sg.imageId || '-'}
                      </div>
                      <div>
                        <span className="font-medium">Region:</span> {sg.region || '-'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 추가 정보 */}
          {data.description && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Network className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <div className="font-medium mb-1">참고사항</div>
                  <div>{data.description}</div>
                </div>
              </div>
            </div>
          )}

          {/* 경고 메시지 */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-900 dark:text-yellow-100">
            <div className="font-medium mb-1">⚠️ 주의사항</div>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>이 비용은 예상치이며 실제 비용과 다를 수 있습니다.</li>
              <li>네트워크 트래픽, 스토리지 사용량 등 추가 비용이 발생할 수 있습니다.</li>
              <li>각 CSP의 과금 정책에 따라 비용이 달라질 수 있습니다.</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
