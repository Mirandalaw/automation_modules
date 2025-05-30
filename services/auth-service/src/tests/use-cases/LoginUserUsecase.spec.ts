import { LoginUserUsecase } from '../../use-cases/LoginUserUsecase';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { ISessionRepository } from '../../repositories/interfaces/ISessionRepository';
import { IRefreshTokenRepository } from '../../repositories/interfaces/IRefreshTokenRepository';
import { TokenService } from '../../services/token.service';
import { mockDeep } from 'jest-mock-extended';
import { User } from '../../entities/User';
import { Session } from '../../entities/Session';
import { CustomError } from '../../common/errors/CustomError';
import { HttpStatus } from '../../constants/httpStatus';
import * as hashUtil from '../../common/utils/hash';
import { SessionFactory } from '../../factories/SessionFactory';
import { RefreshTokenFactory } from '../../factories/RefreshTokenFactory';
import { LoginUserDto } from '../../dtos/LoginUserDto';

jest.mock('../../factories/SessionFactory');
jest.mock('../../factories/RefreshTokenFactory');

const userRepository = mockDeep<IUserRepository>();
const sessionRepository = mockDeep<ISessionRepository>();
const refreshTokenRepository = mockDeep<IRefreshTokenRepository>();
const tokenService = mockDeep<TokenService>();

const usecase = new LoginUserUsecase(
  userRepository,
  sessionRepository,
  refreshTokenRepository,
  tokenService
);

describe('LoginUserUsecase', () => {
  const email = 'test@example.com';
  const password = 'plain-password';
  const ipAddress = '127.0.0.1';
  const userAgent = 'Chrome';

  const dto: LoginUserDto ={
    email,
    password,
    ip : ipAddress,
    userAgent,
  }

  const mockUser = {
    uuid: 'user-uuid-1',
    email,
    name: '홍길동',
    password: 'hashed-password',
  } as User;

  const mockSession = {
    id: 'session-id-1',
    expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  } as Session;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully and return tokens', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    jest.spyOn(hashUtil, 'comparePassword').mockResolvedValue(true);
    (SessionFactory.create as jest.Mock).mockReturnValue(mockSession);
    (tokenService.issue as jest.Mock).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    (RefreshTokenFactory.createWithMeta as jest.Mock).mockReturnValue({} as any);

    const result = await usecase.execute(dto);

    expect(result.success).toBe(true);
    expect(result.data.user.email).toBe(email);
    expect(result.data.tokens.accessToken).toBe('access-token');
  });

  it('should throw if email not found', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(usecase.execute(dto)).rejects.toThrow(CustomError);
    await expect(usecase.execute(dto)).rejects.toMatchObject({
      statusCode: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should throw if password is undefined', async () => {
    const user = { ...mockUser, password: undefined } as User;
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(user);

    await expect(usecase.execute(dto)).rejects.toThrow(CustomError);
    await expect(usecase.execute(dto)).rejects.toMatchObject({
      statusCode: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should throw if password is incorrect', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    jest.spyOn(hashUtil, 'comparePassword').mockResolvedValue(false);

    await expect(usecase.execute(dto)).rejects.toThrow(CustomError);
    await expect(usecase.execute(dto)).rejects.toMatchObject({
      statusCode: HttpStatus.UNAUTHORIZED,
    });
  });
});