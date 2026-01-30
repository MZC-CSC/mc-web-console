'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { cn } from '@/lib/utils';

/**
 * NotificationCenter 컴포넌트
 *
 * 실시간 알림 센터
 * - 알림 목록 표시 (읽음/안읽음 구분)
 * - 실시간 알림 수신 (SSE)
 * - 알림 읽음 처리
 * - 전체 삭제 / 개별 삭제
 *
 * @example
 * <NotificationCenter
 *   enableRealtime
 *   realtimeUrl="/api/notifications/stream"
 *   onNotificationClick={(notification) => router.push(notification.link)}
 * />
 */

export interface NotificationCenterProps {
  /** 최대 표시 알림 개수 */
  maxItems?: number;

  /** 실시간 업데이트 활성화 */
  enableRealtime?: boolean;

  /** 실시간 업데이트 URL (SSE) */
  realtimeUrl?: string;

  /** 알림 클릭 핸들러 */
  onNotificationClick?: (notification: Notification) => void;

  /** 추가 CSS 클래스 */
  className?: string;
}

export function NotificationCenter({
  maxItems = 50,
  enableRealtime = false,
  realtimeUrl,
  onNotificationClick,
  className,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    clearRead,
  } = useNotifications({
    enableRealtime,
    realtimeUrl,
    maxItems,
  });

  const displayNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    onNotificationClick?.(notification);

    if (notification.link) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="flex flex-col h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-lg">알림</h3>
            <div className="flex items-center gap-2">
              {activeTab === 'all' && notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  title="전체 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {activeTab === 'all' && unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  title="전체 읽음 표시"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              {activeTab === 'unread' && unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  title="전체 읽음 표시"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
            <div className="px-4 pt-2">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="all">
                  전체 ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  읽지 않음 ({unreadCount})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="flex-1 mt-0 p-0">
              <NotificationList
                notifications={displayNotifications}
                onNotificationClick={handleNotificationClick}
                onDelete={deleteNotification}
                onRead={markAsRead}
              />
            </TabsContent>

            <TabsContent value="unread" className="flex-1 mt-0 p-0">
              <NotificationList
                notifications={displayNotifications}
                onNotificationClick={handleNotificationClick}
                onDelete={deleteNotification}
                onRead={markAsRead}
              />
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * NotificationList 내부 컴포넌트
 */
interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onDelete: (id: string) => void;
  onRead: (id: string) => void;
}

function NotificationList({
  notifications,
  onNotificationClick,
  onDelete,
  onRead,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          알림이 없습니다
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={onNotificationClick}
            onDelete={onDelete}
            onRead={onRead}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
