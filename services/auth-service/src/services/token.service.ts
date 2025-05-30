import { ITokenIssuer } from '../providers/interfaces/ITokenIssuer';
import { Session } from '../entities/Session';
import { User } from '../entities/User';
import logger from '../common/logger';
import { TokenPayloadFactory } from '../factories/TokenPayloadFactory';
import { CustomError } from '../common/errors';
import { IRefreshTokenStore } from '../repositories/interfaces/IRefreshTokenStore';

/**
 * TokenService
 * - JWT 발급과 Redis 저장 흐름을 담당하는 조립자
 * - TokenPayloadFactory, ITokenIssuer, ITokenStore를 주입받아 처리
 * - Usecase 계층에서 호출되며 단일 책임 원칙(SRP)을 지킴
 */
export class TokenService {
  constructor(
    private readonly tokenIssuer: ITokenIssuer,
    private readonly refreshTokenRepository: IRefreshTokenStore,
  ) {}

  /**
   * AccessToken + RefreshToken 발급 및 저장
   * @param user 유저 엔티티
   * @param session 세션 엔티티
   * @returns accessToken, refreshToken
   */
  async issue(user: User, session: Session): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      logger.debug(`[TokenService] 토큰 발급 시작: userId=${user.uuid},sessionId=${session.id}`);

      // Payload 생성

      const accessPayload = TokenPayloadFactory.buildAccessTokenPayload(user);
      const refreshPayload = TokenPayloadFactory.buildRefreshTokenPayload(user, session);

      // JWT 서명

      const accessToken = this.tokenIssuer.signAccessToken(accessPayload);
      const refreshToken = this.tokenIssuer.signRefreshToken(refreshPayload);

      // Redis 저장
      await this.refreshTokenRepository.save(user.uuid, {
        ...refreshPayload,
        token: refreshToken,
        expiredAt: session.expiredAt.getTime(),
      });

      logger.info(`[TokenService] 토큰 발급 및 저장 완료: userId=${user.uuid}`);
      return { accessToken, refreshToken };
    } catch (error: any) {
      logger.error(`[TokenService] 토큰 발급 실패`, {
        userId: user.uuid,
        sessionId: session.id,
        message: error.message,
        stack: error.stack,
      });
      throw new CustomError(500, '토큰 발급 중 오류가 발생했습니다.', error.message);
    }
  }

  /**
   * 토큰 재발급 (실제로는 issue()와 동일 로직 재사용)
   * @param user 유저 엔티티
   * @param session 기존 세션 엔티티
   * @returns accessToken, refreshToken
   */
  async reissue(user: User, session: Session): Promise<{ accessToken: string, refreshToken: string }> {
    logger.debug(`[TokenService] 토큰 재발급 요청 수신: userId=${user.uuid}, sessionId=${session.id}`);
    return this.issue(user, session);
  }
}