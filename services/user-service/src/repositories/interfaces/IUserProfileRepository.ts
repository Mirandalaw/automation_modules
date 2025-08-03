import { UserProfile } from '../../entities/UserProfile';

export interface IUserProfileRepository {
  findByUserUuid(userUuid: string): Promise<UserProfile | null>;

  update(profile: UserProfile): Promise<UserProfile>;

  save(profile: UserProfile): Promise<UserProfile>;
}