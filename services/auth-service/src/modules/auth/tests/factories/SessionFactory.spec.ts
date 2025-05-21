import { SessionFactory } from '../../factories/SessionFactory'
import {User} from '../../../../entities/User';
import { Session } from '../../../../entities/Session';

describe('SessionFactory', () => {
  const mockUser: User = {
    uuid: 'user-uuid-456',
    email: 'session@test.com',
  } as User;

  const userAgent = 'Mozilla/5.0 (Windows NT 10.0)';
  const ip = '192.168.0.100';
  const expiredAt = new Date('2025-12-31T23:59:59Z');

  it('사용자 및 접속 정보를 기반으로 Session 객체를 생성해야 한다', () => {
    const session = SessionFactory.create({
      user: mockUser,
      userAgent,
      ip,
      expiredAt,
    });

    expect(session).toBeInstanceOf(Session);
    expect(session.user).toEqual(mockUser);
    expect(session.userAgent).toBe(userAgent);
    expect(session.ipAddress).toBe(ip);
    expect(session.expiredAt).toBe(expiredAt);
    expect(session.isValid).toBe(true);
    expect(typeof session.id).toBe('string');
    expect(session.id).toHaveLength(36); // UUID v4 길이
  });
});
