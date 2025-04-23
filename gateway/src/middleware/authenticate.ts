import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { CustomError } from '../utils/CustomError';
import logger from '../utils/logger';

dotenv.config();

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`[Gateway:Auth] Authorization 헤더 없음 또는 잘못됨`);
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;

    if (!decoded.userId) {
      logger.warn(`[Gateway:Auth] 토큰에서 userId 없음`);
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.headers['x-user-id'] = String(decoded.userId);
    req.headers['x-role'] = Array.isArray(decoded.roles)
      ? decoded.roles.join(',')
      : String(decoded.roles);

    logger.info(`[Gateway:Auth] 인증 완료 - userId=${decoded.userId}, roles=${decoded.roles}`);
    next();
  } catch (err) {
    logger.error(`[Gateway:Auth] 인증 실패: ${(err as Error).message}`);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
