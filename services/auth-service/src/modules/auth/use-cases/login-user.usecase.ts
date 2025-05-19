import { userRepository } from '../repositories/user.repository';
import { sessionRepository } from '../repositories/session.repository';
import { JwtProvider } from '../providers/JwtProvider';
import { SessionFactory } from '../factories/session.factory';
import { comparePassword } from '../../../utils/hash';
import { LoginUserRequest } from '../dtos/LoginUserRequest';
import { LoginUserResponse } from '../dtos/LoginUserResponse';
import { CustomError } from '../../../utils/CustomError';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
// import { CustomError } from '@/common/errors';

export class LoginUserUsecase{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: sessionRepository,
    private readonly tokenProvider: JwtProvider,
    private readonly sessionFactory: SessionFactory
  ) {}
  async execute(dto: LoginUserRequest): Promise<LoginUserResponse> {
    const { email, password, userAgent, ip } = dto;

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new CustomError(401, '잘못된 이메일 또는 비밀번호입니다.');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError(401, '잘못된 이메일 또는 비밀번호입니다.');
    }

    // 기존 세션 무효화 (중복 로그인 방지용)
    await this.sessionRepository.invalidateAllByUserId(user.id);

    // 토큰 생성
    const { accessToken, refreshToken, refreshTokenExpiredAt } =
      this.tokenProvider.issue(user.id);

    // 세션 생성 및 저장
    const session = this.sessionFactory.create({
      userId: user.id,
      refreshToken,
      userAgent,
      ip,
      expiredAt: refreshTokenExpiredAt,
    });

    await this.sessionRepository.save(session);

    return {
      userId: user.id,
      accessToken,
      refreshToken,
    };
  }
}