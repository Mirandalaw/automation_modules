import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import logger from '../logger';

/**
 * 전역 요청 속도 제한 미들웨어
 * - 1분 동안 IP당 최대 100회 요청 허용
 */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 100,
  message: {
    success: false,
    message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    timestamp: new Date().toISOString(),
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`[RateLimit] 차단된 요청: ip=${req.ip} path=${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: '요청 제한 초과',
    });
  },
});
