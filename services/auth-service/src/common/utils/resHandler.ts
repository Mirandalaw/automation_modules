import { Response } from 'express';
import logger from '../logger';

/**
 * 통합 응답 핸들러
 * - 성공/실패 여부를 명시적으로 표시합니다.
 * - 상태코드 400 이상이면 경고(warn) 로깅합니다.
 *
 * @param res Express Response 객체
 * @param statusCode HTTP 상태 코드
 * @param message 응답 메시지
 * @param data 성공 시 반환할 데이터
 * @param errorDetails 실패 시 상세 오류 설명
 */
const resHandler = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any,
  errorDetails?: string
) => {
  const isSuccess = statusCode < 400;

  const responseBody: Record<string, any> = {
    success: isSuccess,
    message,
  };

  if (data) {
    responseBody.data = data;
  }

  if (!isSuccess && errorDetails) {
    responseBody.errorDetails = errorDetails;
  }

  const logData = {
    statusCode,
    message,
    ...(errorDetails && { errorDetails }),
    path: res.req?.originalUrl,
    method: res.req?.method,
    userId: res.req?.headers['x-user-id'] || 'Guest',
    timestamp: new Date().toISOString(),
  };

  if (isSuccess) {
    logger.info(logData);
  } else {
    logger.warn(logData);
  }

  return res.status(statusCode).json(responseBody);
};

export default resHandler;
