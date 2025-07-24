import { Repository } from 'typeorm';
import { UserStats } from '../../entities/UserStats';
import { IUserStatsRepository } from '../interfaces/IUserStatsRepository';

/**
 * UserStatsRepository
 * - 사용자 통계(등급, 레벨, 거래기록 등) 조회를 담당하는 구현체
 */
export class UserStatsRepository implements IUserStatsRepository {
  constructor(private readonly ormRepository: Repository<UserStats>) {}

  /**
   * 사용자 ID 기준으로 UserStats 조회
   * @param userId 사용자 ID
   * @returns UserStats 또는 null
   */
  async findByUserId(userId: number): Promise<UserStats | null> {
    return await this.ormRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
}
