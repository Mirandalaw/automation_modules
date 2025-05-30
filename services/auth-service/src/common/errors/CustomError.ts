import logger from '../logger';

/**
 * CustomError
 * - 모든 커스텀 예외의 기반 클래스
 * - HTTP 응답에 필요한 메타정보 포함
 */
interface CustomErrorOptions {
  details?: string;       // 추가적인 디버그 설명
  path?: string;          // 에러가 발생한 API 경로
  userId?: string;        // 요청을 보낸 사용자 식별자
  reqId?: string;         // 요청 ID (trace log 목적)
  isOperational?: boolean;// 예상 가능한 운영상 오류 여부
}

export class CustomError extends Error {
  public readonly statusCode: number;
  public readonly details?: string;
  public readonly timestamp: string;
  public readonly path?: string;
  public readonly userId?: string;
  public readonly reqId?: string;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    options: CustomErrorOptions = {},
  ) {
    super(message);

    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.details = options.details;
    this.path = options.path;
    this.userId = options.userId;
    this.reqId = options.reqId;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 클라이언트 응답 직렬화를 위한 메서드
   */
  toJSON() {
    return {
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      details: this.details,
      path: this.path,
      userId: this.userId,
      reqId: this.reqId,
      timestamp: this.timestamp,
    };
  }

  /**
   * 에러 발생 시 로그 출력 (logger 연동)
   */
  log() {
    logger.error({
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      details: this.details,
      path: this.path,
      userId: this.userId,
      reqId: this.reqId,
      timestamp: this.timestamp,
      stack: this.stack,
    });
  }

  /**
   * errorHandler.ts 에서 JSON 응답을 위한 헬퍼 메서드
   */
  getResponseBody() {
    return {
      success: false,
      message: this.message,
      ...(this.details && { details: this.details }),
      timestamp: this.timestamp,
      path: this.path,
    };
  }
}
