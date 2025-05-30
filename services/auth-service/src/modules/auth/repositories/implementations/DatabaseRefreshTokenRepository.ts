import { IRefreshTokenRepository } from '../interfaces/IRefreshTokenRepository';
import { Repository } from 'typeorm';
import { RefreshToken } from '../../entities/RefreshToken';
import { RefreshTokenPayload } from '../../types/jwt';
import logger from '../../../../common/logger';

/**
 * DatabaseRefreshTokenRepository
 * - RDB 기반 RefreshToken 저장소 (PostgreSQL, MySQL 등)
 * - RefreshToken Entity 저장/조회/삭제 책임
 * - SRP 원칙에 따라 Usecase에서는 생성만, Repository는 저장만 담당
 */
export class DatabaseRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    private readonly ormRepository: Repository<RefreshToken>,
  ) {}

  /**
   * RefreshToken Entity 저장
   * - 이미 Factory를 통해 생성된 Entity를 DB에 저장
   */

  async save(refreshToken: RefreshToken): Promise<void>{
    logger.debug(`[DatabaseRefreshTokenRepository] 저장 시도: userId=${refreshToken.user?.uuid}, token=${refreshToken.token}`);
    try {
      await this.ormRepository.save(refreshToken);
      logger.info(`[DatabaseRefreshTokenRepository] 저장 성공: userId=${refreshToken.user?.uuid}`);
    } catch (error) {
      logger.error(`[DatabaseRefreshTokenRepository] 저장 실패: userId=${refreshToken.user?.uuid}, error=${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * RefreshToken 1건 조회
   * - userId를 기준으로 가장 최근(expiredAt 기준)의 토큰 1개를 조회
   * - 사용자의 마지막 로그인 정보 확인 또는 토큰 검증 흐름에서 활용
   */
  async find(userId: string): Promise<(RefreshTokenPayload & { token: string; expiredAt: number }) | null> {
    logger.debug(`[DatabaseRefreshTokenRepository] 조회 시도: userId=${userId}`);
    const token = await this.ormRepository.findOne({
      where: { user: { uuid: userId } },
      order: { expiredAt: 'DESC' },
      relations: ['user'], // user FK 포함
    });

    if (!token) {
      logger.warn(`[DatabaseRefreshTokenRepository] 토큰 없음: userId=${userId}`);
      return null;
    }

    logger.info(`[DatabaseRefreshTokenRepository] 조회 성공: userId=${userId}, token=${token.token}`);
    return {
      userId,
      sessionId: '', // 추후 필요 시 확장
      userAgent: token.userAgent,
      ipAddress: token.ip,
      loginAt: Math.floor(token.createdAt.getTime() / 1000),
      token: token.token,
      expiredAt: token.expiredAt.getTime(),
    };
  }

  /**
   * RefreshToken 삭제
   * - 특정 사용자의 모든 RefreshToken 레코드를 삭제
   * - 주로 로그아웃 또는 계정 보안 초기화 시 사용
   */
  async delete(userId: string): Promise<void> {
    logger.debug(`[DatabaseRefreshTokenRepository] 삭제 시도: userId=${userId}`);
    try {
      await this.ormRepository.delete({ user: { uuid: userId } });
      logger.info(`[DatabaseRefreshTokenRepository] 삭제 완료: userId=${userId}`);
    } catch (error) {
      logger.error(`[DatabaseRefreshTokenRepository] 삭제 실패: userId=${userId}, error=${(error as Error).message}`);
      throw error;
    }
  };
}