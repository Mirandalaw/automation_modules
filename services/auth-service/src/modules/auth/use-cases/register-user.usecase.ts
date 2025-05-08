import { TokenService } from '../../../services/token.service';
import { createSession } from '../../../utils/session';
import { RegisterUserDto } from '../../../dto/RegisterUserDto';
import { Repository } from 'typeorm';
import { User } from '../../../entities/User';
import { Session } from '../../../entities/Session';
import { AuthResponse } from '../types/responseTypes';
import { CustomError } from '../../../utils/CustomError';
import { HttpStatus } from '../../../constants/httpStatus';
import { hashPassword } from '../../../utils/hash';
import { saveRefreshTokenEntity } from '../../../utils/token';
import logger from '../../../utils/logger';

export class RegisterUserUsecase {
  constructor(
    private readonly userRepository: Repository<User>,
    private readonly sessionRepository: Repository<Session>,
    private readonly tokenService: TokenService,
    private readonly sessionUtil: typeof createSession,
    private readonly tokenSaver: typeof saveRefreshTokenEntity,
  ) {}

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
  async execute(dto: RegisterUserDto, userAgent: string, ipAddress: string): Promise<AuthResponse> {
    const { email, password } = dto;

    logger.info(`[RegisterUserUsecase] 요청 수신: email=${email}, ip=${ipAddress}`);

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      logger.warn(`[RegisterUserUsecase] 중복 이메일: ${email}`);
      throw new CustomError(HttpStatus.CONFLICT, '이미 존재하는 이메일입니다.');
    }

    const hashedPassword = await hashPassword(password);
    const newUser = this.userRepository.create({ ...dto, password: hashedPassword });

    try {
      await this.userRepository.save(newUser);
      logger.info(`[RegisterUserUsecase] 사용자 저장 성공: ${newUser.uuid}`);
    } catch (error) {
      logger.error(`[RegisterUserUsecase] 사용자 저장 실패: ${(error as Error).message}`);
      throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, '사용자 저장 중 오류 발생');
    }

    const sessionData = this.sessionUtil(newUser.uuid, userAgent, ipAddress);
    const session = this.sessionRepository.create({
      id: sessionData.id,
      userAgent: sessionData.userAgent,
      ipAddress: sessionData.ipAddress,
      isValid: sessionData.isValid,
      expiredAt: sessionData.expiredAt,
      user: newUser,
    });

    try {
      await this.sessionRepository.save(session);
      logger.info(`[RegisterUserUsecase] 세션 저장 성공: sessionId=${session.id}`);
    } catch (error) {
      logger.error(`[RegisterUserUsecase] 세션 저장 실패: ${(error as Error).message}`);
      throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, '세션 저장 중 오류 발생');
    }

    let tokens;
    try {
      tokens = await this.tokenService.issue(newUser, session);
      logger.info(`[RegisterUserUsecase] 토큰 발급 완료`);
    } catch (error) {
      logger.error(`[RegisterUserUsecase] 토큰 발급 실패: ${(error as Error).message}`);
      throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, '토큰 발급 중 오류 발생');
    }

    try {
      await this.tokenSaver(newUser, tokens.refreshToken, userAgent, ipAddress, session.expiredAt);
      logger.info(`[RegisterUserUsecase] RefreshToken 저장 완료`);
    } catch (error) {
      logger.error(`[RegisterUserUsecase] RefreshToken 저장 실패: ${(error as Error).message}`);
      throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'RefreshToken 저장 오류');
    }

    logger.info(`[RegisterUserUsecase] 전체 프로세스 완료: userId=${newUser.uuid}`);

    return {
      success: true,
      message: '회원가입 성공',
      data: tokens,
    };
  }

}