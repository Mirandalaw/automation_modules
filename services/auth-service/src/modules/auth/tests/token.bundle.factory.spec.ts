import { TokenBundleFactory } from '../factories/token.bundle.facotry';
import { User } from '../../../entities/User';
import { Session } from '../../../entities/Session';
import { TokenService } from '../../../services/token.service';


jest.mock('../../../services/token.service');

describe('TokenBundleFactory', () => {
  const mockUser = { uuid: 'user_uuid' } as User;
  const mockSession = { id: 'session_uuid' } as Session;
  const tokenServiceMock = new TokenService() as jest.Mocked<TokenService>;
  const factory = new TokenBundleFactory(tokenServiceMock);

  it('accessToken과 refreshToken을 포함한 토큰 묶음을 생성해야 한다', async () => {
    tokenServiceMock.issue.mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    });

    const result = await factory.create(mockUser, mockSession);

    expect(result.accessToken).toBe('mock-access-token');
    expect(result.refreshToken).toBe('mock-refresh-token');
    expect(tokenServiceMock.issue).toHaveBeenCalledWith(mockUser, mockSession);
  });

});