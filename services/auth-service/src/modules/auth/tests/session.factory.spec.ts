import { SessionFactory } from '../factories/session.factory';
import { User } from '../../../entities/User';
import * as sessionUtil from "../../../utils/session"

jest.mock('../../../utils/session');

describe('SessionFactory',()=>{
  const mockUser = {uuid: 'test-uuid'} as User;

  beforeAll(()=>{
    jest.resetAllMocks();
  });

  it('user, userAgent, ipAddress를 기반으로 Session Entity를 생성해야 한다.',() =>{
    const mockSessionData = {
      id: 'session-id',
      userAgent: 'Chrome/123',
      ipAddress: '127.0.0.1',
      isValid: true,
      expiredAt: new Date('2099-12-31T23:59:59Z'),
    };
    (sessionUtil.createSession as jest.Mock).mockReturnValue(mockSessionData);

    const session = SessionFactory.create(mockUser, 'Chrome/123', '127.0.0.1');

    expect(session.id).toBe(mockSessionData.id);
    expect(session.userAgent).toBe(mockSessionData.userAgent);
    expect(session.ipAddress).toBe(mockSessionData.ipAddress);
    expect(session.isValid).toBe(true);
    expect(session.expiredAt).toEqual(mockSessionData.expiredAt);
    expect(session.user).toBe(mockUser);
  })
})