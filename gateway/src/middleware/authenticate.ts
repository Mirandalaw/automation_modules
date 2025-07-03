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
  logger.debug('헤더 값 : ', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('[Authenticate] Authorization 헤더 없음 또는 잘못된 형식');
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  logger.debug('Authorization Header:', authHeader);
  logger.debug('Extracted Token:', token);

  try {
    if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET === 'undefined') {
      logger.error('환경 변수(JWT_ACCESS_SECRET)를 확인하세요.');
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;

    // userId 필수 확인
    if (!decoded.userId) {
      logger.warn('[Authenticate] 토큰 Payload에 userId 없음');
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    logger.info('Authorization header:', req.headers['authorization']);

    // 요청 헤더에 사용자 정보 삽입
    req.headers['x-user-id'] = String(decoded.userId);
    req.headers['x-role'] = Array.isArray(decoded.roles)
      ? decoded.roles.join(',')
      : String(decoded.roles || 'USER'); // roles가 없으면 기본값 USER

    logger.info(`[Authenticate] 인증 성공: userId=${decoded.userId}, roles=${decoded.roles}`);
    next();
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`[Authenticate] 토큰 검증 실패: ${error.message}`);
      logger.error(`[Authenticate] 에러 상세: ${error.stack}`);
    } else {
      logger.error(`[Authenticate] 알 수 없는 오류:`, error);
    }

    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
