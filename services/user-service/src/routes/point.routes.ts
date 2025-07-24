import { Router } from 'express';
import { userPointController } from '../controllers';

const userPointRouter = Router();

/**
 * @route   GET /user/me/points
 * @desc    현재 보유 포인트 조회
 */
userPointRouter.get('/', userPointController.getMyPoints.bind(userPointController));

/**
 * @route   POST /user/me/points/deposit
 * @desc    포인트 충전
 */
userPointRouter.post(
  '/deposit',
  userPointController.depositPoints.bind(userPointController),
);

/**
 * @route   POST /user/me/points/withdraw
 * @desc    포인트 출금
 */
userPointRouter.post(
  '/withdraw',
  userPointController.withdrawPoints.bind(userPointController),
);

export default userPointRouter;
