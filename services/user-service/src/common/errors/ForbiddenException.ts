import { CustomError } from './CustomError';

/**
 * 권한이 없는 접근에 대한 예외 (403 Forbidden)
 */
export class ForbiddenException extends CustomError {
  constructor(
    message = '해당 리소스에 대한 접근 권한이 없습니다.',
    options: {
      details?: string;
      path?: string;
      userId?: string;
      reqId?: string;
    } = {}
  ) {
    super(403, message, options);
    this.name = 'ForbiddenException';
  }
}
