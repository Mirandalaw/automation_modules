import { Response } from 'express';

// Response 처리 함수
const resHandler = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any, // data는 선택 사항
  errorDetails?: string // 추가적인 에러 세부사항
) => {
  if (data) {
    return res.status(statusCode).json({ message, data, errorDetails });
  } else {
    return res.status(statusCode).json({ message, errorDetails });
  }
};

export default resHandler;