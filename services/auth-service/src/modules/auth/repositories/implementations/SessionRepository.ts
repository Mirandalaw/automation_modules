import { ISessionRepository } from '../interfaces/ISessionRepository';
import { Session } from '../../../../entities/Session';
import redis from '../../../../utils/redis';
import logger from '../../../../utils/logger';

/**
 * SessionRepository
 * - Redis 기반 세션 저장소
 * - 사용자의 세션 생성, 삭제 등을 Redis에 저장/관리
 * - key 형식: session:{userId}:{sessionId}
 */
export class SessionRepository implements ISessionRepository {
  private readonly prefix = 'session';

  /**
   * 세션을 Redis에 저장할 때 사용할 Key를 생성
   * @param session Session 엔티티
   * @returns Redis key (예: session:uuid-user:uuid-session)
   */
  private getKey(session: Session): string{
    return `${this.prefix}:${session.user.uuid}:${session.id}`;
  }

  /**
   * 특정 사용자 ID로 시작하는 모든 세션 키를 조회하여 무효화 (삭제)
   * - 중복 로그인 방지 또는 전체 로그아웃 처리 시 사용
   * @param userId 사용자 UUID
   */
  async invalidateAllByUserId(userId: string): Promise<void> {
    const pattern = `${this.prefix}:${userId}:*`;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`[SessionRepository] ${keys.length}개 세션 삭제됨: ${userId}`);
      }
    } catch (error: any) {
      logger.error(`[SessionRepository] 세션 삭제 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 새로운 세션을 Redis에 저장
   * - TTL 기반으로 자동 만료 설정
   * - 저장 형식은 value 없이 1(string)만 저장하여 존재 여부 확인만 수행 가능
   * @param session 세션 엔티티
   */
  async save(session: Session): Promise<void> {
    const key = this.getKey(session);
    try {
      await redis.set(key, '1', 'EX', this.getTTL(session.expiredAt));
      logger.info(`[SessionRepository] 세션 저장: ${key}`);
    } catch (error: any) {
      logger.error(`[SessionRepository] 세션 저장 실패: ${key}, ${error.message}`);
      throw error;
    }
  }
  /**
   * 세션 키 존재 여부 확인
   * - Redis에 session:{userId}:{sessionId} 형식으로 저장된 키가 있는지 검사
   * @param sessionId 세션 ID
   * @param userId 사용자 UUID
   * @returns 존재 여부 (boolean)
   */
  async exists(sessionId: string, userId: string): Promise<boolean> {
    const key = `${this.prefix}:${userId}:${sessionId}`;
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error: any) {
      logger.error(`[SessionRepository] 세션 존재 확인 실패: ${key}, error=${error.message}`);
      return false;
    }
  }

  /**
   * 세션 만료 시간을 기반으로 TTL을 초 단위로 계산
   * - 최소 TTL은 1초 보장
   * @param expiredAt 세션 만료 일시
   * @returns TTL in seconds
   */
  private getTTL(expiredAt: Date): number {
    const ttl = Math.floor((expiredAt.getTime() - Date.now()) / 1000);
    return Math.max(ttl, 1); // 최소 1초
  }
}