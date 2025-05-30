import { ISessionRepository } from '../repositories/interfaces/ISessionRepository';
import { IRefreshTokenStore } from '../repositories/interfaces/IRefreshTokenStore';
import { MessageResponse } from '../types/responseTypes';
import { LogoutUserDto } from '../dtos/LogoutUserDto';
import logger from '../../../common/logger';
import { IRefreshTokenRepository } from '../repositories/interfaces/IRefreshTokenRepository';


export class LogoutUserUsecase{
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly refreshTokenStore: IRefreshTokenStore, // Redis
    private readonly refreshTokenRepository: IRefreshTokenRepository, // DB
  ) {}

  /**
   * 로그아웃 처리
   * - 세션 삭제 (sessionId 기준)
   * - RefreshToken 삭제 (userId 기준)
   */
  async execute(dto: LogoutUserDto): Promise<MessageResponse> {
    const { userId, sessionId } = dto;
    const sessionKey = `session:${userId}:${sessionId}`;
    const refreshTokenKey = `refreshToken:${userId}`;

    logger.info(`[LogoutUserUsecase] 로그아웃 시도: userId=${userId}, sessionId=${sessionId}`);

    try {
      await this.sessionRepository.invalidateAllByUserId(userId); // 또는 invalidateOneBySessionId 추가 가능
      await this.refreshTokenStore.delete(userId);
      await this.refreshTokenRepository.delete(userId);

      logger.info(`[LogoutUserUsecase] 세션 및 토큰 삭제 완료`);
    } catch (error: any) {
      logger.error(`[LogoutUserUsecase] 로그아웃 실패: ${error.message}`);
      throw new Error('로그아웃 처리 중 오류 발생');
    }

    return {
      success: true,
      message: '로그아웃이 완료되었습니다.',
      data : null
    };
  }
}