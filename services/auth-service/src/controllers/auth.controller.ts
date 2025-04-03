import { Request, Response } from 'express';
import logger from '../utils/logger';

import {
  registerUser,
  loginUser,
  reissueToken,
  logoutUser,
  findEmailUser,
  sendResetCodeForUser,
  resetPasswordUser,
  verifyResetCodeForUser,
} from '../services/auth.service';

import resHandler from '../utils/resHandler';
import { handleControllerError } from '../utils/handleError';
import { decodeJwtPayload } from '../utils/jwt';

import { SuccessResponse, ErrorResponse } from '../types/responseTypes';
import { RegisterUserDto } from '../dto/RegisterUserDto';
import { LoginDto } from '../dto/LoginDto';


// ✅ 회원가입
// 사용자가 회원 정보를 제출하면 DB에 등록 후 성공 응답 반환
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


// ✅ 로그인
// 이메일, 비밀번호 확인 후 accessToken + refreshToken 발급
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


// ✅ 토큰 재발급
// 쿠키에 저장된 RefreshToken을 사용하여 AccessToken을 재발급
const refresh = async (req: Request, res: Response) => {
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


// ✅ 로그아웃
// RefreshToken 삭제 및 쿠키 초기화
const logout = async (req: Request, res: Response) => {
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


// ✅ 이메일(아이디) 찾기
// 이름과 전화번호로 사용자의 이메일(마스킹 처리)을 반환
const findEmail = async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;
    logger.info(`[FindEmail] 요청: name=${name}, phone=${phone}`);
    const result = await findEmailUser(name, phone);
    logger.info(`[FindEmail] 성공: ${result.email}`);
    return resHandler(res, 200, 'Email found', result);
  } catch (err) {
    logger.warn(`[FindEmail] 실패: ${(err as Error).message}`);
    return handleControllerError(res, err);
  }
};


// ✅ 비밀번호 재설정 코드 전송
// 이메일로 6자리 인증코드를 전송
const sendResetCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    logger.info(`[SendResetCode] 요청: ${email}`);
    const result = await sendResetCodeForUser(email);
    logger.info(`[SendResetCode] 전송 완료: ${email}`);
    return resHandler(res, 200, result.message);
  } catch (err) {
    logger.warn(`[SendResetCode] 실패: ${(err as Error).message}`);
    return handleControllerError(res, err);
  }
};


// ✅ 인증코드 검증
// 이메일과 인증코드를 비교하여 유효성 확인
const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    logger.info(`[VerifyResetCode] 요청: ${email}`);
    const result = await verifyResetCodeForUser(email, code);
    logger.info(`[VerifyResetCode] 성공: ${email}`);
    return resHandler(res, 200, result.message);
  } catch (err) {
    logger.warn(`[VerifyResetCode] 실패: ${(err as Error).message}`);
    return handleControllerError(res, err);
  }
};


// ✅ 비밀번호 재설정
// 인증된 사용자의 비밀번호를 새 비밀번호로 변경
const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    logger.info(`[ResetPassword] 요청: ${email}`);
    const result = await resetPasswordUser(email, code, newPassword);
    logger.info(`[ResetPassword] 성공: ${email}`);
    return resHandler(res, 200, result.message);
  } catch (err) {
    logger.warn(`[ResetPassword] 실패: ${(err as Error).message}`);
    return handleControllerError(res, err);
  }
};

export {
  register,
  login,
  refresh,
  logout,
  findEmail,
  sendResetCode,
  verifyResetCode,
  resetPassword,
};
