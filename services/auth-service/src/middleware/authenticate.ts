import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { CustomError } from '../utils/CustomError';

dotenv.config();

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new CustomError(401, 'Authorization header missing or invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;

    req.headers['x-user-id'] = decoded.userId as string;
    req.headers['x-role'] = decoded.roles as string;

    next();
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new CustomError(401, 'Access token expired');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new CustomError(401, 'Invalid access token');
    }
    throw new CustomError(500, 'Unexpected error during authentication');
  }
};
