import { Request, Response } from 'express';
import { generateAccessToken } from '../utils/jwt';
import logger from '../utils/logger';

/**
 * Google OAuth 로그인 성공 콜백 처리
 * passport.authenticate 성공 후 호출됨
 */
export const googleCallback = async (req: Request, res: Response) => {
  const user = req.user as any;

  if (!user) {
    logger.error('[OAuth] 사용자 정보가 없습니다 (req.user가 undefined)');
    return res.status(400).json({ message: 'OAuth 로그인 실패: 사용자 정보 없음' });
  }

  try {
    // ✅ AccessToken 발급
    const accessToken = generateAccessToken(user.uuid );

    logger.info(`[OAuth] JWT 발급 완료: userId=${user.uuid}`);

    // ✅ 프론트엔드로 토큰 전달 (리디렉션 방식)
    const redirectUrl = `http://localhost:5173/oauth/success?token=${accessToken}`;
    return res.redirect(redirectUrl);
  } catch (err: any) {
    logger.error(`[OAuth] JWT 발급 실패: ${err.message}`);
    return res.status(500).json({ message: '서버 오류: JWT 발급 실패' });
  }
};