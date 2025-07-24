import { Request, Response } from 'express';
import { UserProfileService } from '../services/UserProfileService';
import { UpdateProfileDto } from '../dtos/UpdateProfileDto';
import resHandler from '../common/utils/resHandler';
import { HttpStatus } from '../constants/httpStatus';

/**
 * UserProfileController
 * - 사용자 프로필 수정 요청 처리
 */
export class UserProfileController {
  constructor(private readonly profileService: UserProfileService) {}

  /**
   * PATCH /users/me/profile
   * - 사용자 프로필 수정
   * @route PATCH /users/me/profile
   */
  async updateMyProfile(req: Request, res: Response) {
    const userId = Number(req.user!.id); // 인증된 유저 ID
    const dto: UpdateProfileDto = req.body;

    const updated = await this.profileService.updateProfile(userId, dto);
    return resHandler(res, HttpStatus.OK, '프로필 수정 완료', updated);
  }
}
