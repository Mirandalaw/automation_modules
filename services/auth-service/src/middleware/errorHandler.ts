import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/CustomError';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // CustomError 처리
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // JWT 관련 오류 처리
  if (err instanceof TokenExpiredError) {
    return res.status(401).json({ message: 'Access token expired' });
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({ message: 'Invalid access token' });
  }

  // 일반 Error 객체 처리
  if (err instanceof Error) {
    console.error('[Unhandled Error]', err);
    return res.status(500).json({ message: err.message });
  }

  // 알 수 없는 오류 처리
  console.error('[Unknown Error]', err);
  return res.status(500).json({ message: 'Unexpected server error' });
};

export default errorHandler;
