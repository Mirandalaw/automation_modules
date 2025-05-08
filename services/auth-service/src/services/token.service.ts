import { User } from '../entities/User';
import { Session } from '../entities/Session';
import { AccessTokenPayload, RefreshTokenPayload } from '../types/jwt';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { saveRefreshToken } from '../utils/redis';
import { CustomError } from '../utils/CustomError';
import logger from '../utils/logger';

export class TokenService {
  /**
   * AccessToken + RefreshToken 발급 및 Redis 저장
   * @param user 유저 엔티티
   * @param session 세션 엔티티
   * @returns { accessToken, refreshToken }
   */
  async issue(user: User, session: Session){
    try{
      logger.debug(`[TokenService] 토큰 발급 시작: userId=${user.uuid}, sessionId=${session.id}`);

      const accessToken = this.createAccessToken(user);
      const refreshToken = this.createRefreshToken(user,session);

      logger.debug(`[TokenService] 토큰 생성 완료 - AccessToken 및 RefreshToken`);


      await saveRefreshToken(user.uuid, {
        ...this.buildRefreshPayload(user,session),
        token: refreshToken,
        expiredAt: session.expiredAt.getTime(),
      });

      logger.info(`[TokenService] 토큰 발급 및 저장 완료: userId=${user.uuid}`);

      return {accessToken, refreshToken};
    }catch (error: any) {
      logger.error(`[TokenService] 토큰 처리 실패`, {
        userId: user.uuid,
        sessionId: session.id,
        message: error.message,
        stack: error.stack,
      });
      throw new CustomError(500, '토큰 발급 중 오류 발생', error.message);
    }
  }

  /**
   * AccessToken + RefreshToken 재발급 및 Redis 갱신
   * @param user 유저 엔티티
   * @param session 세션 엔티티
   * @returns { accessToken, refreshToken }
   */
  async reissue(user: User, session: Session) {
    try {
      logger.debug(`[TokenService] 토큰 재발급 시작: userId=${user.uuid}, sessionId=${session.id}`);

      const accessToken = this.createAccessToken(user);
      const refreshToken = this.createRefreshToken(user, session);

      logger.debug(`[TokenService] 재발급 토큰 생성 완료 - AccessToken 및 RefreshToken`);

      await saveRefreshToken(user.uuid, {
        ...this.buildRefreshPayload(user, session),
        token: refreshToken,
        expiredAt: session.expiredAt.getTime(),
      });

      logger.info(`[TokenService] 토큰 재발급 완료: userId=${user.uuid}`);

      return { accessToken, refreshToken };
    } catch (error: any) {
      logger.error(`[TokenService] 토큰 재발급 실패`, {
        userId: user.uuid,
        sessionId: session.id,
        message: error.message,
        stack: error.stack,
      });
      throw new CustomError(500, '토큰 재발급 중 오류 발생', error.message);
    }
  }

  /**
   * AccessToken 생성 ( JWT 서명 포함 )
   * @param user 유저 엔티티
   * @returns JWT 문자열
   */
  private createAccessToken(user: User) : string {
    const payload: AccessTokenPayload = this.buildAccessPayload(user);
    logger.debug(`[TokenService] AccessToken Payload 생성 완료`);
    return generateAccessToken(payload);
  }

  /**
   * RefreshToken 생성 ( JWT 서명 포함 )
   * @param user 유저 엔티티
   * @param session 세션 엔티티
   * @returns JWT 문자열
   */
  private createRefreshToken(user:User, session:Session) : string {
    const payload: RefreshTokenPayload = this.buildRefreshPayload(user,session);
    logger.debug(`[TokenService] RefreshToken Payload 생성 완료`);
    return generateRefreshToken(payload);
  }

  /**
   * AccessToken JWT Payload 구성
   * @param user 유저 엔티티
   * @returns AccessTokenPayload
   */
  private buildAccessPayload(user: User) : AccessTokenPayload {
    const now = Math.floor(Date.now() / 1000);
    return {
      userId : user.uuid,
      roles : user.roles?.map((r) => r.name) || [],
      issuedAt : now,
      expiresAt : now + 60 * 15,
    };
  }

  /**
   * RefreshToken JWT Payload 구성
   * @param user 유저 엔티티
   * @param session 세션 엔티티
   * @returns RefreshTokenPayload
   */

  private buildRefreshPayload(user:User, session:Session): RefreshTokenPayload {
    const now = Math.floor(Date.now()/1000);
    return {
      userId : user.uuid,
      sessionId : session.id,
      userAgent:session.userAgent,
      ipAddress:session.ipAddress,
      loginAt: now,
    };
  }
}
