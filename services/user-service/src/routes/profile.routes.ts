import { Router } from 'express';
import { userProfileController } from '../controllers';
import { injectUser } from '../common/middlewares/injectUser';
// import { validateRequest } from '../common/middlewares/validateRequest';
// import { UpdateProfileDto } from '../dtos/UpdateProfileDto';

const userRouter = Router();


/**
 * GET /user/me/profile
 * - 내 프로필 정보 조회
 */
userRouter.get(
  '/', injectUser, userProfileController.getMyProfile.bind(userProfileController)
);

/**
 * PATCH /user/me/profile
 * - 사용자 개인정보 수정
 */
userRouter.patch(
  '/',
  injectUser,
  userProfileController.updateMyProfile.bind(userProfileController)
);

export default userRouter;
