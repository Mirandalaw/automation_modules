import { getRepo } from '../../../../utils/getRepository';
import { User } from '../../../../entities/User';
import { IUserRepository } from '../interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  private repo = getRepo(User);

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(uuid: string): Promise<User | null> {
    return this.repo.findOne({ where: { uuid } });
  }
  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }
}
