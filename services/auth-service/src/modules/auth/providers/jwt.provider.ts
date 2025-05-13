import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import logger from '../../../utils/logger';
import { AccessTokenPayload, RefreshTokenPayload } from '../../../types/jwt';

const accessSecret = process.env.JWT_ACCESS_SECRET as Secret;
const refreshSecret = process.env.JWT_REFRESH_SECRET as Secret;

if (!accessSecret || !refreshSecret) {
  logger.error('JWT 시크릿 누락: .env 또는 환경변수 확인');
  throw new Error('JWT secrets are not defined in environment variables.');
}

export class JwtProvider {
  private static accessTokenOptions: SignOptions = { expiresIn: (process.env.ACCESS_TOKEN_EXPIRY ?? '15m') as SignOptions['expiresIn'] };
  private static refreshTokenOptions: SignOptions = { expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || '7d') as SignOptions['expiresIn'] };

  /**
   * AccessToken 발급
   * @param payload AccessTokenPayload
   * @returns AccessToken (string)
   */
  static signAccessToken(payload: AccessTokenPayload): string {
    logger.debug(`[JwtProvider] accessToken 생성 (expiresIn=${this.accessTokenOptions.expiresIn}`);
    return jwt.sign(payload, accessSecret, JwtProvider.accessTokenOptions);
  }

  /**
   * RefreshToken 발급
   * @param payload RefreshTokenPayload
   * @returns RefreshToken (string)
   */
  static signRefreshToken(payload: RefreshTokenPayload): string {
    logger.debug(`[JwtProvider] refreshToken 생성 (expiresIn=${this.refreshTokenOptions.expiresIn}`);
    return jwt.sign(payload, refreshSecret, JwtProvider.refreshTokenOptions);
  }

  /**
   * 디버깅용 decode (jwt.decode 래핑)
   */
  static decode(token: string): jwt.JwtPayload | string | null {
    return jwt.decode(token);
  }
}
