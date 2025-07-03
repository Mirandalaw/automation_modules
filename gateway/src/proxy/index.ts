import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Request, Response } from 'express';
import type { ClientRequest } from 'http';
import logger from '../utils/logger';

export const createServiceProxy = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    // selfHandleResponse: false, // 응답을 직접 처리하지 않고 프록시 그대로 전달
    pathRewrite: (path, req) => path.replace(/^\/[^/]+/, ''),

    onProxyReq: (proxyReq: ClientRequest, req: Request) => {
      const userId = req.headers['x-user-id'];
      const role = req.headers['x-role'];
      const authorization = req.headers['authorization'];

      logger.info(`[Proxy Request] ${req.method} ${req.originalUrl} → ${target}`);
      logger.debug(`[Proxy Headers] x-user-id=${userId}, x-role=${role},`);

      if(authorization) proxyReq.setHeader('authorization',authorization);
      if(userId) proxyReq.setHeader('x-user-id',userId);
      if(role) proxyReq.setHeader('x-role',role);

      if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase()) && req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },

    onError: (err: Error, req: Request, res: Response) => {
      logger.error(`[Proxy Error] ${req.method} ${req.originalUrl} - ${err.message}`);
      if (!res.headersSent) {
        res.status(502).json({ message: '게이트웨이 네트워크 오류입니다.' });
      }
    },

    onProxyRes: (proxyRes, req, res) => {
      logger.info(`[Proxy Response] ${proxyRes.statusCode} - ${req.method} ${req.originalUrl}`);
    },
  });
