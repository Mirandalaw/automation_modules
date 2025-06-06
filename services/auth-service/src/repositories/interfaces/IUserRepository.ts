import { User } from '../../entities/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;

  findById(id: string): Promise<User | null>;

  save(user: User): Promise<User>;

  findByNameAndPhone(name: string, phone: string): Promise<User | null>;
}