import bcrypt from 'bcrypt';
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

export const registerUser = async (username: string, email: string, password: string): Promise<SuccessResponse | ErrorResponse> => {
  const userRepository = AppDataSource.getRepository(User);

  const existing = await userRepository.findOne({ where: { email } });

  if (!existing) {
    throw new CustomError(409, 'Email is already in use.');
  }

  const userUUID = generateUUID;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = userRepository.create({
    uuid: userUUID,
    username,
    email,
    password: hashedPassword,
  });

  try {
    await userRepository.save(newUser);
    return { success: true, message: 'User registered successfully!' };
  } catch (error) {
    throw new CustomError(500, 'Server error during registration');
  }
};

export const loginUser = async (email: string, password: string): Promise<SuccessResponse | ErrorResponse> => {
  const userRepository = AppDataSource.getRepository(User);
  const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

  const user = await userRepository.findOne({ where: { email } });
  if (!user) throw new CustomError(404, 'User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new CustomError(401, 'Invalid password');

  const accessToken = generateAccessToken(user.uuid);
  const refreshToken = generateRefreshToken(user.uuid);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  // ✅ Redis 저장
  await saveRefreshToken(user.uuid, refreshToken);

  // ✅ DB 기록 (감사/보안 용도)
  await refreshTokenRepo.save({
    token: refreshToken,
    user: { uuid: user.uuid },
    expiresAt,
  });

  return {
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      refreshToken,
    },
  };
};

export const reissueToken = async (userId: string, clientRefreshToken: string) => {
  const storedToken = await getRefreshToken(userId);
  const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
  if (!storedToken || storedToken !== clientRefreshToken) {
    throw new CustomError(403, 'Invalid or expired refresh token');
  }

  const newAccessToken = generateAccessToken(userId);
  const newRefreshToken = generateRefreshToken(userId);

  await saveRefreshToken(userId, newRefreshToken); // Redis 갱신
  await refreshTokenRepo.save({
    token: newRefreshToken,
    user: { uuid: userId },
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (clientRefreshToken: string): Promise<SuccessResponse | ErrorResponse> => {
  const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

  // 1. DB에서 해당 refreshToken 찾기
  const existingToken = await refreshTokenRepo.findOne({
    where: { token: clientRefreshToken },
    relations: ['user'],
  });

  if (!existingToken) {
    throw new CustomError(404, 'Refresh token not found.');
  }

  const userUUID = existingToken.user.uuid;

  // 2. Redis 삭제
  await deleteRefreshToken(userUUID);
  // DB 삭제
  await refreshTokenRepo.delete({ token: clientRefreshToken });

  return {
    success: true,
    message: 'Successfully logged out',
  };
};

export const findEmail = async (name: string, phone: string) => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { name, phone } });

  if (!user) throw new CustomError(404, 'No matching user found');

  // 마스킹된 이메일 반환 (보안용)
  const maskedEmail = user.email.replace(/(.{2}).+(@.+)/, '$1****$2');
  return { email: maskedEmail };
};

export const sendResetCode = async (email: string) => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });

  if (!user) throw new CustomError(404, 'Email not found');

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리
  await redis.set(`reset:${email}`, code, 'EX', 300); // 5분

  await sendEmail(email, '비밀번호 재설정 인증코드', `인증코드: ${code}`);

  return { message: '인증코드를 이메일로 전송했습니다' };
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  const storedCode = await redis.get(`reset:${email}`);
  if (!storedCode || storedCode !== code) {
    throw new CustomError(400, 'Invalid or expired code');
  }

  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });
  if (!user) throw new CustomError(404, 'User not found');

  user.password = await bcrypt.hash(newPassword, 10);
  await userRepo.save(user);

  await redis.del(`reset:${email}`);

  return { message: '비밀번호가 성공적으로 변경되었습니다' };
};