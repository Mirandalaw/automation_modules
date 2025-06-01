import { CustomError } from './CustomError';

/**
 * DatabaseWriteException
 * - DB 쓰기 실패 시 사용
 * - Repository 계층에서 catch → throw 로 던질 때 래핑용
 */
export class DatabaseWriteException extends CustomError {
  constructor(
    message = '데이터베이스 쓰기 실패',
    options: {
      details?: string;
      path?: string;
      userId?: string;
      reqId?: string;
    } = {}
  ) {
    super(500, message, options);
    this.name = 'DatabaseWriteException';
  }
}
