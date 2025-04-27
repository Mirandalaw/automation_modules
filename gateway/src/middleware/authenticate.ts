import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import logger from '../utils/logger';

/**
 * AccessToken 검증 및 사용자 인증 미들웨어
 * - Authorization 헤더에서 Bearer 토큰 추출
 * - 유효한 토큰이면 사용자 정보를 헤더에 주입
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('[Authenticate] Authorization 헤더 없음 또는 잘못된 형식');
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;

    // userId 필수 확인
    if (!decoded.userId) {
      logger.warn('[Authenticate] 토큰 Payload에 userId 없음');
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // 요청 헤더에 사용자 정보 삽입
    req.headers['x-user-id'] = String(decoded.userId);
    req.headers['x-role'] = Array.isArray(decoded.roles)
      ? decoded.roles.join(',')
      : String(decoded.roles || 'USER'); // roles가 없으면 기본값 USER

    logger.info(`[Authenticate] 인증 성공: userId=${decoded.userId}, roles=${decoded.roles}`);
    next();
  } catch (error) {
    logger.error(`[Authenticate] 토큰 검증 실패: ${(error as Error).message}`);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
