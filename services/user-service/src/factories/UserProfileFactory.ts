import { User } from '../entities/User';
import { UserProfile } from '../entities/UserProfile';
import { generateRandomNickname } from '../common/utils/generateRandomNickname';

/**
 * UserProfileFactory
 * - 회원가입 시 기본 프로필 생성
 * - nickname은 전달받은 값이 없을 경우 랜덤 닉네임으로 대체
 */
export class UserProfileFactory {
  static createDefault(user: User, nickname?: string): UserProfile {
    const profile = new UserProfile();
    profile.user = user;
    profile.nickname = nickname?.trim() || generateRandomNickname(); // 빈 문자열 또는 undefined인 경우 대체
    profile.bio = '';
    profile.profileImageUrl = '';
    return profile;
  }
}