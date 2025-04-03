import express from 'express';
import {
  login,
  register,
  logout,
  refresh,
  findEmail,
  sendResetCode,
  verifyResetCode,
  resetPassword,
} from '../controllers/auth.controller';

import { validateRequest } from '../middleware/validateRequest';
import { RegisterUserDto } from '../dto/RegisterUserDto';

export const authRoutes = express.Router();

/**
 * @route   POST /auth/register
 * @desc    사용자 회원가입
 */
authRoutes.post('/register', validateRequest(RegisterUserDto), register);

/**
 * @route   POST /auth/login
 * @desc    사용자 로그인 및 토큰 발급 (AccessToken + RefreshToken)
 */
authRoutes.post('/login', login);

/**
 * @route   POST /auth/logout
 * @desc    사용자 로그아웃 (RefreshToken 삭제)
 */
authRoutes.post('/logout', logout);

/**
 * @route   POST /auth/refresh
 * @desc    AccessToken 재발급 (RefreshToken 쿠키에서 추출)
 */
authRoutes.post('/refresh', refresh);

/**
 * @route   POST /auth/find-email
 * @desc    이름과 전화번호로 이메일 찾기
 */
authRoutes.post('/find-email', findEmail);

/**
 * @route   POST /auth/forgot-password
 * @desc    비밀번호 재설정을 위한 인증코드 이메일 전송
 */
authRoutes.post('/forgot-password', sendResetCode);

/**
 * @route   POST /auth/verify-reset-code
 * @desc    전송된 인증코드 검증
 */
authRoutes.post('/verify-reset-code', verifyResetCode);

/**
 * @route   POST /auth/reset-password
 * @desc    인증 후 새로운 비밀번호로 재설정
 */
authRoutes.post('/reset-password', resetPassword);

export default authRoutes;
