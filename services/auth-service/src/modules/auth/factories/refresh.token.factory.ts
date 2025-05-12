import { RefreshToken } from '../../../entities/RefreshToken';
import { User } from '../../../entities/User';
import logger from '../../../utils/logger';

/**
 * RefreshTokenFactory => 사용자와 토큰, 환경 정보를 기반으로 RefreshToken Entity를 생성.
 */
export class RefreshTokenFactory {
  static create(
    user: User,
    token: string,
    userAgent: string,
    ipAddress: string,
    expiredAt: Date,
  ): RefreshToken {
    logger.debug(`[RefreshTokenFactory] 생성 시작: userId=${user.uuid}, ip=${ipAddress}`);
    
    const entity = new RefreshToken();
    entity.token = token;
    entity.user = user;
    entity.userAgent = userAgent;
    entity.ip = ipAddress;
    entity.expiredAt = expiredAt;

    return entity;
  }
}