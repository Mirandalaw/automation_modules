import { Repository } from 'typeorm';
import { UserStats } from '../../entities/UserStats';
import { IUserStatsRepository } from '../interfaces/IUserStatsRepository';

/**
 * UserStatsRepository
 * - 사용자 통계(등급, 레벨, 거래기록 등) 조회 및 저장 구현체
 */
export class UserStatsRepository implements IUserStatsRepository {
  constructor(private readonly ormRepository: Repository<UserStats>) {}

  /**
   * 내부 DB용 ID로 UserStats 조회
   */
  async findByUserId(userId: number): Promise<UserStats | null> {
    return await this.ormRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  /**
   * UUID로 UserStats 조회 (추가)
   */
  async findByUserUUID(uuid: string): Promise<UserStats | null> {
    return await this.ormRepository.findOne({
      where: { user: { uuid } },
      relations: ['user'],
    });
  }

  /**
   * UserStats 저장
   */
  async save(stats: UserStats): Promise<UserStats> {
    return await this.ormRepository.save(stats);
  }
}
