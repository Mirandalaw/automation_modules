import { Router } from 'express';
import {
  registerController,
  loginController,
  reissueTokenController,
  logoutController
} from '../controllers';

const authRouter = Router();

/**
 * @route   POST /auth/register
 * @desc    사용자 회원가입
 */
authRouter.post('/auth/register', registerController.handle.bind(registerController));

/**
 * @route   POST /auth/login
 * @desc    사용자 로그인 및 토큰 발급 (AccessToken + RefreshToken)
 */
authRouter.post('/auth/login', loginController.handle.bind(loginController));

/**
 * @route   POST /auth/reissue
 * @desc    RefreshToken 기반 AccessToken 재발급
 */
authRouter.post('/auth/reissue', reissueTokenController.handle.bind(reissueTokenController));

/**
 * @route   POST /auth/logout
 * @desc    로그아웃 및 RefreshToken 무효화
 */
authRouter.post('/auth/logout', logoutController.handle.bind(logoutController));


export default authRouter;