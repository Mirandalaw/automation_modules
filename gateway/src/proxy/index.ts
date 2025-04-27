import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Request, Response } from 'express';
import type { ClientRequest } from 'http';
import logger from '../utils/logger';

/**
 * 서비스 프록시 생성
 * - API Gateway → 각 서비스로 요청 프록시
 * @param target 서비스 URL (ex: AUTH_SERVICE_URL)
 */
export const createServiceProxy = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true, // 호스트 헤더를 타겟 URL로 변경
    pathRewrite: (path, req) => path.replace(/^\/[^/]+/, ''), // 첫 번째 경로 삭제 (/auth, /user 등 제거)

    /**
     * 프록시 요청 전에 호출
     * - 사용자 인증 정보(x-user-id, x-role) 헤더에 추가
     * - 요청 Body 데이터 직접 전송
     */
    onProxyReq: (proxyReq: ClientRequest, req: Request) => {
      const userId = req.headers['x-user-id'];
      const role = req.headers['x-role'];

      logger.info(`[Proxy Request] ${req.method} ${req.originalUrl} → ${target}`);
      logger.debug(`[Proxy Headers] x-user-id=${userId}, x-role=${role}`);

      // 요청 헤더에 사용자 정보 전달
      if (!proxyReq.headersSent) {
        if (userId) proxyReq.setHeader('x-user-id', userId);
        if (role) proxyReq.setHeader('x-role', role);
      }

      // POST, PUT, PATCH 요청인 경우 Body를 전달
      if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase()) && req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },

    /**
     * 프록시 요청 중 에러 발생 시
     */
    onError: (err: Error, req: Request, res: Response) => {
      logger.error(`[Proxy Error] ${req.method} ${req.originalUrl} - ${err.message}`);
      res.status(500).json({ message: '프록시 서버 오류가 발생했습니다.' });
    },

    /**
     * 프록시 응답 수신 시
     */
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`[Proxy Response] ${proxyRes.statusCode} - ${req.method} ${req.originalUrl}`);
    },
  });
