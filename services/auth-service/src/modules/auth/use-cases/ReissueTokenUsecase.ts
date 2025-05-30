import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { ISessionRepository } from '../repositories/interfaces/ISessionRepository';
import { IRefreshTokenRepository } from '../repositories/interfaces/IRefreshTokenRepository';
import { TokenService } from '../../../services/token.service';
import { ITokenProvider } from '../providers/interfaces/IJwtProvider';
import { CustomError } from '../../../utils/CustomError';
import { HttpStatus } from '../../../constants/httpStatus';
import logger from '../../../utils/logger';
import { RefreshTokenFactory } from '../factories/RefreshTokenFactory';
import { AuthTokenResponse } from '../types/responseTypes';
import { Session } from '../entities/Session';
import { RefreshTokenPayload } from '../types/jwt';
import { ReissueTokenDto } from '../dtos/ReissueTokenDto';

/**
 * ReissueTokenUsecase
 *
 * - 전달받은 RefreshToken을 검증하고, 사용자/세션을 확인한 후
 *   새로운 AccessToken과 RefreshToken을 재발급합니다.
 * - 기존 세션 정보를 유지하며 토큰 갱신을 수행합니다.
 */
export class ReissueTokenUsecase {
  constructor(
    private readonly userRepository: IUserRepository,                        // 사용자 조회
    private readonly sessionRepository: ISessionRepository,                // Redis 세션 유효성 확인
    private readonly refreshTokenRepository: IRefreshTokenRepository,      // RefreshToken 재저장
    private readonly tokenService: TokenService,                           // 토큰 재발급
    private readonly tokenProvider: ITokenProvider                         // RefreshToken 검증
  ) {}

  /**
   * RefreshToken을 통해 AccessToken과 RefreshToken 재발급
   * @param dto 클라이언트로부터 전달받은 토큰
   * @returns 새롭게 발급된 access/refresh token
   */
  async execute(dto: ReissueTokenDto): Promise<AuthTokenResponse> {
    const refreshToken = dto.refreshToken;
    logger.info(`[ReissueTokenUsecase] 토큰 재발급 시도`);

    // 1. RefreshToken 검증 및 파싱
    let payload ;
    try {
      payload = this.tokenProvider.verifyRefreshToken(refreshToken) as RefreshTokenPayload;
    } catch (err) {
      throw new CustomError(HttpStatus.UNAUTHORIZED, 'RefreshToken이 유효하지 않습니다');
    }

    const { userId, sessionId, userAgent, ipAddress, loginAt } = payload;

    // 2. 사용자 조회
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomError(HttpStatus.UNAUTHORIZED, '사용자를 찾을 수 없습니다');
    }

    // 3. 세션 유효성 검사 (Redis 기반)
    const isValidSession = await this.sessionRepository.exists(sessionId, userId);
    if (!isValidSession) {
      throw new CustomError(HttpStatus.UNAUTHORIZED, '세션이 만료되었거나 존재하지 않습니다');
    }
    const session = {
      id: sessionId,
      userAgent,
      ipAddress,
      expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7일 연장
      user,
    } as Session;

    // 4. 토큰 재발급
    const tokens = await this.tokenService.issue(user, session);
    // 5. RefreshToken 엔티티 생성 및 저장

    const refreshTokenEntity = RefreshTokenFactory.fromPayload(
      user,
      tokens.refreshToken,
      session.expiredAt,
      payload
    );

    await this.refreshTokenRepository.save(refreshTokenEntity);

    logger.info(`[ReissueTokenUsecase] 재발급 성공: userId=${userId}`);

    return {
      success: true,
      message: '토큰 재발급 성공',
      data: tokens,
    };
  }
}
