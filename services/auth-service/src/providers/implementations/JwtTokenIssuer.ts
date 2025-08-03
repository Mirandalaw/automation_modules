import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { ITokenIssuer } from '../interfaces/ITokenIssuer';
import { AccessTokenPayload, RefreshTokenPayload } from '../../types/jwt';
import logger from '../../common/logger';
import dotenv from 'dotenv';

dotenv.config();

const accessSecret = process.env.JWT_ACCESS_SECRET as Secret;
const refreshSecret = process.env.JWT_REFRESH_SECRET as Secret;

if (!accessSecret || !refreshSecret) {
  logger.error('JWT 시크릿 누락: .env 또는 환경변수 확인');
  throw new Error('JWT secrets are not defined in environment variables.');
}

const accessTokenOptions: SignOptions = {
  expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRY ?? '900', 10),
};

const refreshTokenOptions: SignOptions = {
  expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY ?? '604800', 10),
};

/**
 * JwtTokenIssuer
 * - ITokenIssuer 인터페이스를 구현하는 JWT 발급기
 * - AccessToken, RefreshToken 발급 책임만을 가짐 (SRP 준수)
 */
export class JwtTokenIssuer implements ITokenIssuer {
  signAccessToken(payload: AccessTokenPayload): string {
    logger.debug('[JwtTokenIssuer] AccessToken 발급');
    return jwt.sign(payload, accessSecret, accessTokenOptions);
  }

  signRefreshToken(payload: RefreshTokenPayload): string {
    logger.debug('[JwtTokenIssuer] RefreshToken 발급');
    return jwt.sign(payload, refreshSecret, refreshTokenOptions);
  }
}