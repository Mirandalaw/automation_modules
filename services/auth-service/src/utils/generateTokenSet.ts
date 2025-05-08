import { User } from '../entities/User';
import {Session} from '../entities/Session';
import { AccessTokenPayload, RefreshTokenPayload } from '../types/jwt';
import { generateAccessToken, generateRefreshToken } from './jwt';
import { saveRefreshToken } from './redis';
import logger from './logger';
import { CustomError } from './CustomError';
export const generateTokenSet = async (user:User, session: Session)=>{
  const now = Math.floor(Date.now() / 1000);

  const accessTokenPayload : AccessTokenPayload = {
    userId : user.uuid,
    roles : user.roles?.map(r=>r.name) || [],
    issuedAt : now,
    expiresAt : now + 60 * 15,
  };

  const refreshTokenPayload : RefreshTokenPayload = {
    userId : user.uuid,
    sessionId : session.id,
    userAgent : session.userAgent,
    ipAddress : session.ipAddress,
    loginAt : now,
  };

  const accessToken = generateAccessToken(accessTokenPayload);
  const refreshToken = generateRefreshToken(refreshTokenPayload);
  try{
    await saveRefreshToken(user.uuid, {
      ...refreshTokenPayload,
      token : refreshToken,
      expiredAt : session.expiredAt.getTime(),
    });

  }catch (error) {
    logger.error(`[generateTokenSet] Redis 저장 실패: ${error.message}`);
    throw new CustomError(500, '토큰 저장 중 오류 발생', error.message);
  }
  return {
    accessToken,
    refreshToken,
  };
}