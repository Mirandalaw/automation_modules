import { UserStats, UserGrade } from '../entities/UserStats';
import { User } from '../entities/User';

export class UserStatsFactory {
  /**
   * 초기 UserStats 엔티티 생성 (정상적인 FK 연결을 위한 User 엔티티 필요)
   * @param user User 엔티티
   */
  static createDefault(user: User): UserStats {
    const stats = new UserStats();
    stats.user = user;
    stats.tradeCount = 0;
    stats.totalTradeAmount = 0;
    stats.availableCash = 0;
    stats.level = 1;
    stats.grade = UserGrade.BRONZE;
    stats.experience = 0;
    return stats;
  }
}
