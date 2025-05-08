import { AppDataSource } from '../configs/data-source';
import { RefreshToken } from '../entities/RefreshToken';
import { User } from '../entities/User';
import logger from './logger';

/**
 * RefreshToken DB 저장 공통 유틸
 */
export const saveRefreshTokenEntity = async (
  user: User,
  token: string,
  userAgent: string,
  ip: string,
  expiredAt: Date
): Promise<void> => {
  const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

  try {
    const tokenEntity = refreshTokenRepo.create({
      token,
      user,
      userAgent,
      ip,
      expiredAt,
    });

    await refreshTokenRepo.save(tokenEntity);
    logger.info(`[TokenUtil] RefreshToken DB 저장 완료: userId=${user.uuid}`);
  } catch (error) {
    logger.error(`[TokenUtil] RefreshToken 저장 실패: ${(error as Error).message}`);
    throw error;
  }
};