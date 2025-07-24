import { IUserProfileRepository } from '../repositories/interfaces/IUserProfileRepository';
import { UserMeResponseDto } from '../dtos/UserMeResponseDto';
import { CustomError } from '../common/errors';
import { HttpStatus } from '../constants/httpStatus';
import logger from '../common/logger';

/**
 * UserService
 * - 사용자 도메인 관련 로직 처리
 */
export class UserService {
  constructor(private readonly profileRepository: IUserProfileRepository) {}

  async getMyProfile(userId: number): Promise<UserMeResponseDto> {
    logger.debug(`[UserService] getMyProfile 시작: userId=${userId}`);

    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      logger.warn(`[UserService] 사용자 프로필 없음: userId=${userId}`);
      throw new CustomError(HttpStatus.NOT_FOUND, '사용자 프로필을 찾을 수 없습니다.');
    }

    logger.debug(`[UserService] 사용자 프로필 조회 성공: userId=${userId}`);
    return {
      id: profile.user.id,
      nickname: profile.nickname,
      email: profile.user.email,
      bio: profile.bio,
      profileImageUrl: profile.profileImageUrl,
    };
  }
}
