import { Router } from 'express';
import { userProfileController } from '../controllers';
// import { validateRequest } from '../common/middlewares/validateRequest';
// import { UpdateProfileDto } from '../dtos/UpdateProfileDto';

const userRouter = Router();

/**
 * PATCH /user/me/profile
 * - 사용자 개인정보 수정
 */
userRouter.patch(
  '/',
  // validateRequest(UpdateProfileDto), // DTO 유효성 검사 미들웨어
  userProfileController.updateMyProfile.bind(userProfileController),
);

export default userRouter;
