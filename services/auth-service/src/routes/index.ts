import express from 'express';
import { authRoutes } from './auth.routes';
import { sessionRoutes } from './session.routes';

const router = express.Router();

/**
 * @route   /auth
 * @desc    회원가입, 로그인, 토큰 재발급, 로그아웃 API
 */
router.use('/auth', authRoutes);

/**
 * @route   /auth/sessions
 * @desc    유저 세션 조회 및 관리 API
 */
router.use('/auth/sessions', sessionRoutes);

export default router;
