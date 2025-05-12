import { RefreshTokenFactory } from '../factories/refresh.token.factory';
import { User } from '../../../entities/User';
import { RefreshToken } from '../../../entities/RefreshToken';

describe('RefreshTokenFactory',()=>{
  const mockUser = {uuid: 'user-uuid'} as User;

  it('사용자와 환경 정보를 기반으로 RefreshToken Entitiy를 생성해야 한다.',() =>{
    const token = 'mock-refresh-token';
    const userAgent = 'Chrome/123';
    const ipAddress = '127.0.0.1';
    const expiredAt = new Date('2099-12-31T23:59:59Z');

    const entity: RefreshToken = RefreshTokenFactory.create(
      mockUser,
      token,
      userAgent,
      ipAddress,
      expiredAt,
    );

    expect(entity.token).toBe(token);
    expect(entity.user).toBe(mockUser);
    expect(entity.userAgent).toBe(userAgent);
    expect(entity.ip).toBe(ipAddress);
    expect(entity.expiredAt).toEqual(expiredAt);
  });
});