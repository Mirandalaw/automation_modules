import { ISessionRepository } from '../interfaces/ISessionRepository';
import {Session } from '../../../../entities/Session';
import { redisClient } from '/config/redis';
import logger from '../../../../utils/logger';


export class SessionRepository implements ISessionRepository {
  private readonly prefix = 'session';

  async invalidateAllByUserId(userId: string): Promise<void> {
    const pattern = `${this.prefix}:${userId}:*`;
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.info(`[SessionRepository] ${keys.length}개 세션 삭제됨: ${userId}`);
    }
  }

  async save(session: Session): Promise<void> {
    const key = `${this.prefix}:${session.userId}:${session.refreshToken}`;
    await redisClient.set(key, '1', 'EX', this.getTTL(session.expiredAt));
    logger.info(`[SessionRepository] 세션 저장: ${key}`);
  }

  private getTTL(expiredAt: Date): number {
    const ttl = Math.floor((expiredAt.getTime() - Date.now()) / 1000);
    return Math.max(ttl, 1); // 최소 1초
  }
}