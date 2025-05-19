import { JwtProvider } from '../../providers/implementations/JwtProvider';
import { AccessTokenPayload, RefreshTokenPayload } from '../../../../types/jwt';
import { ITokenProvider } from '../../providers/interfaces/IJwtProvider';

describe('JwtProvider', () => {
  let provider: ITokenProvider;

  beforeAll(() => {
    provider = new JwtProvider();
  });

  const accessPayload: AccessTokenPayload = {
    userId: 'user-uuid',
    roles: ['USER'],
    issuedAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 15, // 15분 후
  };

  const refreshPayload: RefreshTokenPayload = {
    userId: 'user-uuid',
    sessionId: 'session-uuid',
    userAgent: 'Mozilla/5.0',
    ipAddress: '127.0.0.1',
    loginAt: Date.now(),
    deviceId: 'device-123',
    platform: 'web',
    location: '서울시 강남구',
    version: '1.0.0',
  };

  it('accessToken을 정상적으로 생성해야 한다', () => {
    const token = provider.signAccessToken(accessPayload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('refreshToken을 정상적으로 생성해야 한다', () => {
    const token = provider.signRefreshToken(refreshPayload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('accessToken을 디코드하면 payload가 포함되어야 한다', () => {
    const token = provider.signAccessToken(accessPayload);
    const decoded = provider.decode(token);
    expect(decoded).toHaveProperty('userId', accessPayload.userId);
    expect(decoded).toHaveProperty('roles');
    expect(decoded).toHaveProperty('issuedAt');
    expect(decoded).toHaveProperty('expiresAt');
  });

  it('refreshToken을 디코드하면 payload가 포함되어야 한다', () => {
    const token = provider.signRefreshToken(refreshPayload);
    const decoded = provider.decode(token);
    expect(decoded).toHaveProperty('userId', refreshPayload.userId);
    expect(decoded).toHaveProperty('sessionId');
    expect(decoded).toHaveProperty('userAgent');
    expect(decoded).toHaveProperty('ipAddress');
    expect(decoded).toHaveProperty('loginAt');
    expect(decoded).toHaveProperty('deviceId');
    expect(decoded).toHaveProperty('platform');
    expect(decoded).toHaveProperty('location');
    expect(decoded).toHaveProperty('version');
  });

  it('accessToken을 verify하면 정상적으로 payload 반환해야 한다', () => {
    const token = provider.signAccessToken(accessPayload);
    const verified = provider.verifyAccessToken(token);
    expect(verified.userId).toBe(accessPayload.userId);
  });
});

