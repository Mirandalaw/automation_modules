import { IUserStatsRepository } from '../repositories/interfaces/IUserStatsRepository';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { UserGrade } from '../entities/UserStats';
import { UserStatsFactory } from '../factories/UserStatsFactory';
import logger from '../common/logger';

/**
 * 등급 기준 정의
 */
const gradeRules = [
  { grade: UserGrade.BRONZE, minTradeCount: 0, minTradeAmount: 0 },
  { grade: UserGrade.SILVER, minTradeCount: 10, minTradeAmount: 100000 },
  { grade: UserGrade.GOLD, minTradeCount: 100, minTradeAmount: 1000000 },
  { grade: UserGrade.PLATINUM, minTradeCount: 300, minTradeAmount: 5000000 },
  { grade: UserGrade.DIAMOND, minTradeCount: 500, minTradeAmount: 10000000 }
];

/**
 * GradeService
 * - 사용자 등급 및 통계 생성/계산 담당 서비스
 */
export class GradeService {
  constructor(
    private readonly statsRepository: IUserStatsRepository,
    private readonly userRepository: IUserRepository
  ) {
  }

  /**
   * 회원가입 직후 호출되어 초기 UserStats를 생성
   * @param userUUID 유저의 ID
   */
  async createInitialStats(userUUID: string): Promise<void> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 500;

    let user = null;

    // TODO : 추후 retry 유틸로 분리하기!
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      user = await this.userRepository.findByUUID(userUUID);
      if (user) break;

      if (attempt < MAX_RETRIES) {
        logger.warn(`[GradeService] 사용자 조회 실패: uuid=${userUUID}, 재시도 중 (${attempt}/${MAX_RETRIES})`);
        await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      } else {
        logger.error(`[GradeService] 최대 재시도 초과 - 사용자 조회 실패: uuid=${userUUID}`);
        return;
      }
    }

    if (!user) {
      logger.error(`[GradeService] 예상치 못한 null 사용자`);
      return;
    }
    try {
      const stats = UserStatsFactory.createDefault(user);

      await this.statsRepository.save(stats);
      logger.info(`[GradeService] UserStats 초기화 완료: uuid=${userUUID}`);
    } catch (error) {
      logger.error(`[GradeService] UserStats 저장 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * 사용자 등급 및 다음 등급 조건 조회
   * @param userUUID 사용자 UUID
   * @returns 현재 등급 정보 + 다음 조건
   */
  async getUserGradeInfo(userUUID: string) {
    const stats = await this.statsRepository.findByUserUUID(userUUID);
    if (!stats) {
      throw new Error('등급 정보가 존재하지 않습니다.');
    }

    const currentIndex = gradeRules.findIndex(rule => rule.grade === stats.grade);
    const next = gradeRules[currentIndex + 1];

    return {
      grade: stats.grade,
      level: stats.level,
      experience: stats.experience,
      next: next
        ? {
          grade: next.grade,
          minTradeCount: next.minTradeCount,
          minTradeAmount: next.minTradeAmount
        }
        : null
    };
  }
}