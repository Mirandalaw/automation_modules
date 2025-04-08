import express, { Request, Response } from 'express';
import passport from 'passport';
import { findOrCreateUser, handleOAuthLogin } from '../services/oauth.service';
import logger from '../utils/logger';

const oAuthRoutes = express.Router();

/**
 * @route   GET /oauth/google
 * @desc    Google 로그인 요청 시작 (OAuth 2.0 인증 창으로 리다이렉트)
 */
oAuthRoutes.get(
  '/google',
  (req, res, next) => {
    logger.info('[OAuth][Google] 로그인 요청 시작');
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * @route   GET /oauth/google/callback
 * @desc    Google 로그인 인증 완료 후 콜백 처리
 *         - 사용자 등록 또는 조회
 *         - JWT 발급 및 프론트엔드로 리다이렉트
 */
oAuthRoutes.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  async (req: Request, res: Response) => {
    try {
      const profile = req.user as any;
      logger.info(`[OAuth][Google] 콜백 수신 - id=${profile.id}, email=${profile.emails?.[0]?.value}`);

      const user = await findOrCreateUser(profile);
      const tokens = await handleOAuthLogin(user);

      logger.info(`[OAuth][Google] 로그인 성공 - user=${user.email}`);

      // ✅ 토큰 전달 (리다이렉트 방식, 프론트 URL은 환경변수 또는 고정 값으로 관리 추천)
      const redirectUrl = `${process.env.FRONT_REDIRECT_URI}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
      return res.redirect(redirectUrl);
    } catch (error: any) {
      logger.error(`[OAuth][Google] 로그인 처리 실패: ${error.message}`);
      return res.status(500).json({ error: '소셜 로그인 처리 중 오류 발생' });
    }
  }
);

export default oAuthRoutes;
