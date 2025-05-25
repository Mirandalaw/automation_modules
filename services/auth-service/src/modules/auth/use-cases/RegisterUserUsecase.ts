import { TokenService } from '../../../services/token.service';
import { RegisterUserDto } from '../dtos/RegisterUserDto';
import { AuthWithUserResponse } from '../types/responseTypes';
import { CustomError } from '../../../utils/CustomError';
import { HttpStatus } from '../../../constants/httpStatus';
import logger from '../../../utils/logger';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { ISessionRepository } from '../repositories/interfaces/ISessionRepository';
import { UserFactory } from '../factories/UserFactory';
import { SessionFactory } from '../factories/SessionFactory';
import { RefreshTokenFactory } from '../factories/RefreshTokenFactory';
import { IRefreshTokenRepository } from '../repositories/interfaces/IRefreshTokenRepository';

export class RegisterUserUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {
  }

  /**
   * 회원가입 요청 처리
   * - 이메일 중복 체크
   * - 비밀번호 해시화
   * - User 저장 → 세션 생성 및 저장
   * - 토큰 발급 및 저장
   * @param dto 클라이언트로부터 전달받은 회원가입 정보
   * @param userAgent 사용자 브라우저 정보 (세션 기록용)
   * @param ipAddress 사용자 IP 주소 (세션 기록용)
   * @returns accessToken, refreshToken
   */
  async execute(dto: RegisterUserDto, userAgent: string, ipAddress: string): Promise<AuthWithUserResponse> {
    const { email } = dto;

    logger.info(`[RegisterUserUsecase] 회원가입 요청 수신: email=${email}, ip=${ipAddress}`);

    // 이메일 중복 확인
    const exists = await this.userRepository.findByEmail(email);
    if (exists) {
      logger.warn(`[RegisterUserUsecase] 중복 이메일: ${email}`);
      throw new CustomError(HttpStatus.CONFLICT, '이미 존재하는 이메일입니다.');
    }

    // 1. 사용자 생성 및 저장
    const newUser = await UserFactory.createWithHashedPassword(dto);
    try {
      await this.userRepository.save(newUser);
      logger.info(`[RegisterUserUsecase] 사용자 저장 성공: ${newUser.uuid}`);
    } catch (error) {
      logger.error(`[RegisterUserUsecase] 사용자 저장 실패: ${(error as Error).message}`);
      throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, '사용자 저장 중 오류 발생');
    }

    // 2. 세션 생멍 및 저장
    const session = SessionFactory.create({
      user: newUser,
      userAgent,
      ip: ipAddress,
      expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    await this.sessionRepository.save(session);


    // 3. 토큰 발급
    const tokens = await this.tokenService.issue(newUser, session);

    // 4. RefreshToken 엔티티 생성 및 저장
    const refreshTokenEntity = RefreshTokenFactory.createWithMeta(
      newUser,
      tokens.refreshToken,
      userAgent,
      ipAddress,
      session.expiredAt,
    );

    await this.refreshTokenRepository.save(refreshTokenEntity);

    logger.info(`[RegisterUserUsecase] 전체 프로세스 완료: userId=${newUser.uuid}`);

    return {
      success: true,
      message: '회원가입 성공',
      data: {
        user: {
          uuid: newUser.uuid,
          name: newUser.name,
          email: newUser.email,
        },
        tokens,
      },
    };
  }
}