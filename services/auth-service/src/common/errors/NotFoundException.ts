import { CustomError } from './CustomError';

/**
 * 존재하지 않는 리소스에 대한 접근 예외 (404 Not Found)
 */
export class NotFoundException extends CustomError {
  constructor(
    message = '요청한 리소스를 찾을 수 없습니다.',
    options: {
      details?: string;
      path?: string;
      userId?: string;
      reqId?: string;
    } = {}
  ) {
    super(404, message, options);
    this.name = 'NotFoundException';
  }
}
