import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import logger from '../utils/logger';

/**
 * 사용자 인증 미들웨어
 * - Authorization 헤더에서 Bearer 토큰 추출
 * - JWT 검증 후 사용자 정보를 req.headers 또는 res.locals에 삽입
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  logger.debug('[Authenticate] Authorization 헤더:', authHeader);

  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn('[Authenticate] Authorization 헤더 없음 또는 형식 오류');
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  if (!process.env.JWT_ACCESS_SECRET) {
    logger.error('[Authenticate] 환경 변수 JWT_ACCESS_SECRET가 설정되지 않았습니다.');
    return res.status(500).json({ message: 'Internal server error' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as JwtPayload;

    if (!decoded.userId) {
      logger.warn('[Authenticate] 토큰 payload에 userId 없음');
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // 사용자 정보 주입
    const userId = String(decoded.userId);
    const roles = Array.isArray(decoded.roles) ? decoded.roles.join(',') : String(decoded.roles ?? 'USER');

    // 타입 단언을 통해 headers에 주입 (express 기본 타입은 readonly)
    req.headers['x-user-id'] = userId;
    req.headers['x-role'] = roles;

    logger.info(`[Authenticate] 인증 성공: userId=${userId}, roles=${roles}`);
    logger.debug(`[Authenticate] 헤더 주입 완료: x-user-id=${userId}, x-role=${roles}`);

    next();
  } catch (error) {
    const err = error as Error;
    logger.error(`[Authenticate] JWT 검증 실패: ${err.message}`);
    logger.debug(`[Authenticate] 에러 스택: ${err.stack}`);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
