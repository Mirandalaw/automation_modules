import { Request, Response } from 'express';

import {
  registerUser,
  loginUser,
  reissueToken,
  logoutUser,
  // findEmailUser,
  // sendResetCodeForUser,
  // resetPasswordUser,
} from '../services/auth.service';

import resHandler from '../utils/resHandler';
import { handleControllerError } from '../utils/handleError';
import { decodeJwtPayload } from '../utils/jwt';

import { SuccessResponse, ErrorResponse } from '../types/responseTypes';
import { RegisterUserDto } from '../dto/RegisterUserDto';
import { LoginDto } from '../dto/LoginDto';


// 회원가입
const register = async (req: Request, res: Response) => {

  try {
    const { name, email, password, phone } = req.body as RegisterUserDto;
    const result = await registerUser(name, email, password, phone);
    return resHandler(res, 201, result.message);
  } catch (error: unknown) {
    return handleControllerError(res, error);
  }
};

// 로그인
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginDto;
    const result= await loginUser(req.body as LoginDto);

    if (result.success && 'data' in result) {
      // ✅ refreshToken을 쿠키에 저장
      res.cookie('refreshToken', result.data.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      });

      return resHandler(res, 200, result.message, {
        accessToken: result.data.accessToken,
      });
    } else {
      return resHandler(res, 401, result.message);
    }
  } catch (error: unknown) {
    return handleControllerError(res, error);
  }
};


// 토큰 재발급
export const refresh = async (req: Request, res: Response) => {
  try {
    const tokenFromClient = req.cookies.refreshToken;
    if (!tokenFromClient) return resHandler(res, 400, 'Refresh token is missing.');

    const payload = decodeJwtPayload(tokenFromClient);
    const userId = payload?.userId;
    if (!userId) return resHandler(res, 400, 'Invalid refresh token');

    const result = await reissueToken(userId, tokenFromClient);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return resHandler(res, 200, 'Access token reissued', result.accessToken);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// 로그아웃
export const logout = async (req: Request, res: Response) => {
  try {
    const tokenFromClient = req.cookies.refreshToken;
    if (!tokenFromClient) return resHandler(res, 400, 'Refresh token is missing');

    await logoutUser(tokenFromClient);
    res.clearCookie('refreshToken');

    return resHandler(res, 200, 'Successfully logged out');
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// const findEmail = async (req: Request, res: Response) => {
//   try {
//     const { name, phone } = req.body;
//     const result = await findEmailUser(name, phone);
//     return resHandler(res, 200, 'Email found', result);
//   } catch (err) {
//     return handleControllerError(res, err);
//   }
// };
//
// const sendResetCode = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;
//     const result = await sendResetCodeForUser(email);
//     return resHandler(res, 200, result.message);
//   } catch (err) {
//     return handleControllerError(res, err);
//   }
// };
//
// const resetPassword = async (req: Request, res: Response) => {
//   try {
//     const { email, code, newPassword } = req.body;
//     const result = await resetPasswordUser(email, code, newPassword);
//     return resHandler(res, 200, result.message);
//   } catch (err) {
//     return handleControllerError(res, err);
//   }
// };

export {
  register,
  login,
  refresh,
  logout,
  // findEmail,
  // sendResetCode,
  // resetPassword
};