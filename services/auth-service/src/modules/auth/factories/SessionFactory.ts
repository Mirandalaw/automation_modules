import { Session } from '../entities/Session';
import { User } from '../entities/User';
import logger from '../../../common/logger';
import { v4 as uuidv4 } from 'uuid';

interface CreateSessionInput {
  user:User;
  userAgent : string;
  ip : string;
  expiredAt: Date;
}

/**
 * SessionFactory
 *
 * - 로그인 성공 시 유저 정보와 접속 환경 기반으로 Session Entity를 생성
 * - UUID, UserAgent, IP, 만료일 등을 포함하며 isValid는 기본 true
 * - 생성된 Session은 Redis/DB에 저장되어 중복 로그인 방지 등에도 활용됨
 */

export class SessionFactory{
  static create(input:CreateSessionInput): Session {
    const {user,userAgent, ip, expiredAt} = input;

    logger.debug(`[SessionFactory] 세션 생성: userId=${user.uuid}, ip=${ip}`);

    const session = new Session();
    session.id = uuidv4();
    session.userAgent = userAgent;
    session.ipAddress = ip;
    session.expiredAt = expiredAt;
    session.isValid = true;
    session.user = user;

    return session;
  }
}