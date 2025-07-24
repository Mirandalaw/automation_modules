import { CustomError } from './CustomError';

/**
 * 인증이 필요한 요청에 대한 예외 (401 Unauthorized)
 */
export class UnauthorizedException extends CustomError {
  constructor(
    message = '인증이 필요합니다.',
    options: {
      details?: string;
      path?: string;
      userId?: string;
      reqId?: string;
    } = {}
  ) {
    super(401, message, options);
    this.name = 'UnauthorizedException';
  }
}
