import { AccessTokenPayload, RefreshTokenPayload } from '../../../../types/jwt';
import * as jwt from 'jsonwebtoken';
import { JwtProvider } from '../../providers/implementations/JwtProvider';

jest.mock('jsonwebtoken');

describe('JwtProvider', () => {
  const accessPayload: AccessTokenPayload = {
    userId: 'user-uuid-abc',
    roles: ['USER'],
    issuedAt: 1710000000,
    expiresAt: 1710000900,
  };

  let refreshPayload: RefreshTokenPayload;
  refreshPayload = {
    userId: 'user-uuid-abc',
    sessionId: 'session-xyz',
    userAgent: 'Chrome',
    ipAddress: '192.168.1.1',
    loginAt: 1710000000,
  };

  const mockAccessToken = 'mock.access.token';
  const mockRefreshToken = 'mock.refresh.token';
  const mockDecodedPayload = { sub: 'test' };

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('AccessToken을 서명해야 한다', () => {
    (jwt.sign as jest.Mock).mockReturnValue(mockAccessToken);
    const provider = new JwtProvider();

    const token = provider.signAccessToken(accessPayload);

    expect(jwt.sign).toHaveBeenCalledWith(
      accessPayload,
      'test-access-secret',
      expect.objectContaining({ expiresIn: expect.anything() }),
    );
    expect(token).toBe(mockAccessToken);
  });

  it('RefreshToken을 서명해야 한다', () => {
    (jwt.sign as jest.Mock).mockReturnValue(mockRefreshToken);
    const provider = new JwtProvider();

    const token = provider.signRefreshToken(refreshPayload);

    expect(jwt.sign).toHaveBeenCalledWith(
      refreshPayload,
      'test-refresh-secret',
      expect.objectContaining({ expiresIn: expect.anything() }),
    );
    expect(token).toBe(mockRefreshToken);
  });

  it('JWT를 decode할 수 있어야 한다', () => {
    (jwt.decode as jest.Mock).mockReturnValue(mockDecodedPayload);
    const provider = new JwtProvider();

    const result = provider.decode('sample.token');

    expect(jwt.decode).toHaveBeenCalledWith('sample.token');
    expect(result).toEqual(mockDecodedPayload);
  });

  it('AccessToken을 성공적으로 verify해야 한다', () => {
    (jwt.verify as jest.Mock).mockReturnValue(accessPayload);
    const provider = new JwtProvider();

    const result = provider.verifyAccessToken('valid.access.token');

    expect(jwt.verify).toHaveBeenCalledWith('valid.access.token', 'test-access-secret');
    expect(result).toEqual(accessPayload);
  });

  it('AccessToken 검증 실패 시 예외를 던져야 한다', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    const provider = new JwtProvider();
    expect(() => provider.verifyAccessToken('invalid')).toThrow('AccessToken is invalid');
  });

  it('RefreshToken을 성공적으로 verify해야 한다', () => {
    (jwt.verify as jest.Mock).mockReturnValue(refreshPayload);
    const provider = new JwtProvider();

    const result = provider.verifyRefreshToken('valid.refresh.token');

    expect(jwt.verify).toHaveBeenCalledWith('valid.refresh.token', 'test-refresh-secret');
    expect(result).toEqual(refreshPayload);
  });

  it('RefreshToken 검증 실패 시 예외를 던져야 한다', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    const provider = new JwtProvider();
    expect(() => provider.verifyRefreshToken('invalid')).toThrow('RefreshToken is invalid');
  });
});