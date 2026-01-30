'use client';

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MciInfo } from '@/types/mci-workloads';
import { MCIVMList } from './MCIVMList';
import { MCISubGroupList } from './MCISubGroupList';
import { MCIPolicyList } from './MCIPolicyList';

export type MCIDetailTab = 'default' | 'group' | 'policy' | 'labels';

/**
 * Tab 항목 정의
 */
export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

/**
 * 재사용 가능한 Tab 컴포넌트 Props
 */
export interface ReusableTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  tabsListClassName?: string;
  tabsContentClassName?: string;
}

/**
 * 재사용 가능한 Tab 컴포넌트
 * 
 * 특징:
 * - 다른 곳에서도 사용 가능
 * - 한 화면에서 여러 개의 Tab 인스턴스 동시 사용 가능
 * - 제어/비제어 모드 지원
 * 
 * @example
 * ```tsx
 * <ReusableTabs
 *   tabs={[
 *     { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
 *     { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
 *   ]}
 *   defaultValue="tab1"
 * />
 * ```
 */
export function ReusableTabs({
  tabs,
  defaultValue,
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  className,
  tabsListClassName,
  tabsContentClassName,
}: ReusableTabsProps) {
  // 내부 상태 관리 (비제어 모드)
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue || tabs[0]?.id || ''
  );

  // 제어/비제어 모드 처리
  const isControlled = controlledValue !== undefined && controlledOnValueChange !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    if (isControlled) {
      controlledOnValueChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <Tabs value={value} onValueChange={handleValueChange} className={className}>
      <TabsList className={tabsListClassName}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className={tabsContentClassName}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/**
 * MCI 상세 정보 Tab 컴포넌트 Props
 */
interface MCIDetailTabsProps {
  mciDetail: MciInfo | undefined;
  mciId: string;
  nsId: string;
  activeTab?: MCIDetailTab;
  onTabChange?: (tab: MCIDetailTab) => void;
}

/**
 * MCI 상세 정보 Tab 컴포넌트
 * 
 * ReusableTabs를 사용하여 구현된 MCI 전용 Tab 컴포넌트
 * 
 * Tab 목록:
 * - Default: VM List (모든 VM 목록과 상태)
 * - Group: SubGroup 목록과 상태
 * - Policy: Sale Policy 정의된 목록
 * - Labels: 정의된 라벨들
 */
export function MCIDetailTabs({
  mciDetail,
  mciId,
  nsId,
  activeTab: controlledActiveTab,
  onTabChange: controlledOnTabChange,
}: MCIDetailTabsProps) {
  // 선택된 SubGroup 상태 관리 (Group Tab 전용)
  const [selectedSubGroupId, setSelectedSubGroupId] = useState<string | null>(null);

  // 선택된 SubGroup의 VM 목록 가져오기
  const getSelectedSubGroupVms = () => {
    if (!selectedSubGroupId || !mciDetail?.vm) {
      return [];
    }
    return mciDetail.vm.filter((vm) => vm.subGroupId === selectedSubGroupId);
  };

  // Tab 항목 정의
  const tabs: TabItem[] = [
    {
      id: 'default',
      label: 'Default',
      content: (
        <div className="space-y-4">
          {/* VM List Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">VM List / Status [{mciId}]</h3>
              {mciDetail?.vm && (
                <p className="text-sm text-muted-foreground mt-1">
                  Server({mciDetail.vm.length})
                </p>
              )}
            </div>
          </div>

          {/* VM List */}
          <MCIVMList
            vms={mciDetail?.vm || []}
            onVmClick={(vm) => {
              // TODO: VM 상세 정보 표시 기능 구현
              console.log('VM clicked:', vm.id);
            }}
          />
        </div>
      ),
    },
    {
      id: 'group',
      label: 'Group',
      content: (
        <div className="space-y-6">
          {/* 상단 영역: SubGroup List / Status */}
          <div className="space-y-4">
            {/* SubGroup List Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">SubGroup List / Status [{mciId}]</h3>
                {mciDetail?.vm && (
                  <p className="text-sm text-muted-foreground mt-1">
                    SubGroup({groupVmsBySubGroup(mciDetail.vm).length})
                  </p>
                )}
              </div>
            </div>

            {/* SubGroup List */}
            <MCISubGroupList
              vms={mciDetail?.vm || []}
              selectedSubGroupId={selectedSubGroupId}
              onSubGroupClick={(subGroupId) => {
                // 선택된 SubGroup 업데이트 (같은 SubGroup 클릭 시 선택 해제)
                setSelectedSubGroupId(
                  selectedSubGroupId === subGroupId ? null : subGroupId
                );
              }}
            />
          </div>

          {/* 하단 영역: Server List / Status */}
          {selectedSubGroupId && (
            <div className="space-y-4 border-t pt-6">
              {/* Server List Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Server List / Status</h3>
                  {getSelectedSubGroupVms().length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Server({getSelectedSubGroupVms().length})
                    </p>
                  )}
                </div>
              </div>

              {/* 선택된 SubGroup의 VM List */}
              <MCIVMList
                vms={getSelectedSubGroupVms()}
                onVmClick={(vm) => {
                  // TODO: VM 상세 정보 표시 기능 구현
                  console.log('VM clicked in SubGroup:', vm.id);
                }}
              />
            </div>
          )}

          {/* SubGroup이 선택되지 않은 경우 안내 메시지 */}
          {!selectedSubGroupId && (
            <div className="text-center py-12 text-sm text-muted-foreground border-t">
              SubGroup을 선택하면 해당 SubGroup의 VM 목록이 표시됩니다.
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'policy',
      label: 'Policy',
      content: (
        <MCIPolicyList
          mciId={mciId}
          mciName={mciDetail?.name}
          nsId={nsId}
        />
      ),
    },
    {
      id: 'labels',
      label: 'Labels',
      content: (
        <div className="text-sm text-muted-foreground">
          Labels 목록 내용은 Step 6에서 구현됩니다.
          {mciDetail?.label && Object.keys(mciDetail.label).length > 0 && (
            <div className="mt-2">
              총 {Object.keys(mciDetail.label).length}개의 라벨이 있습니다.
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <ReusableTabs
      tabs={tabs}
      defaultValue="default"
      value={controlledActiveTab}
      onValueChange={(value) => controlledOnTabChange?.(value as MCIDetailTab)}
      className="w-full"
      tabsListClassName="grid w-full grid-cols-4"
      tabsContentClassName="mt-4"
    />
  );
}

/**
 * VM을 SubGroup별로 그룹핑하는 헬퍼 함수
 * MCISubGroupList와 동일한 로직 사용
 */
function groupVmsBySubGroup(vms: MciInfo['vm']): Array<{ subGroupId: string; vms: MciInfo['vm'] }> {
  if (!vms || vms.length === 0) {
    return [];
  }

  const grouped = vms.reduce((acc, vm) => {
    const key = vm.subGroupId || '(No SubGroup)';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(vm);
    return acc;
  }, {} as Record<string, MciInfo['vm']>);

  return Object.entries(grouped).map(([subGroupId, vms]) => ({
    subGroupId,
    vms,
  }));
}
