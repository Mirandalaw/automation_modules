import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Request } from 'express';
import type { ClientRequest } from 'http';
import logger from '../utils/logger';

export const createServiceProxy = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => path.replace(/^\/[^/]+/, ''),

    onProxyReq(proxyReq: ClientRequest, req: Request) {
      const userId = req.headers['x-user-id'];
      const role = req.headers['x-role'];

      logger.info(`[Gateway:Proxy] 요청: ${req.method} ${req.originalUrl} → ${target}`);
      logger.info(`[Gateway:Proxy] 헤더 - x-user-id=${userId}, x-role=${role}`);

      // ✅ 헤더 세팅은 응답이 보내지기 전에만 진행 가능
      if (!proxyReq.headersSent) {
        if (userId) proxyReq.setHeader('x-user-id', userId);
        if (role) proxyReq.setHeader('x-role', role);
      }

      // ✅ POST/PUT 요청에만 body 쓰기
      if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase()) && req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError(err, req, res) {
      logger.error(`[Gateway:ProxyError] ${req.method} ${req.originalUrl} - ${err.message}`);
      res.status(500).json({ message: 'Proxy error occurred' });
    },

    onProxyRes: (proxyRes, req, res) => {
      logger.info(`[Gateway:ProxyRes] 응답 상태: ${proxyRes.statusCode} - ${req.method} ${req.originalUrl}`);
    },
  });
