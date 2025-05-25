import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { ISessionRepository } from '../repositories/interfaces/ISessionRepository';
import { IRefreshTokenRepository } from '../repositories/interfaces/IRefreshTokenRepository';
import { TokenService } from '../../../services/token.service';
import { AuthWithUserResponse } from '../types/responseTypes';
import logger from '../../../utils/logger';
import { CustomError } from '../../../utils/CustomError';
import { HttpStatus } from '../../../constants/httpStatus';
import { comparePassword } from '../../../utils/hash';
import { SessionFactory } from '../factories/SessionFactory';
import { RefreshTokenFactory } from '../factories/RefreshTokenFactory';
import { LoginUserDto } from '../dtos/LoginUserDto';

export class LoginUserUsecase{
  constructor(
    private readonly userRepository : IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly  refreshTokenRepository: IRefreshTokenRepository,
    private readonly  tokenService : TokenService
  ) {}

  /**
   * 로그인 요청 처리
   * - 사용자 이메일/비밀번호 인증
   * - 세션 및 토큰 발급
   */
  async execute(
   dto:LoginUserDto
  ): Promise<AuthWithUserResponse> {
    const {email,password, userAgent,ip} = dto;

    logger.info(`[LoginUserUsecase] 로그인 요청: email=${email}, ip=${ip}`);

    // 1. 사용자 조회
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      logger.warn(`[LoginUserUsecase] 존재하지 않는 이메일: ${email}`);
      throw new CustomError(HttpStatus.UNAUTHORIZED, '이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 2. 비밀번호 확인

    if (!user.password) {
      throw new CustomError(HttpStatus.UNAUTHORIZED, '비밀번호 정보가 없습니다.');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      logger.warn(`[LoginUserUsecase] 비밀번호 불일치: email=${email}`);
      throw new CustomError(HttpStatus.UNAUTHORIZED, '이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 3. 세션 생성
    const expiredAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7일
    const session = SessionFactory.create({ user, userAgent, ip: ip, expiredAt });
    await this.sessionRepository.save(session);

    // 4. 토큰 발급
    const tokens = await this.tokenService.issue(user, session);

    // 5. RefreshToken 저장
    const refreshTokenEntity = RefreshTokenFactory.createWithMeta(
      user,
      tokens.refreshToken,
      userAgent,
      ip,
      session.expiredAt,
    );
    await this.refreshTokenRepository.save(refreshTokenEntity);

    // 6. 응답 반환
    return {
      success: true,
      message: '로그인 성공',
      data: {
        user: {
          uuid: user.uuid,
          name: user.name,
          email: user.email,
        },
        tokens,
      },
    };
  }
}