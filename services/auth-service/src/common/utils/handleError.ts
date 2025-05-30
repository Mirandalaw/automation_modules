import { Response } from 'express';
import { CustomError } from '../errors';
import resHandler from './resHandler';
import logger from '../logger';

/**
 * 컨트롤러에서 발생한 에러를 표준 포맷으로 처리
 */
export const handleControllerError = (res: Response, error: unknown) => {
  if (error instanceof CustomError) {
    error.log(); // CustomError 내부에서 로깅 처리
    return resHandler(res, error.statusCode, error.message,error.details);
  }

  if (error instanceof Error) {
    logger.error({
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return resHandler(res, 500, 'Server error', error.message);
  }

  logger.error({
    message: 'Unknown error occurred',
    error,
    timestamp: new Date().toISOString(),
  });

  return resHandler(res, 500, 'Server error', 'Unknown error occurred');
};
