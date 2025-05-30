import { RefreshToken } from '../entities/RefreshToken';
import { User } from '../entities/User';
import logger from '../common/logger';
import { RefreshTokenPayload } from '../types/jwt';

/**
 * RefreshTokenFactory
 *
 * - RefreshToken 엔티티 생성 책임
 * - 사용자 정보 + 토큰 문자열 + 접속 환경(userAgent, ip, 만료일 등) 기반으로 생성
 * - SRP를 지키며, Usecase 로직에서의 객체 생성을 캡슐화함
 */
export class RefreshTokenFactory {
  static createWithMeta(
    user: User,
    token: string,
    userAgent: string,
    ipAddress: string,
    expiredAt: Date,
  ): RefreshToken {
    logger.debug(`[RefreshTokenFactory] createWithMeta 호출: userId=${user.uuid}, ip=${ipAddress}`);

    const refreshToken = new RefreshToken();
    refreshToken.token = token;
    refreshToken.user = user;
    refreshToken.userAgent = userAgent;
    refreshToken.ip = ipAddress;
    refreshToken.expiredAt = expiredAt;

    return refreshToken;
  }

  static fromPayload(
    user: User,
    token: string,
    expiredAt: Date,
    payload: RefreshTokenPayload,
  ): RefreshToken {
    logger.debug(`[RefreshTokenFactory] fromPayload 호출`);
    const entity = new RefreshToken();
    entity.token = token;
    entity.user = user;
    entity.userAgent = payload.userAgent;
    entity.ip = payload.ipAddress;
    entity.expiredAt = expiredAt;
    entity.sessionId = payload.sessionId;

    if (payload.deviceId) entity.deviceId = payload.deviceId;
    if (payload.platform) entity.platform = payload.platform;
    if (payload.location) entity.location = payload.location;
    if (payload.version) entity.version = payload.version;

    return entity;
  }
}