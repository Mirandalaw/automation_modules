import { Request, Response, NextFunction } from 'express';
import { CustomError } from './CustomError';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import logger from '../logger';

/**
 * 글로벌 에러 핸들러
 * - 모든 미들웨어, 라우터에서 던진 에러를 처리
 */
const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = '서버 내부 오류가 발생했습니다.';
  let errorDetails: any = {};

  if (err instanceof CustomError) {
    err.log();
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = {
      details: err.details,
      reqId: err.reqId,
      userId: err.userId,
      timestamp: err.timestamp,
      path: err.path || req.originalUrl,
    }
  } else if (err instanceof TokenExpiredError) {
    logger.warn(`[ErrorHandler] 액세스 토큰 만료`);
    statusCode = 401;
    message = 'Access token이 만료되었습니다.';
  } else if (err instanceof JsonWebTokenError) {
    logger.warn(`[ErrorHandler] 잘못된 액세스 토큰`);
    statusCode = 401;
    message = '유효하지 않은 access token입니다.';
  } else if (err instanceof Error) {
    logger.error(`[ErrorHandler] 처리되지 않은 오류: ${err.message}`);
    message = err.message;
  } else {
    logger.error(`[ErrorHandler] 알 수 없는 오류: ${JSON.stringify(err)}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...errorDetails,
    method: req.method,
  });
};

export default errorHandler;
