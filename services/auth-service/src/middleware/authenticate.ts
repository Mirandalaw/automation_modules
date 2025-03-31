import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { CustomError } from '../utils/CustomError';

dotenv.config();

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new CustomError(401, 'Authorization header missing or invalid' );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    // 사용자 정보 헤더에 추가 (Gateway나 서비스에서 활용)
    req.headers['x-user-id'] = (decoded as any).userId;
    req.headers['x-role'] = (decoded as any).role;
    next();
  } catch (err: any) {
    throw new CustomError(
      401,
      err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token',
    );
  }
};
