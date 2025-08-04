import { IUserRepository } from '../interfaces/IUserRepository';
import { User } from '../../entities/User';
import { Repository } from 'typeorm';

export class UserRepository implements IUserRepository {
  constructor(private readonly repo: Repository<User>) {}

  /**
   * 내부 ID 기반 조회
   */
  async findById(id: number): Promise<User | null> {
    return await this.repo.findOneBy({ id });
  }

  /**
   * UUID 기반 조회
   */
  async findByUUID(uuid: string): Promise<User | null> {
    return await this.repo.findOneBy({ uuid });
  }

  /**
   * 사용자 생성
   * - Auth-Service에서 넘어온 데이터 기반으로 user-service에 사용자 등록
   */
  async createUser(data: {
    uuid: string;
    email: string;
    nickname: string;
  }): Promise<User> {
    const user = this.repo.create(data);
    return await this.repo.save(user);
  }
}
