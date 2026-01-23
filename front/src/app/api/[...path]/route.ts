import { NextRequest, NextResponse } from 'next/server';

/**
 * Backend API Base URL
 * Buffalo 서버의 주소
 * 환경 변수 NEXT_PUBLIC_API_BASE_URL이 필수로 설정되어야 합니다.
 */
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BACKEND_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required. Please set it in .env.local');
}

/**
 * API 프록시 핸들러 (모든 HTTP 메소드 지원)
 * /api/* 경로로 들어오는 모든 요청을 백엔드 서버로 전달
 */
async function handleRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const pathname = path.join('/');
    
    // 백엔드 URL 구성
    const backendUrl = `${BACKEND_URL}/api/${pathname}`;
    
    console.log(`[API Proxy] Proxying ${request.method} /api/${pathname} -> ${backendUrl}`);
    
    // 요청 헤더 복사
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Host 헤더는 제외 (백엔드 서버의 Host로 자동 설정됨)
      if (key.toLowerCase() !== 'host') {
        headers.set(key, value);
      }
    });
    
    // 요청 본문 가져오기
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.text();
        console.log(`[API Proxy] Request body:`, body);
      } catch (error) {
        console.error('Failed to read request body:', error);
      }
    }
    
    // 백엔드로 요청 전달
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
    });
    
    // 응답 헤더 복사
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
    
    // 응답 본문 가져오기
    const responseBody = await response.text();
    
    console.log(`[API Proxy] Response status: ${response.status}`);
    console.log(`[API Proxy] Response body length: ${responseBody.length}`);
    
    // 응답 본문이 비어있으면 에러 로깅 및 빈 JSON 반환
    if (!responseBody || responseBody.length === 0) {
      console.error(`[API Proxy] Empty response body for ${pathname}`);
      console.error(`[API Proxy] Response headers:`, Object.fromEntries(response.headers.entries()));
      
      // 빈 응답인 경우 빈 JSON 객체 반환
      return new NextResponse(
        JSON.stringify({ error: 'Empty response from backend' }),
        {
          status: response.status || 500,
          statusText: response.statusText || 'Internal Server Error',
          headers: {
            ...Object.fromEntries(responseHeaders.entries()),
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // 응답 본문이 작으면 로깅 (디버깅용)
    if (responseBody.length > 0 && responseBody.length < 2000) {
      console.log(`[API Proxy] Response body preview:`, responseBody.substring(0, 500));
    }
    
    // 클라이언트로 응답 반환
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * HTTP 메소드별 핸들러
 */
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const HEAD = handleRequest;
export const OPTIONS = handleRequest;
