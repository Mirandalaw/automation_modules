import { Request, Response } from 'express';
import logger from '../utils/logger';

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
    logger.info(`[Register] 요청: ${email}`);
    const result = await registerUser({ name, email, password, phone });
    logger.info(`[Register] 성공: ${email}`);
    return resHandler(res, 201, result.message);
  } catch (error: unknown) {
    logger.error(`[Register] 실패: ${(error as Error).message}`);
    return handleControllerError(res, error);
  }
};

// 로그인
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginDto;
    logger.info(`[Login] 요청: ${email}`);

    const result = await loginUser(req.body as LoginDto);

    if (result.success && 'data' in result) {
      res.cookie('refreshToken', result.data.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      });

      logger.info(`[Login] 성공: ${email}`);
      return resHandler(res, 200, result.message, {
        accessToken: result.data.accessToken,
      });
    } else {
      logger.warn(`[Login] 실패: ${email} - ${result.message}`);
      return resHandler(res, 401, result.message);
    }
  } catch (error: unknown) {
    logger.error(`[Login] 에러: ${(error as Error).message}`);
    return handleControllerError(res, error);
  }
};

// 토큰 재발급
export const refresh = async (req: Request, res: Response) => {
  try {
    const tokenFromClient = req.cookies.refreshToken;
    if (!tokenFromClient) {
      logger.warn('[Refresh] 요청 실패: 토큰 없음');
      return resHandler(res, 400, 'Refresh token is missing.');
    }

    const payload = decodeJwtPayload(tokenFromClient);
    const userId = payload?.userId;
    if (!userId) {
      logger.warn('[Refresh] 요청 실패: userId 없음');
      return resHandler(res, 400, 'Invalid refresh token');
    }

    const result = await reissueToken(userId, tokenFromClient);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    logger.info(`[Refresh] 토큰 재발급 성공: userId=${userId}`);
    return resHandler(res, 200, 'Access token reissued', result.accessToken);
  } catch (error) {
    logger.error(`[Refresh] 에러: ${(error as Error).message}`);
    return handleControllerError(res, error);
  }
};

// 로그아웃
export const logout = async (req: Request, res: Response) => {
  try {
    const tokenFromClient = req.cookies.refreshToken;
    if (!tokenFromClient) {
      logger.warn('[Logout] 실패: Refresh token 없음');
      return resHandler(res, 400, 'Refresh token is missing');
    }

    await logoutUser(tokenFromClient);
    res.clearCookie('refreshToken');

    logger.info('[Logout] 성공');
    return resHandler(res, 200, 'Successfully logged out');
  } catch (error) {
    logger.error(`[Logout] 에러: ${(error as Error).message}`);
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