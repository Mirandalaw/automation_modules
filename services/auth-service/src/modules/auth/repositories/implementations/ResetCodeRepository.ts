import { IResetCodeRepository } from '../interfaces/IResetCodeRepository';
import redis from '../../../../utils/redis';
import logger from '../../../../utils/logger';

/**
 * ResetCodeRepository
 * - 이메일을 기반으로 인증 코드를 Redis에 저장/조회/삭제합니다.
 * - 일반적으로 비밀번호 재설정 시 사용되며, TTL 기반의 일회성 코드를 다룹니다.
 */
export class ResetCodeRepository implements IResetCodeRepository {
  private readonly prefix = 'resetCode';

  /**
   * Redis 키 생성기
   * @param email 사용자 이메일
   * @returns Redis key 문자열 (예: resetCode:test@example.com)
   */
  private getKey(email: string): string {
    return `${this.prefix}:${email}`;
  }

  /**
   * 인증 코드를 Redis에 저장합니다.
   * - 기본 TTL은 300초(5분)이며, 인증 유효 시간은 필요에 따라 조절 가능
   * @param email 대상 사용자 이메일
   * @param code 인증 코드 문자열
   * @param ttlSeconds TTL(초), 기본값 300초
   */
  async save(email: string, code: string, ttlSeconds = 300): Promise<void> {
    const key = this.getKey(email);
    try {
      await redis.set(key, code, 'EX', ttlSeconds);
      logger.info(`[ResetCodeStore] 인증 코드 저장 완료: ${key} (TTL=${ttlSeconds}s)`);
    } catch (error: any) {
      logger.error(`[ResetCodeStore] 인증 코드 저장 실패: ${key}, error=${error.message}`);
      throw error;
    }
  }

  /**
   * Redis에서 인증 코드를 조회합니다.
   * - 값이 존재하지 않으면 null 반환
   * @param email 사용자 이메일
   * @returns 인증 코드 문자열 또는 null
   */
  async find(email: string): Promise<string | null> {
    const key = this.getKey(email);
    try {
      const code = await redis.get(key);
      if (!code) {
        logger.info(`[ResetCodeStore] 인증 코드 없음: ${key}`);
        return null;
      }
      logger.info(`[ResetCodeStore] 인증 코드 조회 성공: ${key}`);
      return code;
    } catch (error: any) {
      logger.error(`[ResetCodeStore] 인증 코드 조회 실패: ${key}, error=${error.message}`);
      throw error;
    }
  }

  /**
   * Redis에서 인증 코드를 삭제합니다.
   * - 인증 완료 또는 만료 시 호출
   * @param email 사용자 이메일
   */
  async delete(email: string): Promise<void> {
    const key = this.getKey(email);
    try {
      await redis.del(key);
      logger.info(`[ResetCodeStore] 인증 코드 삭제 완료: ${key}`);
    } catch (error: any) {
      logger.error(`[ResetCodeStore] 인증 코드 삭제 실패: ${key}, error=${error.message}`);
      throw error;
    }
  }
}