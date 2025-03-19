import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import resHandler from '../utils/resHandler';
import { SuccessResponse, ErrorResponse } from '../types/responseTypes';
import { CustomError } from '../utils/CustomError';

// 회원가입
export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const result: SuccessResponse | ErrorResponse = await registerUser(username, email, password);
    return resHandler(res, 201, result.message);
  } catch (error: unknown) {
    // CustomError 인스턴스를 체크하여 에러 처리
    if (error instanceof CustomError) {
      return resHandler(res, error.statusCode, error.message);
    }

    // 에러가 CustomError가 아닌 경우에는 일반적인 에러 처리
    if (error instanceof Error) {
      return resHandler(res, 500, 'Server error', error.message);
    }

    // 만약 error가 Error 객체가 아니면, 안전하게 처리할 수 없는 경우
    return resHandler(res, 500, 'Server error', 'Unknown error occurred');
  }
};

// 로그인
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const result: SuccessResponse | ErrorResponse = await loginUser(username, password);
    return resHandler(res, 200, result.message);
  } catch (error: unknown) {
    // CustomError 인스턴스를 체크하여 에러 처리
    if (error instanceof CustomError) {
      return resHandler(res, error.statusCode, error.message);
    }

    // 에러가 CustomError가 아닌 경우에는 일반적인 에러 처리
    if (error instanceof Error) {
      return resHandler(res, 500, 'Server error', error.message);
    }

    // 만약 error가 Error 객체가 아니면, 안전하게 처리할 수 없는 경우
    return resHandler(res, 500, 'Server error', 'Unknown error occurred');
  }
};
