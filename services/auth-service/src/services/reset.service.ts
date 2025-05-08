import { sendEmail } from '../utils/sendEmail';
import logger from '../utils/logger';
import { CustomError } from '../utils/CustomError';
import redis from '../utils/redis';

/**
 * ResetCodeService
 * - 비밀번호 재설정을 위한 인증 코드 발급 및 검증 서비스
 * - 인증 실패 횟수 관리, 인증 완료 처리까지 책임짐
 */
export class ResetCodeService {
  private readonly CODE_EXPIRY_SECONDS = 300; // 인증코드 유효시간 : 5분
  private readonly FAIL_LIMIT = 5; // 인증 실패 제한 횟수
  private readonly FAIL_RESET_AFTER = 300; // 실패 횟수 리셋 시간 : 5분

  /**
   * 인증 코드 생성 및 이메일 발송
   * @param email 대상 사용자 이메일
   */
  async send(email: string): Promise<void> {
    const code = this.generateCode();
    logger.info(`[ResetCodeService] 인증 코드 생성: email=${email}, code=${code}`);
    try {
      await redis.set(`reset:${email}`, code, 'EX', this.CODE_EXPIRY_SECONDS);
      logger.info(`[ResetCodeService] Redis 저장 완료: email=${email}`);
    } catch (error) {
      logger.error(`[ResetCodeService] Redis 저장 실패: ${(error as Error).message}`);
      throw new CustomError(500, '비밀번호 재설정 코드 저장 중 오류 발생');
    }

    try {
      await sendEmail(email, '비밀번호 재설정 인증코드', `인증코드: ${code}`);
      logger.info(`[ResetCodeService] 이메일 전송 완료: email=${email}`);
    } catch (error) {
      logger.error(`[ResetCodeService] 이메일 전송 실패: ${(error as Error).message}`);
      throw new CustomError(500, '비밀번호 재설정 코드 이메일 전송 오류');
    }
  }

  /**
   * 인증 코드 검증
   * @param email 사용자 이메일
   * @param code 제출한 인증 코드
   */

  async verify(email: string, code: string): Promise<void> {
    const failCountKey = `reset:failcount:${email}`;

    // 실패 횟수 가져오기
    let failCount = 0;
    try{
      failCount = await this.getFailCount(failCountKey);
      logger.info(`[ResetCodeService] 인증 시도: email=${email}, 실패횟수=${failCount}`);
    }catch(error){
      logger.error(`[ResetCodeService] Redis 실패 횟수 조회 실패: ${(error as Error).message}`);
      throw new CustomError(500, '서버 오류로 인증을 진행할 수 없습니다.');
    }

    if (failCount >= this.FAIL_LIMIT) {
      logger.warn(`[ResetCodeService] 인증 시도 초과: email=${email}, count=${failCount}`);
      throw new CustomError(429, '인증 시도 횟수를 초과했습니다.');
    }

    // 인증 코드 가져오기
    let savedCode : string | null = null;
    try{
      savedCode = await redis.get(`reset:${email}`);
      logger.info(`[ResetCodeService] 저장된 인증 코드 조회: email=${email}, 존재여부=${!!savedCode}`);
    } catch (error) {
      logger.error(`[ResetCodeService] Redis 인증 코드 조회 실패: ${(error as Error).message}`);
      throw new CustomError(500, '서버 오류로 인증 코드 조회 실패');
    }

    if (!savedCode) {
      logger.warn(`[ResetCodeService] 인증 코드 없음 또는 만료됨: email=${email}`);
      throw new CustomError(400, '인증 코드가 만료되었거나 존재하지 않습니다.');
    }

    // 인증 코드 불일치
    if (savedCode !== code) {
      try{
        await this.increaseFailCount(failCountKey);
        if (failCount + 1 >= 3) {
          await redis.del(`reset:${email}`);
          logger.info(`[ResetCodeService] 인증 실패 3회 초과 - 인증 코드 삭제: email=${email}`);
        }
        logger.info(`[ResetCodeService] 인증 실패 횟수 증가: email=${email}`);
      }catch(error) {
        logger.error(`[ResetCodeService] 실패 처리 중 Redis 오류: ${(error as Error).message}`);
      }

      logger.warn(`[ResetCodeService] 인증 실패 - 불일치: email=${email}, 입력=${code}, 저장=${savedCode}`);
      throw new CustomError(400, '인증 코드가 일치하지 않습니다.');
    }

    // 인증 성공 처리
    try{
      await redis.del(failCountKey);
      await redis.del(`reset:${email}`);
      await redis.set(`reset:verified:${email}`, 'true', 'EX', 600);
      logger.info(`[ResetCodeService] 인증 성공 및 상태 저장 완료: email=${email}`);
    }catch(error){
      logger.error(`[ResetCodeService] 인증 성공 처리 중 Redis 오류: ${(error as Error).message}`);
      throw new CustomError(500, '인증 완료 처리 중 서버 오류 발생');
    }
  }

  /**
   * 6자리 인증 코드 생성
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async getFailCount(key: string): Promise<number> {
    const value = await redis.get(key);
    const count = value ? Number(value) : 0;
    logger.debug(`[ResetCodeService] 실패 횟수 조회: key=${key}, count=${count}`);
    return count;
  }

  /**
   * 실패 횟수 증가 및 만료 설정
   */
  private async increaseFailCount(key: string): Promise<void> {
    await redis.incr(key);
    await redis.expire(key, this.FAIL_RESET_AFTER);
    logger.info(`[ResetCodeService] 실패 횟수 증가: key=${key}, TTL=${this.FAIL_RESET_AFTER}s`);
  }
}
