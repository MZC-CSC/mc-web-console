'use client';

import { useState, useMemo, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Download, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * LogViewer 컴포넌트
 *
 * 로그 실시간 조회 및 검색
 * - react-virtuoso 기반 가상 스크롤링
 * - 로그 레벨별 색상 구분
 * - 검색/필터링
 * - 실시간 업데이트 (SSE)
 * - 자동 스크롤
 *
 * @example
 * <LogViewer
 *   logs={systemLogs}
 *   liveUpdate
 *   liveUpdateUrl="/api/logs/stream"
 *   showLevelFilter
 *   enableSearch
 * />
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  id: string;
  timestamp: Date | string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  source?: string; // hostname, service name
}

export interface LogViewerProps {
  /** 로그 엔트리 목록 */
  logs: LogEntry[];

  /** 실시간 업데이트 활성화 */
  liveUpdate?: boolean;

  /** 실시간 업데이트 URL (SSE) */
  liveUpdateUrl?: string;

  /** 로그 레벨 필터 옵션 표시 */
  showLevelFilter?: boolean;

  /** 검색 기능 활성화 */
  enableSearch?: boolean;

  /** 자동 스크롤 기본값 */
  defaultAutoScroll?: boolean;

  /** 다운로드 활성화 */
  enableDownload?: boolean;

  /** 높이 */
  height?: number;

  /** 로그 클릭 핸들러 */
  onLogClick?: (log: LogEntry) => void;

  /** 로딩 상태 */
  isLoading?: boolean;

  /** 추가 CSS 클래스 */
  className?: string;
}

const LOG_LEVEL_CONFIG: Record<LogLevel, { color: string; bgColor: string }> = {
  DEBUG: { color: 'text-gray-600', bgColor: 'bg-gray-50' },
  INFO: { color: 'text-blue-600', bgColor: 'bg-blue-50' },
  WARN: { color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  ERROR: { color: 'text-red-600', bgColor: 'bg-red-50' },
  FATAL: { color: 'text-red-900', bgColor: 'bg-red-100' },
};

export function LogViewer({
  logs,
  liveUpdate = false,
  liveUpdateUrl,
  showLevelFilter = true,
  enableSearch = true,
  defaultAutoScroll = true,
  enableDownload = true,
  height = 600,
  onLogClick,
  isLoading = false,
  className,
}: LogViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<Set<LogLevel>>(
    new Set(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'])
  );
  const [autoScroll, setAutoScroll] = useState(defaultAutoScroll);
  const [isPaused, setIsPaused] = useState(false);
  const [liveUpdateLogs, setLiveUpdateLogs] = useState<LogEntry[]>([]);

  // 실시간 업데이트 (SSE)
  useEffect(() => {
    if (!liveUpdate || !liveUpdateUrl || isPaused) return;

    const eventSource = new EventSource(liveUpdateUrl);

    eventSource.onmessage = (event) => {
      try {
        const newLog: LogEntry = JSON.parse(event.data);
        setLiveUpdateLogs((prev) => [...prev, newLog]);
      } catch (error) {
        console.error('Failed to parse log:', error);
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [liveUpdate, liveUpdateUrl, isPaused]);

  // 전체 로그 (기본 + 실시간)
  const allLogs = useMemo(() => {
    return [...logs, ...liveUpdateLogs];
  }, [logs, liveUpdateLogs]);

  // 필터링된 로그
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      // 레벨 필터
      if (!levelFilter.has(log.level)) return false;

      // 검색 쿼리
      if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [allLogs, levelFilter, searchQuery]);

  const toggleLevelFilter = (level: LogLevel) => {
    setLevelFilter((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  const handleDownload = () => {
    const content = filteredLogs
      .map((log) => {
        const timestamp = typeof log.timestamp === 'string' ? log.timestamp : log.timestamp.toISOString();
        return `[${timestamp}] [${log.level}] ${log.message}`;
      })
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>로그 뷰어</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>로그 뷰어</CardTitle>
          <div className="flex items-center gap-2">
            {liveUpdate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? '재개' : '일시정지'}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            )}
            {enableDownload && (
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                다운로드
              </Button>
            )}
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col gap-3 mt-4">
          {/* 검색 */}
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="로그 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {/* 레벨 필터 */}
          {showLevelFilter && (
            <div className="flex gap-2 flex-wrap">
              {(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'] as LogLevel[]).map((level) => (
                <label
                  key={level}
                  className="flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <Checkbox
                    checked={levelFilter.has(level)}
                    onCheckedChange={() => toggleLevelFilter(level)}
                  />
                  <Badge variant="outline" className={cn(LOG_LEVEL_CONFIG[level].color)}>
                    {level}
                  </Badge>
                </label>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div
          className="bg-background border rounded-md overflow-hidden font-mono text-xs"
          style={{ height }}
        >
          <Virtuoso
            data={filteredLogs}
            itemContent={(index, log) => (
              <LogLine
                log={log}
                searchQuery={searchQuery}
                onClick={() => onLogClick?.(log)}
              />
            )}
            followOutput={autoScroll ? 'smooth' : false}
          />
        </div>

        {/* 로그 개수 표시 */}
        <div className="mt-2 text-sm text-muted-foreground">
          총 {filteredLogs.length}개 로그
          {filteredLogs.length !== allLogs.length && ` (${allLogs.length}개 중 필터링됨)`}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * LogLine 컴포넌트 (단일 로그 라인)
 */
interface LogLineProps {
  log: LogEntry;
  searchQuery?: string;
  onClick?: () => void;
}

function LogLine({ log, searchQuery, onClick }: LogLineProps) {
  const config = LOG_LEVEL_CONFIG[log.level];
  const timestamp = typeof log.timestamp === 'string'
    ? new Date(log.timestamp)
    : log.timestamp;

  // 검색 하이라이팅
  const highlightedMessage = useMemo(() => {
    if (!searchQuery) return log.message;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return log.message.replace(regex, '<mark class="bg-yellow-200 text-black">$1</mark>');
  }, [log.message, searchQuery]);

  return (
    <div
      className={cn(
        'flex gap-3 px-3 py-2 border-b hover:bg-accent/50 cursor-pointer transition-colors',
        config.bgColor
      )}
      onClick={onClick}
    >
      <span className="text-muted-foreground shrink-0 min-w-[140px]">
        {timestamp.toLocaleString()}
      </span>
      <Badge
        variant="outline"
        className={cn('shrink-0 min-w-[60px] justify-center', config.color)}
      >
        {log.level}
      </Badge>
      <span
        className="flex-1 break-words"
        dangerouslySetInnerHTML={{ __html: highlightedMessage }}
      />
      {log.source && (
        <span className="text-muted-foreground text-xs shrink-0">[{log.source}]</span>
      )}
    </div>
  );
}
