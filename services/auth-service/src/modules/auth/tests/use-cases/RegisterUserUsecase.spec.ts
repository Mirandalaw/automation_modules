import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { mockDeep } from 'jest-mock-extended';
import { ISessionRepository } from '../../repositories/interfaces/ISessionRepository';
import { IRefreshTokenRepository } from '../../repositories/interfaces/IRefreshTokenRepository';
import { TokenService } from '../../../../services/token.service';
import { RegisterUserUsecase } from '../../use-cases/RegisterUserUsecase';
import { RegisterUserDto } from '../../../../dto/RegisterUserDto';
import { User } from '../../../../entities/User';
import { UserFactory } from '../../factories/UserFactory';
import { SessionFactory } from '../../factories/SessionFactory';
import { RefreshTokenFactory } from '../../factories/RefreshTokenFactory';
import { HttpStatus } from '../../../../constants/httpStatus';
import { CustomError } from '../../../../utils/CustomError';
import { Session } from '../../../../entities/Session';

jest.mock('../../factories/UserFactory');
jest.mock('../../factories/SessionFactory');
jest.mock('../../factories/RefreshTokenFactory');

describe('RegisterUserUsecase', () => {
  const userRepository = mockDeep<IUserRepository>();
  const sessionRepository = mockDeep<ISessionRepository>();
  const refreshTokenRepository = mockDeep<IRefreshTokenRepository>();
  const tokenService = mockDeep<TokenService>();

  const usecase = new RegisterUserUsecase(
    userRepository,
    sessionRepository,
    refreshTokenRepository,
    tokenService
  );

  const dto: RegisterUserDto = {
    name: '홍길동',
    email: 'test@example.com',
    password: 'plain-password',
    phone: '010-1234-5678',
    agreedToPrivacyPolicy: true,
  };

  const mockUser = { uuid: 'user-uuid-1', email: dto.email, name: dto.name } as User;
  const mockSession = { id: 'session-id-1', expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) } as Session;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('회원가입 성공 시 accessToken과 refreshToken을 반환해야 한다', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (UserFactory.createWithHashedPassword as jest.Mock).mockResolvedValue(mockUser);
    (userRepository.save as jest.Mock).mockResolvedValue(mockUser);
    (SessionFactory.create as jest.Mock).mockReturnValue(mockSession);
    (sessionRepository.save as jest.Mock).mockResolvedValue(undefined);
    (tokenService.issue as jest.Mock).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    (RefreshTokenFactory.createWithMeta as jest.Mock).mockReturnValue({} as any);
    (refreshTokenRepository.save as jest.Mock).mockResolvedValue(undefined);

    const result = await usecase.execute(dto, 'Chrome', '127.0.0.1');

    expect(result.success).toBe(true);
    expect(result.data.user.email).toBe(dto.email);
    expect(tokenService.issue).toHaveBeenCalledWith(mockUser, mockSession);
    expect(sessionRepository.save).toHaveBeenCalled();
    expect(refreshTokenRepository.save).toHaveBeenCalled();
  });

  it('이미 존재하는 이메일이면 CONFLICT 예외를 던져야 한다', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    await expect(usecase.execute(dto, 'Chrome', '127.0.0.1')).rejects.toThrow(CustomError);
    await expect(usecase.execute(dto, 'Chrome', '127.0.0.1')).rejects.toMatchObject({
      statusCode: HttpStatus.CONFLICT,
    });
  });

  it('사용자 저장 중 오류 발생 시 INTERNAL_SERVER_ERROR 예외를 던져야 한다', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (UserFactory.createWithHashedPassword as jest.Mock).mockResolvedValue(mockUser);
    (userRepository.save as jest.Mock).mockRejectedValue(new Error('DB save error'));

    await expect(usecase.execute(dto, 'Chrome', '127.0.0.1')).rejects.toThrow(CustomError);
    await expect(usecase.execute(dto, 'Chrome', '127.0.0.1')).rejects.toMatchObject({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });
});
