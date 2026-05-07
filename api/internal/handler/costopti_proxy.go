package handler

import (
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

const (
	costOptiBEURL    = "http://mc-cost-optimizer-be:9090"
	costOptiAlarmURL = "http://mc-cost-optimizer-alarm-service:9000"
)

// CostOptiProxy POST/GET /api/costopti/*
// mc-costopti-ui SPA가 same-origin API 호출 시 mc-cost-optimizer-be/alarm으로 프록시.
// 경로 규칙: /api/costopti/alert/* → alarm(9000), 그 외 → be(9090)
func CostOptiProxy(c echo.Context) error {
	fullPath := c.Request().URL.Path // e.g. /api/costopti/be/invoice
	targetBase := costOptiBEURL
	if strings.Contains(fullPath, "/costopti/alert") {
		targetBase = costOptiAlarmURL
	}

	targetURL := targetBase + fullPath
	if qs := c.QueryString(); qs != "" {
		targetURL += "?" + qs
	}

	log.Printf("[CostOptiProxy] %s %s -> %s", c.Request().Method, fullPath, targetURL)

	req, err := http.NewRequest(c.Request().Method, targetURL, c.Request().Body)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	for k, vs := range c.Request().Header {
		req.Header[k] = vs
	}

	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		return c.JSON(http.StatusBadGateway, map[string]string{"error": "upstream unreachable: " + err.Error()})
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	contentType := resp.Header.Get("Content-Type")

	for k, vs := range resp.Header {
		if strings.EqualFold(k, "Content-Length") || strings.EqualFold(k, "Transfer-Encoding") {
			continue
		}
		for _, v := range vs {
			c.Response().Header().Set(k, v)
		}
	}

	return c.Blob(resp.StatusCode, contentType, body)
}
