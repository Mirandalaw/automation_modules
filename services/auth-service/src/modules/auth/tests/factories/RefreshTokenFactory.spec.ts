import { RefreshTokenFactory } from '../../factories/RefreshTokenFactory';
import { User } from '../../../../entities/User';
import { RefreshTokenPayload } from '../../../../types/jwt';
import { RefreshToken } from '../../../../entities/RefreshToken';

describe('RefreshTokenFactory', ()=>{
  const mockUser : User ={
    uuid: 'user-uuid-123',
    email: 'test@example.com'
  } as User;

  const token = 'sample.refresh.token';
  const userAgent = 'Mozilla/5.0';
  const ip = '127.0.0.1';
  const expiredAt = new Date('2025-12-31T23:59:59Z');

  describe('createWithMeta',() =>{
    it('사용자 및 접속 정보 기반으로 RefreshToken을 생성해야 한다.',() =>{
      const result = RefreshTokenFactory.createWithMeta(mockUser,token,userAgent,ip,expiredAt);

      expect(result).toBeInstanceOf(RefreshToken);
      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe(token);
      expect(result.userAgent).toBe(userAgent);
      expect(result.ip).toBe(ip);
      expect(result.expiredAt).toBe(expiredAt);
    })
  })

  describe('fromPayload', () => {
    const payload: RefreshTokenPayload = {
      userId: mockUser.uuid,
      sessionId: 'session-id-abc',
      userAgent: 'Chrome',
      ipAddress: '192.168.0.1',
      loginAt: Date.now(),
      deviceId: 'device-123',
      platform: 'web',
      location: 'Seoul',
      version: '1.2.3',
    };

    it('RefreshTokenPayload 값을 기반으로 RefreshToken을 생성해야 한다', () => {
      const result = RefreshTokenFactory.fromPayload(mockUser, token, expiredAt, payload);

      expect(result).toBeInstanceOf(RefreshToken);
      expect(result.token).toBe(token);
      expect(result.user).toEqual(mockUser);
      expect(result.userAgent).toBe(payload.userAgent);
      expect(result.ip).toBe(payload.ipAddress);
      expect(result.expiredAt).toBe(expiredAt);
      expect(result.sessionId).toBe(payload.sessionId);
      expect(result.deviceId).toBe(payload.deviceId);
      expect(result.platform).toBe(payload.platform);
      expect(result.location).toBe(payload.location);
      expect(result.version).toBe(payload.version);
    });

    it('선택적 필드가 없을 경우에도 문제 없이 생성되어야 한다', () => {
      const minimalPayload: RefreshTokenPayload = {
        userId:mockUser.uuid,
        sessionId: 'session-minimal',
        userAgent: 'Safari',
        ipAddress: '10.0.0.1',
        loginAt:Date.now(),
      };

      const result = RefreshTokenFactory.fromPayload(mockUser, token, expiredAt, minimalPayload);


      expect(result.deviceId).toBeUndefined();
      expect(result.platform).toBeUndefined();
      expect(result.location).toBeUndefined();
      expect(result.version).toBeUndefined();
    });
  });
})