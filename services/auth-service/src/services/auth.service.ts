import bcrypt from 'bcryptjs';
import { User } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';
import { AppDataSource } from '../configs/data-source';
import { CustomError } from '../utils/CustomError';
import { SuccessResponse, ErrorResponse } from '../types/responseTypes';
import generateUUID from '../utils/uuid';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

import { getRefreshToken, saveRefreshToken, deleteRefreshToken } from '../utils/redis';
import redis from '../utils/redis';
import { sendEmail } from '../utils/sendEmail';
import { RegisterUserDto } from '../dto/RegisterUserDto';
import { LoginDto } from '../dto/LoginDto';
import logger from '../utils/logger';


// ✅ 사용자 회원가입
// 중복 이메일 검사 → 패스워드 암호화 → 사용자 등록
export const registerUser = async ({ name, email, password, phone }: RegisterUserDto) => {
  const userRepository = AppDataSource.getRepository(User);

  const existing = await userRepository.findOne({ where: { email } });
  if (existing) {
    logger.warn(`[RegisterUser] 중복 이메일 시도: ${email}`);
    throw new CustomError(409, '이미 존재하는 이메일입니다.');
  }

  const userUUID = generateUUID();
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = userRepository.create({
    uuid: userUUID,
    name,
    email,
    password: hashedPassword,
    phone,
  });

  try {
    await userRepository.save(newUser);
    logger.info(`[RegisterUser] 성공: ${email}`);
    return { success: true, message: '회원가입 성공' };
  } catch (err: any) {
    logger.error(`[RegisterUser] 실패: ${email} | ${err.message}`);
    if (err?.code === '23505') {
      throw new CustomError(409, '이미 사용 중인 값이 존재합니다.', err.detail);
    }
    if (err?.code === '23502') {
      throw new CustomError(400, '필수 항목이 누락되었습니다.', err.detail);
    }
    throw new CustomError(500, '회원가입 중 서버 오류 발생', err.message);
  }
};


// ✅ 사용자 로그인
// 이메일과 비밀번호 검증 → Access/Refresh Token 발급
export const loginUser = async ({ email, password }: LoginDto): Promise<SuccessResponse | ErrorResponse> => {
  const userRepository = AppDataSource.getRepository(User);
  const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

  const user = await userRepository.findOne({ where: { email } });
  if (!user) {
    logger.warn(`[LoginUser] 유저 없음: ${email}`);
    throw new CustomError(404, 'User not found');
  }

  if(!user.password) {
    logger.warn(`[LoginUser] 비밀번호 없음 (소셜 로그인 전용 계정) : ${email}`);
    throw  new CustomError(400, '비밀번호 로그인 불가한 계정입니다.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.warn(`[LoginUser] 비밀번호 불일치: ${email}`);
    throw new CustomError(401, 'Invalid password');
  }

  const accessToken = generateAccessToken(user.uuid);
  const refreshToken = generateRefreshToken(user.uuid);
  const expiredAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7일

  await saveRefreshToken(user.uuid, refreshToken);
  await refreshTokenRepo.save({
    token: refreshToken,
    user: { uuid: user.uuid },
    expiredAt,
  });

  logger.info(`[LoginUser] 로그인 성공: ${email}`);
  return {
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      refreshToken,
    },
  };
};


// ✅ AccessToken/RefreshToken 재발급
// Redis와 DB의 RefreshToken을 검증 후 새 토큰 발급
export const reissueToken = async (userId: string, clientRefreshToken: string) => {
  const storedToken = await getRefreshToken(userId);
  const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

  if (!storedToken || storedToken !== clientRefreshToken) {
    logger.warn(`[ReissueToken] 토큰 불일치 또는 만료: userId=${userId}`);
    throw new CustomError(403, 'Invalid or expired refresh token');
  }

  const newAccessToken = generateAccessToken(userId);
  const newRefreshToken = generateRefreshToken(userId);

  await saveRefreshToken(userId, newRefreshToken);
  await refreshTokenRepo.save({
    token: newRefreshToken,
    user: { uuid: userId },
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  logger.info(`[ReissueToken] 재발급 성공: userId=${userId}`);
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};


// ✅ 로그아웃
// RefreshToken 삭제 (Redis + DB)
export const logoutUser = async (clientRefreshToken: string): Promise<SuccessResponse | ErrorResponse> => {
  const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

  const existingToken = await refreshTokenRepo.findOne({
    where: { token: clientRefreshToken },
    relations: ['user'],
  });

  if (!existingToken) {
    logger.warn('[LogoutUser] 존재하지 않는 토큰');
    throw new CustomError(404, 'Refresh token not found.');
  }

  const userUUID = existingToken.user.uuid;

  await deleteRefreshToken(userUUID);
  await refreshTokenRepo.delete({ token: clientRefreshToken });

  logger.info(`[LogoutUser] 로그아웃 완료: userId=${userUUID}`);
  return {
    success: true,
    message: 'Successfully logged out',
  };
};


// ✅ 이메일(아이디) 찾기
// 이름 + 전화번호로 사용자 조회 후 마스킹된 이메일 반환
export const findEmailUser = async (name: string, phone: string) => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { name, phone } });

  if (!user) {
    logger.warn(`[FindEmailUser] 사용자 없음: name=${name}, phone=${phone}`);
    throw new CustomError(404, 'No matching user found');
  }

  const maskedEmail = user.email.replace(/(.{2}).+(@.+)/, '$1****$2');
  logger.info(`[FindEmailUser] 이메일 찾기 성공: name=${name}, phone=${phone}, maskedEmail=${maskedEmail}`);

  return { email: maskedEmail };
};


// ✅ 비밀번호 재설정 인증 코드 전송
// 사용자 이메일 존재 여부 확인 후 6자리 코드 전송 (Redis에 저장)
export const sendResetCodeForUser = async (email: string) => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });

  if (!user) {
    logger.warn(`[SendResetCode] 존재하지 않는 이메일: ${email}`);
    throw new CustomError(404, 'Email not found');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리
  await redis.set(`reset:${email}`, code, 'EX', 300); // 5분 유효

  await sendEmail(email, '비밀번호 재설정 인증코드', `인증코드: ${code}`);
  logger.info(`[SendResetCode] 인증 코드 전송 완료: ${email}`);

  return { message: '인증코드를 이메일로 전송했습니다' };
};


// ✅ 인증 코드 검증
// Redis에 저장된 코드와 클라이언트 코드 비교
export const verifyResetCodeForUser = async (email: string, code: string) => {
  const savedCode = await redis.get(`reset:${email}`);

  if (!savedCode) {
    logger.warn(`[VerifyResetCode] 인증 코드 없음 또는 만료됨: ${email}`);
    throw new CustomError(400, '인증 코드가 만료되었거나 존재하지 않습니다');
  }

  if (savedCode !== code) {
    logger.warn(`[VerifyResetCode] 인증 코드 불일치: ${email}`);
    throw new CustomError(400, '인증 코드가 일치하지 않습니다');
  }

  await redis.set(`reset:verified:${email}`, 'true', 'EX', 600); // 인증 성공 상태 저장
  logger.info(`[VerifyResetCode] 인증 코드 확인 성공: ${email}`);

  return { message: '인증이 완료되었습니다' };
};


// ✅ 비밀번호 재설정
// 인증된 사용자 비밀번호를 새로 암호화하여 저장
export const resetPasswordUser = async (email: string, code: string, newPassword: string) => {
  const storedCode = await redis.get(`reset:${email}`);
  if (!storedCode || storedCode !== code) {
    logger.warn(`[ResetPassword] 인증 코드 불일치 또는 없음: ${email}`);
    throw new CustomError(400, 'Invalid or expired code');
  }

  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });
  if (!user) {
    logger.warn(`[ResetPassword] 사용자 없음: ${email}`);
    throw new CustomError(404, 'User not found');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await userRepo.save(user);

  await redis.del(`reset:${email}`);
  await redis.del(`reset:verified:${email}`);

  logger.info(`[ResetPassword] 비밀번호 재설정 성공: ${email}`);
  return { message: '비밀번호가 성공적으로 변경되었습니다' };
};
