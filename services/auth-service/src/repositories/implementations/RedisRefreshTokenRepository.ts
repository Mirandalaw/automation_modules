import { RefreshTokenPayload } from '../../types/jwt';
import redis from '../../common/redis';
import logger from '../../common/logger';
import { IRefreshTokenStore } from '../interfaces/IRefreshTokenStore';

/**
 * RefreshTokenRepository
 * - Redis를 이용해 사용자별 RefreshToken을 저장, 조회, 삭제하는 저장소
 * - key는 'refreshToken:{userId}' 형태로 구성되어 있으며 TTL(Time To Live)을 기준으로 자동 만료됨
 */
export class RedisRefreshTokenRepository implements IRefreshTokenStore {
  // Redis key prefix
  private readonly prefix = 'refreshToken';

  /**
   * userId 기반으로 Redis에 저장할 key를 생성합니다
   * @param userId 사용자 UUID
   * @returns Redis key (예: refreshToken:1234-5678-uuid)
   */

  private getKey(userId: string,sessionId?:string): string {
    // 멀티 디바이스 로그인, 동시 로그인 감시, 특정 세션 무효화 추가시 sessionId까지 키에 포함시켜야함
    return sessionId ? `${this.prefix}:${userId}:${sessionId}` : `${this.prefix}:${userId}`;
  }

  /**
   * RefreshToken을 Redis에 저장합니다
   * - JSON 문자열로 직렬화하여 저장
   * - expiredAt 기반 TTL 설정
   *
   * @param userId 사용자 ID
   * @param payload RefreshToken에 대한 정보 (token, ip, userAgent, 만료시간 등)
   */
  async save(
    userId: string,
    payload: RefreshTokenPayload & { token: string; expiredAt: number },
  ): Promise<void> {
    const key = this.getKey(userId);
    const ttl = this.calculateTTL(payload.expiredAt);

    try {
      await redis.set(key, JSON.stringify(payload), 'EX', ttl);
      logger.info(`[RedisRefreshTokenRepository] 저장 완료: ${key}`);
    } catch (error: any) {
      logger.error(`[RedisRefreshTokenRepository] 저장 실패: ${key}, error=${error.message}`);
      throw error;
    }
  }

  /**
   * Redis에서 해당 userId에 대한 RefreshToken 정보를 조회합니다
   *
   * @param userId 사용자 ID
   * @returns 저장된 RefreshTokenPayload 객체 또는 null
   */
  async find(
    userId: string,
  ): Promise<(RefreshTokenPayload & { token: string; expiredAt: number }) | null> {
    const key = this.getKey(userId);
    try {
      const data = await redis.get(key);

      if (!data) {
        logger.info(`[RedisRefreshTokenRepository] 조회 실패: ${key} (값 없음)`);
        return null;
      }

      const parsed = JSON.parse(data);
      logger.info(`[RedisRefreshTokenRepository] 조회 성공: ${key}`);
      return parsed;
    } catch (error: any) {
      logger.error(`[RedisRefreshTokenRepository] 조회 또는 파싱 실패: ${key}, error=${error.message}`);
      return null;
    }
  }

  /**
   * Redis에서 해당 userId의 RefreshToken 정보를 삭제합니다
   *
   * @param userId 사용자 ID
   */
  async delete(userId: string): Promise<void> {
    const key = this.getKey(userId);
    try {
      await redis.del(key);
      logger.info(`[RedisRefreshTokenRepository] 삭제 완료: ${key}`);
    } catch (error: any) {
      logger.error(`[RedisRefreshTokenRepository] 삭제 실패: ${key}, error=${error.message}`);
      throw error;
    }
  }

  /**
   * TTL 계산 함수
   * - expiredAt (밀리초 timestamp) 기준으로 현재 시간과의 차이를 계산해 초 단위 TTL 반환
   *
   * @param expiredAt 만료 시간 (timestamp in ms)
   * @returns TTL in seconds (최소 60초 보장)
   */
  private calculateTTL(expiredAt: number): number {
    const ttl = Math.floor((expiredAt - Date.now()) / 1000);
    return Math.max(ttl, 60); // 최소 1분 보장
  }
}