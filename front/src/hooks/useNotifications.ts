'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Notification 타입 정의
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  metadata?: Record<string, any>;
}

export interface UseNotificationsOptions {
  /** 실시간 업데이트 활성화 */
  enableRealtime?: boolean;

  /** SSE 엔드포인트 URL */
  realtimeUrl?: string;

  /** 최대 알림 개수 */
  maxItems?: number;

  /** 로컬 스토리지 키 */
  storageKey?: string;
}

/**
 * useNotifications Hook
 *
 * 알림 상태 관리 및 실시간 업데이트
 *
 * @example
 * const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications({
 *   enableRealtime: true,
 *   realtimeUrl: '/api/notifications/stream',
 * });
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    enableRealtime = false,
    realtimeUrl,
    maxItems = 50,
    storageKey = 'notifications',
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 로컬 스토리지에서 알림 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Date 객체로 변환
        const restored = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(restored);
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
    }
  }, [storageKey]);

  // 로컬 스토리지에 저장
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }, [notifications, storageKey]);

  // 실시간 업데이트 (SSE)
  useEffect(() => {
    if (!enableRealtime || !realtimeUrl) return;

    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(realtimeUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const notification: Notification = {
            ...data,
            timestamp: new Date(data.timestamp || Date.now()),
            read: false,
          };

          setNotifications((prev) => {
            const newNotifications = [notification, ...prev];
            // maxItems 제한
            return newNotifications.slice(0, maxItems);
          });
        } catch (error) {
          console.error('Failed to parse notification:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource?.close();
      };
    } catch (error) {
      console.error('Failed to connect to SSE:', error);
    }

    return () => {
      eventSource?.close();
    };
  }, [enableRealtime, realtimeUrl, maxItems]);

  // 알림 추가
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => {
        const newNotifications = [newNotification, ...prev];
        return newNotifications.slice(0, maxItems);
      });

      return newNotification.id;
    },
    [maxItems]
  );

  // 읽음 표시
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // 전체 읽음 표시
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // 알림 삭제
  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // 전체 삭제
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // 읽지 않은 알림만 삭제
  const clearRead = useCallback(() => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  }, []);

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 타입별 알림 개수
  const countByType = {
    info: notifications.filter((n) => n.type === 'info').length,
    success: notifications.filter((n) => n.type === 'success').length,
    warning: notifications.filter((n) => n.type === 'warning').length,
    error: notifications.filter((n) => n.type === 'error').length,
  };

  return {
    notifications,
    unreadCount,
    countByType,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    clearRead,
  };
}
