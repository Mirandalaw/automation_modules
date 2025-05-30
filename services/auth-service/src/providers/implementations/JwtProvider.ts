import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import logger from '../../common/logger';
import { ITokenProvider } from '../interfaces/IJwtProvider';
import { AccessTokenPayload, RefreshTokenPayload } from '../../types/jwt';

const accessSecret = process.env.JWT_ACCESS_SECRET as Secret;
const refreshSecret = process.env.JWT_REFRESH_SECRET as Secret;

if (!accessSecret || !refreshSecret) {
  logger.error('JWT 시크릿 누락: .env 또는 환경변수 확인');
  throw new Error('JWT secrets are not defined in environment variables.');
}

export class JwtProvider implements ITokenProvider {
  private static accessTokenOptions: SignOptions = {
    expiresIn: (process.env.ACCESS_TOKEN_EXPIRY ?? '15m') as SignOptions['expiresIn'],
  };

  private static refreshTokenOptions: SignOptions = {
    expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || '7d') as SignOptions['expiresIn'],
  };

  signAccessToken(payload: AccessTokenPayload): string {
    logger.debug(`[JwtProvider] accessToken 생성 (expiresIn=${JwtProvider.accessTokenOptions.expiresIn})`);
    return jwt.sign(payload, accessSecret, JwtProvider.accessTokenOptions);
  }

  signRefreshToken(payload: RefreshTokenPayload): string {
    logger.debug(`[JwtProvider] refreshToken 생성 (expiresIn=${JwtProvider.refreshTokenOptions.expiresIn})`);
    return jwt.sign(payload, refreshSecret, JwtProvider.refreshTokenOptions);
  }

  decode(token: string): JwtPayload | string | null {
    return jwt.decode(token);
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, accessSecret) as JwtPayload;
    } catch (err) {
      logger.warn(`[JwtProvider] AccessToken 검증 실패`);
      throw new Error('AccessToken is invalid');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, refreshSecret) as JwtPayload;
    } catch (err) {
      logger.warn(`[JwtProvider] RefreshToken 검증 실패`);
      throw new Error('RefreshToken is invalid');
    }
  }
}