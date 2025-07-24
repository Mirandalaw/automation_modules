import { UserProfile } from '../../entities/UserProfile';

export interface IUserProfileRepository {
  findByUserId(userId: number): Promise<UserProfile | null>;
  update(userProfile: UserProfile): Promise<UserProfile>;
  save(profile: UserProfile): Promise<UserProfile>;
}