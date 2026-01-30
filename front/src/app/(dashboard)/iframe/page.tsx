'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * IFrame 통합 페이지
 *
 * 외부 도구 및 서비스 통합
 * - IFrame URL 설정
 * - 외부 페이지 로드
 * - 새 창으로 열기
 */

const PRESET_URLS = [
  { label: 'Grafana Dashboard', url: 'https://grafana.com/docs/' },
  { label: 'Prometheus', url: 'https://prometheus.io/' },
  { label: 'Kibana', url: 'https://www.elastic.co/kibana' },
  { label: 'Custom URL', url: '' },
];

export default function IFramePage() {
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleLoad = () => {
    setError('');
    if (!inputUrl) {
      setError('Please enter a URL');
      return;
    }

    try {
      new URL(inputUrl);
      setLoading(true);
      setIframeUrl(inputUrl);
    } catch (e) {
      setError('Invalid URL format');
    }
  };

  const handleIFrameLoad = () => {
    setLoading(false);
  };

  const handleIFrameError = () => {
    setLoading(false);
    setError('Failed to load the URL. The site may not allow embedding.');
  };

  const handlePresetSelect = (url: string) => {
    setInputUrl(url);
    if (url) {
      setIframeUrl(url);
    }
  };

  const handleOpenExternal = () => {
    if (iframeUrl) {
      window.open(iframeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRefresh = () => {
    if (iframeUrl) {
      setLoading(true);
      setIframeUrl('');
      setTimeout(() => setIframeUrl(inputUrl), 100);
    }
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">External Tools</h1>
        <p className="text-muted-foreground mt-2">
          외부 도구 및 서비스를 통합하여 사용합니다
        </p>
      </div>

      {/* URL 입력 */}
      <Card>
        <CardHeader>
          <CardTitle>IFrame Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset URLs */}
          <div className="space-y-2">
            <Label>Quick Access</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_URLS.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSelect(preset.url)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom URL Input */}
          <div className="space-y-2">
            <Label htmlFor="iframeUrl">External URL</Label>
            <div className="flex gap-2">
              <Input
                id="iframeUrl"
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
              />
              <Button onClick={handleLoad} disabled={loading}>
                Load
              </Button>
              {iframeUrl && (
                <>
                  <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="outline" onClick={handleOpenExternal}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription className="text-xs">
              ⚠️ Note: Some websites may block embedding due to security policies (X-Frame-Options).
              If the page doesn't load, try opening it in a new window.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* IFrame Content */}
      {iframeUrl && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>External Content</CardTitle>
              <div className="text-sm text-muted-foreground font-mono truncate max-w-md">
                {iframeUrl}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative border rounded-lg overflow-hidden bg-muted">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              )}
              <iframe
                src={iframeUrl}
                className="w-full"
                style={{ height: '700px' }}
                title="External Content"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                onLoad={handleIFrameLoad}
                onError={handleIFrameError}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!iframeUrl && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center py-12">
              <ExternalLink className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Content Loaded</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Enter a URL above to load external content, or select a quick access preset.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
