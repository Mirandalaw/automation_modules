import { Request, Response, NextFunction } from 'express';
import logger from '../common/logger';

/**
 * 권한(Role) 기반 접근 제어 미들웨어
 * @param allowedRoles 허용된 역할 목록 (예: ['USER', 'ADMIN'])
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const roleHeader = req.headers['x-role'];

    let userRoles: string[] = [];

    if (typeof roleHeader === 'string') {
      userRoles = roleHeader.split(',').map((r) => r.trim().toUpperCase());
    } else if (Array.isArray(roleHeader)) {
      userRoles = roleHeader.map((r) => r.trim().toUpperCase());
    }

    const hasRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      logger.warn(`[Authorize] 권한 부족: required=[${allowedRoles}], userRoles=[${userRoles}]`);
      return res.status(403).json({ message: '접근이 거부되었습니다. (권한 부족)' });
    }

    logger.info(`[Authorize] 권한 확인 완료: userRoles=[${userRoles}]`);
    next();
  };
};
