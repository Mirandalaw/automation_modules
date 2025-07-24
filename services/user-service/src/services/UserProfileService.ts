import { IUserProfileRepository } from '../repositories/interfaces/IUserProfileRepository';
import { UpdateProfileDto } from '../dtos/UpdateProfileDto';
import { CustomError } from '../common/errors/CustomError';
import { HttpStatus } from '../constants/httpStatus';

/**
 * UserProfileService
 * - 사용자 프로필 정보를 수정하는 비즈니스 로직
 */
export class UserProfileService {
  constructor(private readonly profileRepository: IUserProfileRepository) {}

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new CustomError(HttpStatus.NOT_FOUND, '프로필 정보를 찾을 수 없습니다.');
    }

    // DTO에서 전달된 값만 반영
    profile.nickname = dto.nickname ?? profile.nickname;
    profile.bio = dto.bio ?? profile.bio;
    profile.profileImageUrl = dto.profileImageUrl ?? profile.profileImageUrl;

    // 업데이트 저장
    return await this.profileRepository.update(profile); // update 메서드 분리 시
  }
}
