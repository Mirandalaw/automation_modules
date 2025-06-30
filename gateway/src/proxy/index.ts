import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Request, Response } from 'express';
import type { ClientRequest } from 'http';
import logger from '../utils/logger';

export const createServiceProxy = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    selfHandleResponse: false, // 응답을 직접 처리하지 않고 프록시 그대로 전달
    pathRewrite: (path, req) => path.replace(/^\/[^/]+/, ''),

    onProxyReq: (proxyReq: ClientRequest, req: Request) => {
      const userId = req.headers['x-user-id'];
      const role = req.headers['x-role'];

      logger.info(`[Proxy Request] ${req.method} ${req.originalUrl} → ${target}`);
      logger.debug(`[Proxy Headers] x-user-id=${userId}, x-role=${role}`);

      // 사용자 정보 전달
      if (!proxyReq.headersSent) {
        if (userId) proxyReq.setHeader('x-user-id', userId);
        if (role) proxyReq.setHeader('x-role', role);
      }

      // ✨ req.body가 Buffer나 Stream일 수도 있기 때문에 직접 write는 생략
      // express.json() 미들웨어가 제대로 body를 전달하도록 설정해야 함
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
