import { Session } from '../../../../entities/Session';

export interface ISessionRepository {
  invalidateAllByUserId(userId: string): Promise<void>;
  save(session: Session): Promise<void>;
  exists(sessionId: string, userId: string): Promise<boolean>
}