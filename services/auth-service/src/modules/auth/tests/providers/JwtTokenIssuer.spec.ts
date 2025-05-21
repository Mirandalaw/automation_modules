import { AccessTokenPayload, RefreshTokenPayload } from '../../../../types/jwt';
import * as jwt from 'jsonwebtoken';
import { JwtTokenIssuer } from '../../providers/implementations/JwtTokenIssuer';

jest.mock('jsonwebtoken');

describe('JwtTokenIssuer', () => {
  const accessToken = 'mocked.access.token';
  const refreshToken = 'mocked.refresh.token';

  const accessPayload: AccessTokenPayload = {
    userId: 'user-uuid-123',
    roles: ['USER'],
    issuedAt: Math.floor(Date.now() / 1000),
    expiresAt: Math.floor(Date.now() / 1000) + 900,
  };

  const refreshPayload: RefreshTokenPayload = {
    userId: 'user-uuid-123',
    sessionId: 'session-abc',
    userAgent: 'Chrome on Windows',
    ipAddress: '192.168.0.1',
    loginAt: Date.now(),
  };

  beforeEach(() => {
    (jwt.sign as jest.Mock).mockImplementation((payload) => {
      if ('sessionId' in payload) return refreshToken;
      return accessToken;
    });
  });

  it('AccessToken을 정상적으로 서명해야 한다', () => {
    const issuer = new JwtTokenIssuer();
    const token = issuer.signAccessToken(accessPayload);

    expect(jwt.sign).toHaveBeenCalledWith(
      accessPayload,
      expect.any(String),
      expect.objectContaining({ expiresIn: expect.any(String) })
    );
    expect(token).toBe(accessToken);
  });

  it('RefreshToken을 정상적으로 서명해야 한다', () => {
    const issuer = new JwtTokenIssuer();
    const token = issuer.signRefreshToken(refreshPayload);

    expect(jwt.sign).toHaveBeenCalledWith(
      refreshPayload,
      expect.any(String),
      expect.objectContaining({ expiresIn: expect.any(String) })
    );
    expect(token).toBe(refreshToken);
  });
});