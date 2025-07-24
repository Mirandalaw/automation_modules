import { IUserStatsRepository } from '../repositories/interfaces/IUserStatsRepository';
import { UserStats, UserGrade } from '../entities/UserStats';

/**
 * 등급 기준 정의
 */
const gradeRules = [
  { grade: UserGrade.BRONZE, minTradeCount: 0, minTradeAmount: 0 },
  { grade: UserGrade.SILVER, minTradeCount: 10, minTradeAmount: 100000 },
  { grade: UserGrade.GOLD, minTradeCount: 100, minTradeAmount: 1000000 },
  { grade: UserGrade.PLATINUM, minTradeCount: 300, minTradeAmount: 5000000 },
  { grade: UserGrade.DIAMOND, minTradeCount: 500, minTradeAmount: 10000000 },
];

/**
 * GradeService
 * - 사용자 등급, 다음 등급 조건 등을 계산해주는 서비스
 */
export class GradeService {
  constructor(private readonly statsRepository: IUserStatsRepository) {}

  /**
   * 사용자 등급 및 다음 등급 조건 조회
   * @param userId 사용자 ID
   * @returns 현재 등급 정보 + 다음 조건
   */
  async getUserGradeInfo(userId: number) {
    const stats = await this.statsRepository.findByUserId(userId);
    if (!stats) {
      throw new Error('등급 정보가 존재하지 않습니다.');
    }

    const currentRule = gradeRules.find(rule => rule.grade === stats.grade);
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
          minTradeAmount: next.minTradeAmount,
        }
        : null,
    };
  }
}
