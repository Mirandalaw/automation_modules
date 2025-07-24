import { Router } from 'express';
import { userMeController } from '../controllers';

const userRouter = Router();

/**
 * @route GET /user/me
 * @desc 로그인된 사용자 정보 조회
 * @access 로그인 필요 (JWT 인증)
 */
userRouter.get('/', userMeController.handle.bind(userMeController));

export default userRouter;
