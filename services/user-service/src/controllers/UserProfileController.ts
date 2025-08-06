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
  constructor(private readonly profileService: UserProfileService) {
  }

  /**
   * GET /users/me/profile
   * 내 프로필 조회
   */
  getMyProfile = async (req: Request, res: Response) => {
    const userUuid = req.user!.uuid;
    const profile = await this.profileService.getMyProfile(userUuid);
    return resHandler(res, HttpStatus.OK, '프로필 조회 완료',profile);
  };


  /**
   * PATCH /users/me/profile
   * - 사용자 프로필 수정
   * @route PATCH /users/me/profile
   */
  async updateMyProfile(req: Request, res: Response) {
    const userUuid = req.user!.uuid; // UUID 기반 사용자 식별
    const dto: UpdateProfileDto = req.body;

    const updated = await this.profileService.updateProfile(userUuid, dto);
    return resHandler(res, HttpStatus.OK, '프로필 수정 완료', updated);
  }
}
