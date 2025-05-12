import { Session } from '../../../entities/Session';
import { createSession } from '../../../utils/session';
import { User } from '../../../entities/User';
import logger from '../../../utils/logger';
/**
 * SessionFactory => User와 브라우저 정보를 기반으로 Session Entity를 생성.
 * - UUID, userAgent, ipAddress, 만료 시간 등을 포함
 */
export class SessionFactory{
  static create(user: User, userAgent : string, ipAddress: string): Session {
    logger.debug(`[SessionFactory] 세션 생성: userId=${user.uuid}, ip=${ipAddress}`);

    const data = createSession(user.uuid,userAgent,ipAddress);
    const session = new Session();
    session.id = data.id;
    session.userAgent = data.userAgent;
    session.ipAddress = data.ipAddress;
    session.isValid = data.isValid;
    session.expiredAt = data.expiredAt;
    session.user = user;


    return session;
  }
}