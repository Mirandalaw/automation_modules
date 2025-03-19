import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/CustomError';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // CustomError인 경우 처리
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // 그 외 일반 에러 처리
  console.error(err); // 서버 콘솔에 에러 로그 출력
  return res.status(500).json({ message: 'Internal Server Error' });
};

export default errorHandler;