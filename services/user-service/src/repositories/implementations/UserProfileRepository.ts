import { IUserProfileRepository } from '../interfaces/IUserProfileRepository';
import { Repository } from 'typeorm';
import { UserProfile } from '../../entities/UserProfile';
import logger from '../../common/logger';

/**
 * UserProfileRepository
 * - 사용자 프로필에 대한 데이터 접근 구현체
 */
export class UserProfileRepository implements IUserProfileRepository {
  constructor(private readonly ormRepository: Repository<UserProfile>) {
  }

  /**
   * 사용자 ID로 프로필 조회
   * - 유저가 존재해야 프로필이 조회됨
   */
  async findByUserUuid(userUuid: string): Promise<UserProfile | null> {
    try {
      const profile = await this.ormRepository.findOne({
        where: { user: { uuid: userUuid } },
        relations: ['user']
      });
      logger.debug(`[UserProfileRepository] findByUserId: ${userUuid} → ${profile ? 'FOUND' : 'NOT FOUND'}`);
      return profile;
    } catch (error: any) {
      logger.error(`[UserProfileRepository] findByUserId 실패: ${userUuid}, error=${error.message}`);
      throw error;
    }
  }

  /**
   * 프로필 전체 저장 (신규 생성 포함)
   */
  async save(profile: UserProfile): Promise<UserProfile> {
    try {
      const saved = await this.ormRepository.save(profile);
      logger.debug(`[UserProfileRepository] save: userUuid=${saved.user.uuid}`);
      return saved;
    } catch (error: any) {
      logger.error(`[UserProfileRepository] save 실패: userUuid=${profile.user?.uuid}, error=${error.message}`);
      throw error;
    }
  }

  /**
   * 프로필 일부 수정 (patch 목적)
   */
  async update(profile: UserProfile): Promise<UserProfile> {
    try {
      const updated = await this.ormRepository.save(profile);
      logger.debug(`[UserProfileRepository] update: userId=${updated.user.id}`);
      return updated;
    } catch (error: any) {
      logger.error(`[UserProfileRepository] update 실패: userId=${profile.user?.id}, error=${error.message}`);
      throw error;
    }
  }
}
