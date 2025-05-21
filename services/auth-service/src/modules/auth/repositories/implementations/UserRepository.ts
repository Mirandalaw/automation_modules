import { User } from '../../../../entities/User';
import { IUserRepository } from '../interfaces/IUserRepository';
import { Repository } from 'typeorm';
import logger from '../../../../utils/logger';

/**
 * UserRepository
 * - TypeORM 기반의 사용자 엔티티 저장소 구현체
 * - IUserRepository 인터페이스를 구현하여 의존성 역전 및 테스트 용이성 확보
 */
export class UserRepository implements IUserRepository {
  constructor(
    private readonly ormRepository: Repository<User>,
  ) {}

  /**
   * 이메일로 사용자 조회
   * - 로그인, 중복가입 검증 등에서 사용
   * @param email 사용자 이메일
   * @returns User 또는 null
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.ormRepository.findOne({ where: { email } });
      logger.debug(`[UserRepository] findByEmail: ${email}->${user ? 'Found' : 'NOT FOUND'}`);
      return user;
    } catch (error: any) {
      logger.error(`[UserRepository] findByEmail: ${email}, error=${error.message}`);
      throw error;
    }
  }

  /**
   * UUID로 사용자 조회
   * - 세션 검증, 사용자 정보 조회 등에 활용
   * @param uuid 사용자 UUID
   * @returns User 또는 null
   */
  async findById(uuid: string): Promise<User | null> {
    try {
      const user = await this.ormRepository.findOne({ where: { uuid } });
      logger.debug(`[UserRepository] findById: ${uuid} → ${user ? 'FOUND' : 'NOT FOUND'}`);
      return user;
    } catch (error: any) {
      logger.error(`[UserRepository] findById 실패: ${uuid}, error=${error.message}`);
      throw error;
    }
  }

  /**
   * 사용자 저장
   * - 신규 가입자 등록 또는 수정 시 사용
   * @param user 저장할 User 엔티티
   * @returns 저장된 User 엔티티
   */
  async save(user: User): Promise<User> {
    try {
      const saved = await this.ormRepository.save(user);
      logger.info(`[UserRepository] 저장 완료: userId=${saved.uuid}`);
      return saved;
    } catch (error: any) {
      logger.error(`[UserRepository] 저장 실패: email=${user.email}, error=${error.message}`);
      throw error;
    }
  }
}