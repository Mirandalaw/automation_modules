import { CustomError } from './CustomError';

/**
 * 클라이언트의 잘못된 요청에 대한 예외 (400 Bad Request)
 */
export class BadRequestException extends CustomError {
  constructor(
    message = '잘못된 요청입니다.',
    options: {
      details?: string;
      path?: string;
      userId?: string;
      reqId?: string;
    } = {}
  ) {
    super(400, message, options);
    this.name = 'BadRequestException';
  }
}
