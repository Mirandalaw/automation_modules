import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { RefreshTokenPayload, AccessTokenPayload } from '../types/jwt';

dotenv.config();

// 환경변수 불러오기
const accessSecret = process.env.JWT_ACCESS_SECRET as Secret;
const refreshSecret = process.env.JWT_REFRESH_SECRET as Secret;

if (!accessSecret || !refreshSecret) {
  throw new Error('JWT secrets are not defined in environment variables.');
}

// 토큰 기본 설정
const accessTokenOptions: jwt.SignOptions = {
  expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRY || '900', 10), // 15분
};

const refreshTokenOptions: jwt.SignOptions = {
  expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY || '604800', 10), // 7일
};

/**
 * AccessToken 발급
 * @param payload AccessTokenPayload
 * @returns AccessToekn (string)
 */

export const generateAccessToken = (payload : AccessTokenPayload): string => {
  return jwt.sign(payload, accessSecret, accessTokenOptions);
};

/**
 * RefreshToken 발급
 * @param payload RefreshTokenPayload
 * @returns RefreshToken (string)
 */
export const generateRefreshToken = (payload:RefreshTokenPayload): string => {
  return jwt.sign(payload, refreshSecret, refreshTokenOptions);
};

/**
 * AccessToken Payload만 디코딩
 * - 검증 없이 payload만 뽑기 (디버깅용)
 * @param token JWT TOKEN
 * @returns Payload 객체 or null
 */
export const decodeJwtPayload = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  } catch {
    return null;
  }
};

/**
 * RefreshToken 정식 검증 및 payload 추출
 * @param token RefreshToken
 * @returns RefreshTokenPayload
 * @throws 오류 발생시 예외 처리
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, refreshSecret) as RefreshTokenPayload;
  } catch (err) {
    throw new Error('Invalid or expired refresh token');
  }
};
