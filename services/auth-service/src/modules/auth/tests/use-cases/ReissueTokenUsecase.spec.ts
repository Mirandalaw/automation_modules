import { ReissueTokenUsecase } from '../../use-cases/ReissueTokenUsecase';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { ISessionRepository } from '../../repositories/interfaces/ISessionRepository';
import { IRefreshTokenRepository } from '../../repositories/interfaces/IRefreshTokenRepository';
import { TokenService } from '../../../../services/token.service';
import { ITokenProvider } from '../../providers/interfaces/IJwtProvider';
import { User } from '../../entities/User';
import { CustomError } from '../../../../utils/CustomError';
import { HttpStatus } from '../../../../constants/httpStatus';
import { mockDeep } from 'jest-mock-extended';
import { RefreshTokenPayload } from '../../types/jwt';
import { RefreshTokenFactory } from '../../factories/RefreshTokenFactory';

jest.mock('../../factories/RefreshTokenFactory');

const userRepository = mockDeep<IUserRepository>();
const sessionRepository = mockDeep<ISessionRepository>();
const refreshTokenRepository = mockDeep<IRefreshTokenRepository>();
const tokenService = mockDeep<TokenService>();
const tokenProvider = mockDeep<ITokenProvider>();

const usecase = new ReissueTokenUsecase(
  userRepository,
  sessionRepository,
  refreshTokenRepository,
  tokenService,
  tokenProvider,
);

describe('ReissueTokenUsecase', () => {
  const refreshToken = 'refresh-token-abc';
  const payload: RefreshTokenPayload = {
    userId: 'user-uuid-001',
    sessionId: 'session-id-001',
    userAgent: 'Chrome',
    ipAddress: '127.0.0.1',
    loginAt: Date.now(),
  };

  const mockUser: User = {
    uuid: payload.userId,
    email: 'test@example.com',
    name: '홍길동',
  } as User;

  const mockSession = {
    id: payload.sessionId,
    userAgent: payload.userAgent,
    ipAddress: payload.ipAddress,
    expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('정상적인 refreshToken을 통해 accessToken과 refreshToken을 재발급한다', async () => {
    (tokenProvider.verifyRefreshToken as jest.Mock).mockReturnValue(payload);
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
    (sessionRepository.exists as jest.Mock).mockResolvedValue(true);
    (tokenService.issue as jest.Mock).mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    (RefreshTokenFactory.fromPayload as jest.Mock).mockReturnValue({} as any);

    const result = await usecase.execute(refreshToken);

    expect(result.success).toBe(true);
    expect(result.data.accessToken).toBe('new-access-token');
    expect(result.data.refreshToken).toBe('new-refresh-token');
  });

  it('토큰이 유효하지 않으면 CustomError를 던진다', async () => {
    tokenProvider.verifyRefreshToken.mockImplementation(() => { throw new Error('Invalid token'); });

    await expect(usecase.execute(refreshToken)).rejects.toThrow(CustomError);
    await expect(usecase.execute(refreshToken)).rejects.toMatchObject({ statusCode: HttpStatus.UNAUTHORIZED });
  });

  it('사용자를 찾을 수 없으면 CustomError를 던진다', async () => {
    (tokenProvider.verifyRefreshToken as jest.Mock).mockReturnValue(payload);
    (userRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(usecase.execute(refreshToken)).rejects.toThrow(CustomError);
    await expect(usecase.execute(refreshToken)).rejects.toMatchObject({ statusCode: HttpStatus.UNAUTHORIZED });
  });

  it('세션이 존재하지 않으면 CustomError를 던진다', async () => {
    (tokenProvider.verifyRefreshToken as jest.Mock).mockReturnValue(payload);
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
    (sessionRepository.exists as jest.Mock).mockResolvedValue(false);

    await expect(usecase.execute(refreshToken)).rejects.toThrow(CustomError);
    await expect(usecase.execute(refreshToken)).rejects.toMatchObject({ statusCode: HttpStatus.UNAUTHORIZED });
  });
});

