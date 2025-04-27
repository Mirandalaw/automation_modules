import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * 전역 에러 핸들러
 * - 모든 에러를 잡아서 응답 포맷을 표준화합니다.
 * - 시스템 에러, 사용자 에러를 구분하여 로깅합니다.
 */
const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  const error = err as Error;
  const statusCode = (res.statusCode && res.statusCode !== 200) ? res.statusCode : 500;

  const response = {
    success: false,
    message: error.message || '서버 내부 오류가 발생했습니다.',
  };

  if (statusCode >= 500) {
    // 서버 측 오류 (5xx)
    logger.error(`[ServerError] ${req.method} ${req.originalUrl} - ${error.message}`);
  } else {
    // 클라이언트 요청 오류 (4xx)
    logger.warn(`[ClientError] ${req.method} ${req.originalUrl} - ${error.message}`);
  }

  return res.status(statusCode).json(response);
};

export default errorHandler;
