'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Send, Copy, Check } from 'lucide-react';

/**
 * REST API Call Demo 페이지
 *
 * REST API 호출 데모 및 테스트
 * - API 엔드포인트 입력
 * - HTTP 메소드 선택
 * - 요청 본문 입력
 * - 응답 결과 표시
 */

interface APIResponse {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  timestamp: Date;
}

export default function APICallDemoPage() {
  const [method, setMethod] = useState<string>('GET');
  const [url, setUrl] = useState<string>('https://jsonplaceholder.typicode.com/posts/1');
  const [body, setBody] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleCall = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method !== 'GET' && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const data = await res.json();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
        headers: Object.fromEntries(res.headers.entries()),
        timestamp: new Date(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to call API');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const presetAPIs = [
    { label: 'GET Post', url: 'https://jsonplaceholder.typicode.com/posts/1', method: 'GET' },
    { label: 'GET Users', url: 'https://jsonplaceholder.typicode.com/users', method: 'GET' },
    { label: 'POST Create', url: 'https://jsonplaceholder.typicode.com/posts', method: 'POST', body: '{\n  "title": "Test Post",\n  "body": "This is a test",\n  "userId": 1\n}' },
  ];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">REST API Call Demo</h1>
          <Badge variant="secondary">DEMO</Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          REST API 호출 데모 및 테스트 페이지
        </p>
      </div>

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {presetAPIs.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setMethod(preset.method);
                  setUrl(preset.url);
                  setBody(preset.body || '');
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Request 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>Request Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="method">HTTP Method</Label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">API Endpoint URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
            />
          </div>

          {method !== 'GET' && (
            <div className="space-y-2">
              <Label htmlFor="body">Request Body (JSON)</Label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{\n  "key": "value"\n}'
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
              />
            </div>
          )}

          <Button onClick={handleCall} disabled={loading || !url} className="w-full">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Calling...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-destructive">{error}</pre>
          </CardContent>
        </Card>
      )}

      {/* Response */}
      {response && (
        <>
          {/* Response Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Response</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={response.status < 400 ? 'default' : 'destructive'}
                  >
                    {response.status} {response.statusText}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {response.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Response Headers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Response Headers</Label>
                </div>
                <div className="bg-muted p-3 rounded-md text-xs font-mono space-y-1 max-h-32 overflow-auto">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-muted-foreground">{key}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Body */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Response Body</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyResponse}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-md text-xs font-mono overflow-auto max-h-96">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Demo 안내 */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>Demo Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>테스트 API:</strong> JSONPlaceholder (https://jsonplaceholder.typicode.com)를 사용합니다.
            </p>
            <p>
              <strong>CORS:</strong> 브라우저의 CORS 정책으로 인해 일부 API는 호출이 제한될 수 있습니다.
            </p>
            <p>
              <strong>메소드:</strong> GET, POST, PUT, PATCH, DELETE 메소드를 테스트할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
