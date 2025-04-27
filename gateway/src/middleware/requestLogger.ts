import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * 요청 및 응답 로깅 미들웨어 (API Gateway용)
 * - 요청 메서드, URL, 상태코드, 처리 시간(ms) 기록
 * - 성공/경고/에러 상태코드에 따라 다른 로그 레벨 사용
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    const logMessage = `[Gateway Request] ${method} ${originalUrl} ${statusCode} - ${duration}ms`;

    if (statusCode >= 500) {
      logger.error(logMessage);
    } else if (statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }
  });

  next();
};
