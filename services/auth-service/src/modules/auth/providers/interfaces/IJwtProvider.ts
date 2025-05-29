import { AccessTokenPayload, RefreshTokenPayload } from '../../types/jwt';
import { JwtPayload } from 'jsonwebtoken';

export interface ITokenProvider {
  signAccessToken(payload: AccessTokenPayload): string;
  signRefreshToken(payload: RefreshTokenPayload): string;
  decode(token: string): JwtPayload | string | null;
  verifyAccessToken(token: string): JwtPayload;
  verifyRefreshToken(token: string): JwtPayload;
}
