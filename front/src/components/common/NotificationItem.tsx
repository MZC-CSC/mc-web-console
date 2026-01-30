'use client';

import { Notification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';

/**
 * NotificationItem 컴포넌트
 *
 * 개별 알림 아이템 표시
 */

export interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const NOTIFICATION_CONFIG = {
  info: {
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/50',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  warning: {
    icon: AlertCircle,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/50',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50',
    borderColor: 'border-red-200 dark:border-red-800',
  },
};

export function NotificationItem({
  notification,
  onRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const config = NOTIFICATION_CONFIG[notification.type];
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.read) {
      onRead?.(notification.id);
    }
    onClick?.(notification);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notification.id);
  };

  const relativeTime = formatDistanceToNow(notification.timestamp, {
    addSuffix: true,
    locale: ko,
  });

  const content = (
    <div
      className={cn(
        'group relative flex gap-3 p-3 rounded-lg border transition-colors',
        config.borderColor,
        notification.read ? 'bg-background' : config.bgColor,
        notification.link || onClick ? 'cursor-pointer hover:bg-accent/50' : ''
      )}
      onClick={handleClick}
    >
      {/* 읽지 않음 표시 */}
      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r" />
      )}

      {/* 아이콘 */}
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={cn('h-5 w-5', config.iconColor)} />
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              'text-sm font-medium',
              !notification.read && 'font-semibold'
            )}
          >
            {notification.title}
          </h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{relativeTime}</span>
          {notification.link && (
            <>
              <span>•</span>
              <ExternalLink className="h-3 w-3" />
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
