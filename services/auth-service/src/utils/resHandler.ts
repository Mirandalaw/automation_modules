import { Response } from 'express';
import logger from './logger'; // ✅ Winston 로거 추가

const resHandler = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any,
  errorDetails?: string
) => {
  const responseBody = data
    ? { message, data, errorDetails }
    : { message, errorDetails };

  // 상태 코드가 400 이상일 때만 로깅
  if (statusCode >= 400) {
    logger.warn({
      statusCode,
      message,
      errorDetails,
      timestamp: new Date().toISOString(),
      path: res.req?.originalUrl,
      method: res.req?.method,
      userId: res.req?.headers['x-user-id'] || 'Guest',
    });
  }

  return res.status(statusCode).json(responseBody);
};

export default resHandler;
