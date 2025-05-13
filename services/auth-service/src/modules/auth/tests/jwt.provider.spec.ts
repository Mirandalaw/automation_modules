import { JwtProvider } from '../providers/jwt.provider';
import { AccessTokenPayload, RefreshTokenPayload } from '../../../types/jwt';

describe('JwtProvider', () => {
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
    const token = JwtProvider.signAccessToken(accessPayload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('refreshToken을 정상적으로 생성해야 한다', () => {
    const token = JwtProvider.signRefreshToken(refreshPayload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('accessToken을 디코드하면 payload가 포함되어야 한다', () => {
    const token = JwtProvider.signAccessToken(accessPayload);
    const decoded = JwtProvider.decode(token);
    expect(decoded).toHaveProperty('userId', accessPayload.userId);
    expect(decoded).toHaveProperty('roles');
    expect(decoded).toHaveProperty('issuedAt');
    expect(decoded).toHaveProperty('expiresAt');
  });

  it('refreshToken을 디코드하면 payload가 포함되어야 한다', () => {
    const token = JwtProvider.signRefreshToken(refreshPayload);
    const decoded = JwtProvider.decode(token);
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
});

