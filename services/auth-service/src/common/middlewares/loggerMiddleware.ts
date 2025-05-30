import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

/**
 * 요청 로깅 미들웨어
 * - 요청 IP, 메서드, 경로, 유저 ID, 역할 등 기록
 */
export const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const method = req.method;
    const path = req.originalUrl;
    const userId = req.headers['x-user-id'] || 'Guest';
    const role = req.headers['x-role'] || 'none';

    // IP 추출 (proxy 환경 고려)
    const fwd = req.headers['x-forwarded-for'];
    const ip = typeof fwd === 'string'
      ? fwd.split(',')[0]?.trim()
      : Array.isArray(fwd)
        ? fwd[0]?.trim()
        : req.socket.remoteAddress || req.ip || 'unknown';

    logger.info(`[Request] ip=${ip} method=${method} path=${path} userId=${userId} role=${role}`);
  } catch (error) {
    logger.error(`[LoggerMiddleware] 로깅 중 오류 발생: ${(error as Error).message}`);
  } finally {
    next();
  }
};
