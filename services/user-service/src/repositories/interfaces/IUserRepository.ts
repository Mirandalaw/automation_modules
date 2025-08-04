import { User } from '../../entities/User';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;

  findByUUID(uuid: string): Promise<User | null>;

  createUser(data: { uuid: string; email: string; nickname: string }): Promise<User>;
}
