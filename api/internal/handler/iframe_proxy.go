package handler

import (
	"io"
	"log"
	"net/http"
	"strings"

	"mc_web_console_api/internal/config"

	"github.com/labstack/echo/v4"
)

// IframeProxy GET /api/iframe/:service/*
// mc-web-console-api가 same-origin(port 3001)에서 프론트엔드 서비스를 프록시하여
// X-Frame-Options SAMEORIGIN 및 mixed content 문제를 해결한다.
func IframeProxy(c echo.Context) error {
	cfg, _ := c.Get("config").(*config.Config)
	if cfg == nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "config not available"})
	}

	service := c.Param("service")
	subPath := c.Param("*")
	if subPath == "" {
		subPath = "/"
	} else if !strings.HasPrefix(subPath, "/") {
		subPath = "/" + subPath
	}

	// api.yaml에서 service BaseURL 조회
	baseURL := ""
	if svc, ok := cfg.ApiSpec.Services[service]; ok {
		baseURL = strings.TrimRight(svc.BaseURL, "/")
	}
	if baseURL == "" {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "service not found: " + service})
	}

	targetURL := baseURL + subPath
	if qs := c.QueryString(); qs != "" {
		targetURL += "?" + qs
	}

	log.Printf("[IframeProxy] %s %s -> %s", c.Request().Method, c.Request().URL.Path, targetURL)

	req, err := http.NewRequest(c.Request().Method, targetURL, c.Request().Body)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	for k, vs := range c.Request().Header {
		req.Header[k] = vs
	}
	// gzip 압축 비활성화: upstream이 gzip으로 응답하면 JS 패치(문자열 치환)가 실패함
	req.Header.Del("Accept-Encoding")
	req.Header.Set("X-Forwarded-Host", c.Request().Host)

	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		return c.JSON(http.StatusBadGateway, map[string]string{"error": "upstream unreachable: " + err.Error()})
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	// HTML/JS 응답 패치
	contentType := resp.Header.Get("Content-Type")
	if strings.Contains(contentType, "text/html") {
		proxyBase := "/api/iframe/" + service
		body = rewriteHTMLAbsolutePaths(body, proxyBase)
	} else if strings.Contains(contentType, "javascript") {
		// mc-costopti-ui SPA: 도메인 환경에서 API_BE_URL/API_ALARM_URL을
		// "https://hostname" (port 443)으로 결정하는 로직을 window.location.origin으로 패치.
		// 이렇게 하면 SPA의 API 호출이 mc-web-console-api (port 3001)를 통해 라우팅된다.
		body = patchCostOptiApiURL(body)
		// React Router basename 패치: iframe proxy 경로가 basename이 되어야
		// "/"가 /api/iframe/mc-cost-optimizer-fe에 매칭됨 (없으면 404).
		body = patchRouterBasename(body)
	}

	// 응답 헤더 복사 (X-Frame-Options 제외 — same-origin 이므로 불필요)
	for k, vs := range resp.Header {
		if strings.EqualFold(k, "X-Frame-Options") ||
			strings.EqualFold(k, "Content-Length") ||
			strings.EqualFold(k, "Transfer-Encoding") {
			continue
		}
		for _, v := range vs {
			c.Response().Header().Set(k, v)
		}
	}

	return c.Blob(resp.StatusCode, contentType, body)
}

// rewriteHTMLAbsolutePaths HTML 내 절대경로(/로 시작)를 프록시 경로로 변환
// src="/assets/foo.js" → src="/api/iframe/SERVICE/assets/foo.js"
func rewriteHTMLAbsolutePaths(html []byte, proxyBase string) []byte {
	content := string(html)

	// src="/" 및 href="/" 패턴 재작성 (이미 proxyBase가 포함된 경우 제외)
	for _, attr := range []string{"src=", "href=", "action="} {
		content = rewriteAttr(content, attr, proxyBase)
	}

	return []byte(content)
}

// patchCostOptiApiURL mc-costopti-ui JS 번들에서 API URL 결정 로직 패치.
// 도메인 환경(localhost/IP 아님)에서 "https://hostname" → window.location.origin 으로 변경.
// window.location.origin = "https://mciam.onecloudcon.com:3001" (iframe proxy 경유 시)
// → SPA API 호출이 mc-web-console-api(port 3001)를 통해 라우팅됨.
func patchCostOptiApiURL(js []byte) []byte {
	s := string(js)
	// 패턴: 도메인 분기 마지막 케이스  t=`https://${r}`,i=`https://${r}`,a=!1
	old := "t=`https://${r}`,i=`https://${r}`,a=!1)"
	new_ := "t=window.location.origin,i=window.location.origin,a=!1)"
	patched := strings.Replace(s, old, new_, 1)
	if patched != s {
		log.Printf("[IframeProxy] patched API_BE_URL/API_ALARM_URL to window.location.origin")
	}
	return []byte(patched)
}

// patchRouterBasename mc-costopti-ui React Router basename 패치.
// createBrowserRouter는 window.location.pathname을 그대로 라우트로 해석하므로
// iframe proxy 경로(/api/iframe/mc-cost-optimizer-fe)가 basename이 되어야 "/"에 매칭됨.
// 없으면 React Router가 "no route matches URL" → 404를 렌더링함.
func patchRouterBasename(js []byte) []byte {
	s := string(js)
	old := `}))]);function UV()`
	new_ := `}))],{basename:window.location.pathname.replace(/\/$/,"")});function UV()`
	patched := strings.Replace(s, old, new_, 1)
	if patched != s {
		log.Printf("[IframeProxy] patched React Router basename to window.location.pathname")
	}
	return []byte(patched)
}

func rewriteAttr(html, attr, proxyBase string) string {
	var sb strings.Builder
	remaining := html
	prefix := attr + `"/`

	for {
		idx := strings.Index(remaining, prefix)
		if idx == -1 {
			sb.WriteString(remaining)
			break
		}
		sb.WriteString(remaining[:idx])
		sb.WriteString(attr + `"`)

		// 경로 부분 추출
		after := remaining[idx+len(prefix):]
		endIdx := strings.Index(after, `"`)
		if endIdx == -1 {
			sb.WriteString(`"/`)
			sb.WriteString(after)
			break
		}
		path := after[:endIdx]

		// 이미 proxyBase로 시작하면 재작성 안 함
		if strings.HasPrefix("/"+path, proxyBase) {
			sb.WriteString(`"/`)
			sb.WriteString(after)
			break
		}

		sb.WriteString(proxyBase + "/" + path + `"`)
		remaining = after[endIdx+1:]
	}

	return sb.String()
}
