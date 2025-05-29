import { User } from '../../entities/User';
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
   * 이름(name)과 휴대폰 번호(phone)으로 사용자를 조회합니다.
   * - 일반적으로 이메일 찾기(아이디 찾기) 기능에 사용됩니다.
   * - 둘 다 정확히 일치해야 검색되며, 다를 경우 null 반환
   * - 개인정보 기반 조회이므로 보안적으로 로그 노출에 주의가 필요합니다.
   * @param name 사용자 이름 (예: 홍길동)
   * @param phone 사용자 휴대폰 번호 (예: 010-1234-5678)
   * @returns 일치하는 사용자(User) 또는 null
   * @throws DB 조회 중 발생하는 예외
   */
  async findByNameAndPhone(name: string, phone : string): Promise<User | null> {
    try {
      const user = await this.ormRepository.findOne({ where: { name, phone } });
      logger.debug(`[UserRepository] findByNameAndPhone: name=${name}, phone=${phone} → ${user ? 'FOUND' : 'NOT FOUND'}`);
      return user;
    } catch (error: any) {
      logger.error(`[UserRepository] findByNameAndPhone 실패: name=${name}, phone=${phone}, error=${error.message}`);
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