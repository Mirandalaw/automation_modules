import { AccessTokenPayload, RefreshTokenPayload } from '../types/jwt';
import { User } from '../entities/User';
import { Session } from '../entities/Session';

/**
 * TokenPayloadFactory
 * -AccessToken과 RefreshToken 발급을 위한 JWT payload 객체를 생성하는 정적 팩토리 클래스
 * -JWT 토큰 서명 전에 payload 구조를 통일된 형식으로 생성하기 위해 사용
 * -SRP(단일 책임 원칙)를 지켜 "payload 생성" 책임만 가짐
 */
export class TokenPayloadFactory {

  /**
   * AccessToken JWT Payload 구성
   * @param user 유저 엔티티
   * @returns AccessTokenPayload
   */
  static buildAccessTokenPayload(user: User): AccessTokenPayload {
    const now = Math.floor(Date.now() / 1000);
    return {
      userId: user.uuid,
      roles: user.roles?.map(role => role.name) || [],
      issuedAt: now,
      expiresAt: now + 60 * 15,
    };
  }

  /**
   * RefreshToken JWT Payload 구성
   * @param user 유저 엔티티
   * @param session 세션 엔티티
   * @returns RefreshTokenPayload
   */
  static buildRefreshTokenPayload(user: User, session: Session): RefreshTokenPayload {
    const now = Math.floor(Date.now() / 1000);
    return {
      userId: user.uuid,
      sessionId: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      loginAt: now,
      // deviceId: '',
      // platform: '',
      // location: '',
      // version: '',
    };
  }
}