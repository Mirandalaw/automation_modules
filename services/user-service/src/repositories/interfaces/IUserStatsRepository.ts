import { UserStats } from '../../entities/UserStats';

/**
 * 사용자 통계 저장소 인터페이스
 */
export interface IUserStatsRepository {
  findByUserId(userId: number): Promise<UserStats | null>;
}