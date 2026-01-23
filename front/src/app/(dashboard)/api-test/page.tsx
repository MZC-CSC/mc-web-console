'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { apiPost, apiPostByPath } from '@/lib/api/client';
import { ApiRequest, ApiResponse } from '@/types/common';
import { apiClient } from '@/lib/api/client';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';

type CallMode = 'operationId' | 'direct';

interface ServiceInfo {
  Version?: string;
  version?: string;
  BaseURL?: string;
  baseUrl?: string;
  Auth?: {
    Type?: string;
    type?: string;
    Username?: string;
    username?: string;
    Password?: string;
    password?: string;
  };
  auth?: {
    Type?: string;
    type?: string;
    Username?: string;
    username?: string;
    Password?: string;
    password?: string;
  };
  operations?: Record<string, {
    method: string;
    resourcePath: string;
    description?: string;
  }>;
}

interface HealthCheckStatus {
  status: 'healthy' | 'unhealthy' | 'loading' | 'unknown';
  endpoint: string;
  responseTime?: number;
  statusCode?: number;
  lastChecked?: Date;
  error?: string;
}

export default function ApiTestPage() {
  // 호출 모드
  const [callMode, setCallMode] = useState<CallMode>('operationId');
  
  // 서비스 및 operationId 목록
  const [services, setServices] = useState<Record<string, ServiceInfo>>({});
  const [serviceList, setServiceList] = useState<string[]>([]);
  
  // 모드 1: operationId 기반
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [selectedOperationId, setSelectedOperationId] = useState<string>('');
  const [expandedFrameworks, setExpandedFrameworks] = useState<Set<string>>(new Set());
  
  // 모드 2: 직접 endpoint 지정
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [endpoint, setEndpoint] = useState<string>('');
  const [httpMethod, setHttpMethod] = useState<string>('POST');
  const [targetAuthToken, setTargetAuthToken] = useState<string>('');
  
  // 공통
  const [parameters, setParameters] = useState<string>('{}');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Health Check
  const [healthCheckStatuses, setHealthCheckStatuses] = useState<Record<string, HealthCheckStatus>>({});
  const [healthCheckLoading, setHealthCheckLoading] = useState<boolean>(false);
  const [readyzPaths, setReadyzPaths] = useState<Record<string, string>>({});

  // operationId 선택 핸들러
  const handleOperationIdSelect = (framework: string, opId: string) => {
    setSelectedFramework(framework);
    setSelectedOperationId(opId);
    // 선택한 framework가 접혀있으면 펼치기
    if (!expandedFrameworks.has(framework)) {
      setExpandedFrameworks(prev => new Set(prev).add(framework));
    }
  };

  // Framework 아코디언 토글 핸들러
  const toggleFramework = (framework: string, open: boolean) => {
    setExpandedFrameworks(prev => {
      const newSet = new Set(prev);
      if (open) {
        newSet.add(framework);
      } else {
        newSet.delete(framework);
      }
      return newSet;
    });
  };

  // 서비스 및 operationId 목록 조회
  useEffect(() => {
    const loadServicesAndActions = async () => {
      try {
        // Backend의 /api/listservicesandactions 엔드포인트를 호출하면
        // MCIAM_USE 설정에 따라 자동으로 적절한 subsystem의 ListServicesAndActions를 호출함
        const response = await apiClient.post<ApiResponse<{
          Services: Record<string, ServiceInfo>;
          ServiceActions: Record<string, Record<string, {
            method: string;
            resourcePath: string;
            description?: string;
          }>>;
        }>>(
          '/api/listservicesandactions',
          {}
        );
        if (response.data.responseData) {
          const data = response.data.responseData;
          
          // responseData.Services에서 Services 데이터 추출
          // 응답 구조: { responseData: { Services: {...}, ServiceActions: {...} } }
          if (data.Services) {
            // ServiceActions를 각 framework의 operations에 병합
            const servicesWithOperations: Record<string, ServiceInfo> = {};
            const frameworkList = Object.keys(data.Services);
            
            frameworkList.forEach((framework) => {
              const service = data.Services[framework];
              const serviceActions = data.ServiceActions?.[framework] || {};
              servicesWithOperations[framework] = {
                ...service,
                operations: serviceActions as Record<string, {
                  method: string;
                  resourcePath: string;
                  description?: string;
                }>,
              };
            });
            
            setServices(servicesWithOperations);
            setServiceList(frameworkList);
            
            // 각 framework의 readyz 경로 기본값 설정 (baseurl + /readyz 전체 경로)
            const defaultPaths: Record<string, string> = {};
            frameworkList.forEach((framework) => {
              const service = data.Services[framework];
              const baseUrl = service?.baseUrl || service?.BaseURL || '';
              // baseurl + /readyz 전체 경로를 기본값으로 설정
              defaultPaths[framework] = baseUrl ? `${baseUrl}/readyz` : '/readyz';
            });
            setReadyzPaths(defaultPaths);
          } else {
            console.warn('Services data not found in response');
            setServices({});
            setServiceList([]);
          }
        }
      } catch (error) {
        console.error('Failed to load services and actions:', error);
        setError('서비스 목록을 불러오는데 실패했습니다.');
      }
    };
    loadServicesAndActions();
  }, []);


  // Health Check 함수
  const checkHealth = async (frameworkName?: string) => {
    const frameworksToCheck = frameworkName 
      ? [frameworkName] 
      : serviceList;
    
    setHealthCheckLoading(true);
    
    // 모든 framework의 상태를 loading으로 설정
    frameworksToCheck.forEach((framework) => {
      const readyzPath = readyzPaths[framework] || '/readyz';
      setHealthCheckStatuses(prev => ({
        ...prev,
        [framework]: {
          status: 'loading',
          endpoint: readyzPath,
        }
      }));
    });
    
    // 병렬로 health check 실행
    const healthCheckPromises = frameworksToCheck.map(async (framework) => {
      const service = services[framework];
      if (!service) return;
      
      try {
        const startTime = Date.now();
        // BaseURL 추출 (대소문자 구분 없이)
        const baseUrl = service.baseUrl || service.BaseURL || '';
        if (!baseUrl) return;
        
        // Health check endpoint 호출: inputbox에 있는 값 그대로 사용
        const inputValue = readyzPaths[framework] || (baseUrl ? `${baseUrl}/readyz` : '/readyz');
        
        let targetUrl = baseUrl;
        let healthEndpoint = '/readyz';
        
        // inputbox의 값이 전체 URL인지 경로만인지 확인
        if (inputValue.startsWith('http://') || inputValue.startsWith('https://')) {
          // 전체 URL인 경우: URL을 파싱하여 targetUrl과 endpoint 분리
          try {
            const url = new URL(inputValue);
            targetUrl = `${url.protocol}//${url.host}`;
            healthEndpoint = url.pathname || '/readyz';
          } catch {
            // URL 파싱 실패 시 기본값 사용
            targetUrl = baseUrl;
            healthEndpoint = '/readyz';
          }
        } else {
          // 경로만 있는 경우: 기존 baseurl 사용
          targetUrl = baseUrl;
          healthEndpoint = inputValue.startsWith('/') ? inputValue : `/${inputValue}`;
        }
        
        // Backend의 direct-call API를 사용하여 health check
        const response = await apiClient.post<ApiResponse>('/api/direct-call', {
          targetUrl: targetUrl,
          endpoint: healthEndpoint,
          method: 'GET',
          targetAuthToken: undefined, // Health check는 일반적으로 auth 불필요
          parameters: {},
        });
        
        const responseTime = Date.now() - startTime;
        const isHealthy = response.data.status?.code >= 200 && response.data.status?.code < 300;
        
        setHealthCheckStatuses(prev => ({
          ...prev,
          [framework]: {
            status: isHealthy ? 'healthy' : 'unhealthy',
            endpoint: healthEndpoint,
            responseTime,
            statusCode: response.data.status?.code,
            lastChecked: new Date(),
            error: isHealthy ? undefined : `HTTP ${response.data.status?.code}`,
          }
        }));
      } catch (error) {
        const inputValue = readyzPaths[framework] || '/readyz';
        setHealthCheckStatuses(prev => ({
          ...prev,
          [framework]: {
            status: 'unhealthy',
            endpoint: inputValue,
            lastChecked: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }));
      }
    });
    
    await Promise.all(healthCheckPromises);
    setHealthCheckLoading(false);
  };

  // API 호출 함수
  const handleApiCall = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Parameter JSON 파싱
      let parsedParams: ApiRequest = {};
      if (parameters.trim()) {
        try {
          parsedParams = JSON.parse(parameters);
        } catch (parseError) {
          throw new Error('Parameter JSON 형식이 올바르지 않습니다.');
        }
      }

      if (callMode === 'operationId') {
        // 모드 1: operationId 기반 호출
        if (!selectedOperationId.trim()) {
          throw new Error('OperationId를 선택해주세요.');
        }

        if (!selectedFramework.trim()) {
          throw new Error('Framework를 선택해주세요.');
        }

        // subsystemName과 함께 호출
        const response = await apiPostByPath(
          `/api/${selectedFramework}/${selectedOperationId}`,
          selectedOperationId,
          parsedParams
        );

        setResult(response);
      } else {
        // 모드 2: 직접 endpoint 지정 호출
        if (!targetUrl.trim()) {
          throw new Error('대상 서비스 URL을 입력해주세요.');
        }
        if (!endpoint.trim()) {
          throw new Error('Endpoint를 입력해주세요.');
        }

        const directCallResponse = await apiClient.post<ApiResponse>('/api/direct-call', {
          targetUrl: targetUrl.trim(),
          endpoint: endpoint.trim(),
          method: httpMethod,
          targetAuthToken: targetAuthToken.trim() || undefined,
          parameters: parsedParams,
        });

        setResult(directCallResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'API 호출에 실패했습니다.');
      console.error('API call error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusIcon = (status: HealthCheckStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  const getHealthStatusText = (status: HealthCheckStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'unhealthy':
        return 'Unhealthy';
      case 'loading':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">API 호출 테스트</h1>
        <p className="text-muted-foreground">
          Backend API를 테스트하고 각 framework의 health check 상태를 확인할 수 있습니다.
        </p>
      </div>

      {/* Health Check 섹션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Health Check</CardTitle>
              <CardDescription>
                각 framework의 health check 상태를 확인합니다.
              </CardDescription>
            </div>
            <Button
              onClick={() => checkHealth()}
              disabled={healthCheckLoading || serviceList.length === 0}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${healthCheckLoading ? 'animate-spin' : ''}`} />
              전체 Health Check
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {serviceList.length === 0 ? (
            <p className="text-muted-foreground text-sm">서비스 목록을 불러오는 중...</p>
          ) : (
            <div className="space-y-2">
              {serviceList.map((framework) => {
                const service = services[framework];
                const readyzPath = readyzPaths[framework] || '/readyz';
                const status = healthCheckStatuses[framework] || { status: 'unknown' as const, endpoint: readyzPath };
                if (!service) return null;
                
                // BaseURL 추출 (대소문자 구분 없이)
                const baseUrl = service.baseUrl || service.BaseURL || '';
                // Auth Type 추출 (대소문자 구분 없이)
                const authType = service.auth?.type || service.auth?.Type || service.Auth?.Type || 'none';
                
                // readyzPath는 사용자가 입력한 값 그대로 사용 (전체 URL이거나 경로일 수 있음)
                // 기본값이 없으면 baseurl + /readyz로 설정
                const readyzUrl = readyzPath || (baseUrl ? `${baseUrl}/readyz` : '/readyz');
                
                return (
                  <div
                    key={framework}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getHealthStatusIcon(status.status)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-base">framework: </span>
                          <span className="font-semibold">{framework}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">baseurl: </span>
                          <code className="text-xs bg-background px-1.5 py-0.5 rounded">{baseUrl}</code>
                        </div>
                        <div className="text-sm flex items-center gap-2">
                          <span className="font-medium">readyz: </span>
                          <Input
                            value={readyzUrl}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              // 사용자가 입력한 값을 그대로 저장 (전체 URL이거나 경로)
                              setReadyzPaths(prev => ({
                                ...prev,
                                [framework]: inputValue || (baseUrl ? `${baseUrl}/readyz` : '/readyz')
                              }));
                            }}
                            className="h-7 w-80 text-xs font-mono"
                            placeholder={`${baseUrl}/readyz`}
                          />
                          {status.status !== 'unknown' && (
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              status.status === 'healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              status.status === 'unhealthy' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                              status.status === 'loading' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {getHealthStatusText(status.status)}
                            </span>
                          )}
                          {status.responseTime && (
                            <span className="text-xs">({status.responseTime}ms)</span>
                          )}
                          {status.statusCode && (
                            <span className="text-xs">HTTP {status.statusCode}</span>
                          )}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">auth: </span>
                          <span>{authType}</span>
                        </div>
                        {status.error && (
                          <div className="text-sm text-red-500 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                            {status.error}
                          </div>
                        )}
                        {status.lastChecked && (
                          <div className="text-xs text-muted-foreground mt-2">
                            마지막 체크: {status.lastChecked.toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => checkHealth(framework)}
                      disabled={status.status === 'loading'}
                      className="ml-4"
                    >
                      {status.status === 'loading' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API 호출 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>API 호출</CardTitle>
          <CardDescription>
            operationId 기반 또는 직접 endpoint 지정 방식으로 API를 호출할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 호출 모드 선택 */}
          <div className="space-y-2">
            <Label>호출 모드</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="callMode"
                  value="operationId"
                  checked={callMode === 'operationId'}
                  onChange={(e) => setCallMode(e.target.value as CallMode)}
                  className="w-4 h-4"
                />
                <span>operationId 기반</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="callMode"
                  value="direct"
                  checked={callMode === 'direct'}
                  onChange={(e) => setCallMode(e.target.value as CallMode)}
                  className="w-4 h-4"
                />
                <span>직접 endpoint 지정</span>
              </label>
            </div>
          </div>

          {/* 모드 1: operationId 기반 - Framework별 operationId 목록 */}
          {callMode === 'operationId' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>ServiceActions</Label>
                <div className="space-y-2 border rounded-lg p-4 max-h-96 overflow-y-auto">
                  {serviceList.map((framework) => {
                    const service = services[framework];
                    const operations = service?.operations || {};
                    const operationIds = Object.keys(operations);
                    
                    if (operationIds.length === 0) return null;
                    
                    const isExpanded = expandedFrameworks.has(framework);
                    
                    return (
                      <Collapsible
                        key={framework}
                        open={isExpanded}
                        onOpenChange={(open) => toggleFramework(framework, open)}
                      >
                        <CollapsibleTrigger asChild>
                          <button
                            type="button"
                            className="w-full flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="font-medium text-sm">{framework}</span>
                              <span className="text-xs text-muted-foreground">
                                ({operationIds.length} APIs)
                              </span>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-6 pt-2 pb-2">
                            <div className="space-y-2">
                              {operationIds.map((opId) => {
                                const operation = operations[opId];
                                const isSelected = selectedFramework === framework && selectedOperationId === opId;
                                
                                return (
                                  <button
                                    key={opId}
                                    type="button"
                                    onClick={() => handleOperationIdSelect(framework, opId)}
                                    className={`w-full p-3 text-left border rounded-md hover:bg-muted transition-colors ${
                                      isSelected ? 'border-primary bg-primary/5' : ''
                                    }`}
                                  >
                                    <div className="font-medium text-sm">{opId}</div>
                                    {operation && operation.method && operation.resourcePath && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        <span className="px-1.5 py-0.5 bg-background rounded mr-1">
                                          {operation.method.toUpperCase()}
                                        </span>
                                        <code className="text-xs">{operation.resourcePath}</code>
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </div>

              {/* 선택된 API 정보 - 편집 가능 */}
              <div className="space-y-2 p-4 bg-muted rounded-md">
                <div className="font-medium mb-3">선택된 API 정보</div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="subsystem-input">Subsystem</Label>
                    <Input
                      id="subsystem-input"
                      value={selectedFramework}
                      onChange={(e) => setSelectedFramework(e.target.value)}
                      placeholder="예: mc-iam-manager"
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operationId-input">OperationId</Label>
                    <Input
                      id="operationId-input"
                      value={selectedOperationId}
                      onChange={(e) => setSelectedOperationId(e.target.value)}
                      placeholder="예: listWorkspaceProjects"
                      className="font-mono text-sm"
                    />
                  </div>
                  {selectedFramework && selectedOperationId && (() => {
                    const selectedOperation = services[selectedFramework]?.operations?.[selectedOperationId];
                    if (!selectedOperation) return null;
                    
                    return (
                      <div className="space-y-1 text-sm pt-2 border-t">
                        {selectedOperation.method && (
                          <div>
                            <span className="font-medium">Method: </span>
                            <span className="px-1.5 py-0.5 bg-background rounded text-xs">
                              {selectedOperation.method.toUpperCase()}
                            </span>
                          </div>
                        )}
                        {selectedOperation.resourcePath && (
                          <div>
                            <span className="font-medium">Resource Path: </span>
                            <code className="text-xs bg-background px-1.5 py-0.5 rounded">
                              {selectedOperation.resourcePath}
                            </code>
                          </div>
                        )}
                        {selectedOperation.description && (
                          <div>
                            <span className="font-medium">Description: </span>
                            <span className="text-xs">
                              {selectedOperation.description}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* 모드 2: 직접 endpoint 지정 */}
          {callMode === 'direct' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetUrl">대상 서비스 URL *</Label>
                <Input
                  id="targetUrl"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="http://localhost:4000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint/Path *</Label>
                <Input
                  id="endpoint"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="/api/users/list"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="httpMethod">HTTP 메소드</Label>
                <Select value={httpMethod} onValueChange={setHttpMethod}>
                  <SelectTrigger id="httpMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAuthToken">대상 서비스 Auth Token (선택사항)</Label>
                <Input
                  id="targetAuthToken"
                  type="password"
                  value={targetAuthToken}
                  onChange={(e) => setTargetAuthToken(e.target.value)}
                  placeholder="Bearer token 또는 Basic auth"
                />
              </div>
            </div>
          )}

          {/* Parameter 입력 */}
          <div className="space-y-2">
            <Label htmlFor="parameters">Parameter (JSON)</Label>
            <Textarea
              id="parameters"
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              placeholder='{"pathParams": {}, "queryParams": {}, "request": {}}'
              rows={8}
              className="font-mono text-sm"
            />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                pathParams, queryParams, request를 포함한 JSON 형식으로 입력하세요.
              </p>
              {callMode === 'operationId' && selectedFramework && selectedOperationId && (() => {
                const selectedOperation = services[selectedFramework]?.operations?.[selectedOperationId];
                if (!selectedOperation?.resourcePath) return null;
                
                // resourcePath에서 path parameter 추출 (예: {workflowIdx})
                const pathParamMatches = selectedOperation.resourcePath.match(/\{([^}]+)\}/g);
                if (!pathParamMatches || pathParamMatches.length === 0) return null;
                
                const pathParams = pathParamMatches.map(match => match.slice(1, -1)); // {workflowIdx} -> workflowIdx
                
                return (
                  <div className="text-xs bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-2">
                    <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                      필요한 Path Parameters:
                    </div>
                    <div className="space-y-1">
                      {pathParams.map((param) => (
                        <div key={param} className="text-blue-700 dark:text-blue-300">
                          • <code className="text-xs bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">{param}</code>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-blue-600 dark:text-blue-400">
                      예시: <code className="text-xs bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">
                        {`{"pathParams": {${pathParams.map(p => `"${p}": "값"`).join(', ')}}, "queryParams": {}, "request": {}}`}
                      </code>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 호출 버튼 */}
          <Button
            onClick={handleApiCall}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                호출 중...
              </>
            ) : (
              'API 호출'
            )}
          </Button>

          {/* 에러 표시 */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800 dark:text-red-200">에러</div>
                  <div className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* 결과 표시 */}
          {result && (
            <div className="space-y-2">
              <Label>응답 결과</Label>
              <div className="p-4 bg-muted rounded-md">
                <div className="mb-2">
                  <span className="text-sm font-medium">Status: </span>
                  <span className={`text-sm ${
                    result.status?.code >= 200 && result.status?.code < 300
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {result.status?.code} {result.status?.message}
                  </span>
                </div>
                <pre className="text-xs overflow-auto max-h-96 bg-background p-3 rounded border">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
