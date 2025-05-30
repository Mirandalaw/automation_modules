import { TokenPayloadFactory } from '../../factories/TokenPayloadFactory';
import { User } from '../../entities/User';
import { Session } from '../../entities/Session';
import { AccessTokenPayload, RefreshTokenPayload } from '../../types/jwt';

describe('TokenFPayloadactory', () => {
  const mockUser: User = {
    uuid: 'user-uuid-789',
    roles: [{ name: 'USER' }, { name: 'ADMIN' }],
  } as User;

  const mockSession: Session = {
    id: 'session-id-123',
    userAgent: 'Chrome on macOS',
    ipAddress: '203.0.113.5',
  } as Session;

  describe('buildAccessTokenPayload', () => {
    it('유저 정보를 기반으로 AccessTokenPayload를 생성해야 한다', () => {
      const payload: AccessTokenPayload = TokenPayloadFactory.buildAccessTokenPayload(mockUser);

      expect(payload.userId).toBe(mockUser.uuid);
      expect(payload.roles).toEqual(['USER', 'ADMIN']);
      expect(typeof payload.issuedAt).toBe('number');
      expect(typeof payload.expiresAt).toBe('number');
      expect(payload.expiresAt - payload.issuedAt).toBe(60 * 15); // 15분
    });

    it('유저 역할 정보가 없을 경우 빈 배열을 반환해야 한다', () => {
      const noRoleUser = { uuid: 'no-role-user' } as User;
      const payload = TokenPayloadFactory.buildAccessTokenPayload(noRoleUser);

      expect(payload.roles).toEqual([]);
    });
  });

  describe('buildRefreshTokenPayload', () => {
    it('유저 및 세션 정보를 기반으로 RefreshTokenPayload를 생성해야 한다', () => {
      const payload: RefreshTokenPayload = TokenPayloadFactory.buildRefreshTokenPayload(mockUser, mockSession);

      expect(payload.userId).toBe(mockUser.uuid);
      expect(payload.sessionId).toBe(mockSession.id);
      expect(payload.userAgent).toBe(mockSession.userAgent);
      expect(payload.ipAddress).toBe(mockSession.ipAddress);
      expect(typeof payload.loginAt).toBe('number');
    });
  });
});