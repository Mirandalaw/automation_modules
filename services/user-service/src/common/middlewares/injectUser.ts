import { Request, Response, NextFunction } from 'express';

/**
 * Gateway에서 주입한 헤더(x-user-id, x-role)를 기반으로 req.user 구성
 */
export const injectUser = (req: Request, res: Response, next: NextFunction) => {
  const userIdHeader = req.headers['x-user-id'];
  const roleHeader = req.headers['x-role'];

  if (!userIdHeader || Array.isArray(userIdHeader)) {
    return res.status(401).json({ message: 'Missing or invalid x-user-id header' });
  }

  const userId = String(userIdHeader).trim();
  if (!userId || userId.length < 8) {
    return res.status(401).json({ message: 'Invalid user ID format' });
  }

  const role =
    Array.isArray(roleHeader) ? roleHeader.join(',') :
      typeof roleHeader === 'string' && roleHeader.trim() !== '' ? roleHeader :
        'USER';

  req.user = {
    id: userId, // UUID 문자열
    role,
  };

  next();
};
