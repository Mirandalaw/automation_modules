import { AccessTokenPayload, RefreshTokenPayload } from '../../types/jwt'

export interface ITokenIssuer {
  signAccessToken(payload: AccessTokenPayload): string;
  signRefreshToken(payload: RefreshTokenPayload): string;
}