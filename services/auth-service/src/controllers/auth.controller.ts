import { Request, Response } from 'express';

import {
  registerUser,
  loginUser,
  reissueToken,
  logoutUser,
  findEmail,
  sendResetCode,
  resetPassword,
} from '../services/auth.service';

import resHandler from '../utils/resHandler';
import { handleControllerError } from '../utils/handleError';
import { decodeJwtPayload } from '../utils/jwt';

import { SuccessResponse, ErrorResponse } from '../types/responseTypes';


// 회원가입
const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const result: SuccessResponse | ErrorResponse = await registerUser(username, email, password);
    return resHandler(res, 201, result.message);
  } catch (error: unknown) {
    return handleControllerError(res, error);
  }
};

// 로그인
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result: SuccessResponse | ErrorResponse = await loginUser(email, password);

    if (result.success && 'data' in result) {
      // ✅ refreshToken을 쿠키에 저장
      res.cookie('refreshToken', result.data.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      });

      // ✅ accessToken 응답
      return resHandler(res, 200, result.message, {
        accessToken: result.data.accessToken,
      });
    } else {
      // 실패 응답 (예: 로그인 실패 등)
      return resHandler(res, 401, result.message);
    }

  } catch (error: unknown) {
    return handleControllerError(res, error);
  }
};


// accessToken 재발급
const refresh = async (req: Request, res: Response) => {
  try {
    const tokenFromClient = req.cookies.refreshToken;

    if (!tokenFromClient) return resHandler(res, 400, 'Refresh token is missing.');

    const payload: any = decodeJwtPayload(tokenFromClient);
    const userId = payload?.userId;
    if (!userId) return resHandler(res, 400, 'Invalid refresh token');

    const result = await reissueToken(userId, tokenFromClient);

    // 새로운 refreshToken 저장
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return resHandler(res, 200, 'Access token reissued', result.accessToken);
  } catch (error: unknown) {
    return handleControllerError(res, error);
  }
};

// 로그아웃
const logout = async (req: Request, res: Response) => {
  try {
    const tokenFromClient = req.cookies.refreshToken;

    if (!tokenFromClient) return resHandler(res, 400, 'Refresh token is missing');

    await logoutUser(tokenFromClient);
    res.clearCookie('refreshToken');

    return resHandler(res, 200, 'Successfully logged out');
  } catch (error: unknown) {
    return handleControllerError(res, error);
  }
};

export const findEmail = async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;
    const result = await findEmail(name, phone);
    return resHandler(res, 200, 'Email found', result);
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const sendResetCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await sendResetCode(email);
    return resHandler(res, 200, result.message);
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    const result = await resetPassword(email, code, newPassword);
    return resHandler(res, 200, result.message);
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export {
  register,
  login,
  refresh,
  logout,
};