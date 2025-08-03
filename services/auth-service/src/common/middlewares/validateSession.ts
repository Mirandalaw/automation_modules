import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../../configs/data-source';
import { Session } from '../../entities/Session';
import { CustomError } from '../errors';
import logger from '../logger';
import { getRefreshToken, saveRefreshToken } from '../redis';

/**
 * 세션 유효성 검증 및 자동 연장 미들웨어
 *
 * - 요청 시 유저 세션 유효 여부를 확인합니다.
 * - 세션이 만료 직전이면 자동으로 만료일을 연장합니다.
 * - Redis에 저장된 RefreshToken도 함께 만료일을 연장합니다.
 * - 유효하지 않거나 만료된 세션은 401 에러를 반환합니다.
 */
export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    logger.warn('[ValidateSession] 요청에 userId가 없습니다.');
    return res.status(401).json({ message: 'Unauthorized: 사용자 인증 실패' });
  }

  const sessionRepo = AppDataSource.getRepository(Session);

  try {
    // 현재 로그인한 사용자의 최신 유효 세션 조회
    const session = await sessionRepo.findOne({
      where: { user: { uuid: userId }, isValid: true },
      order: { expiredAt: 'DESC' },
    });

    if (!session) {
      logger.warn(`[ValidateSession] 유효한 세션이 없습니다. userId=${userId}`);
      throw new CustomError(401, '로그인 세션이 존재하지 않습니다.');
    }

    const now = new Date();
    const expiredAt = session.expiredAt;

    // 세션 만료 여부 검증
    if (expiredAt.getTime() < now.getTime()) {
      logger.warn(`[ValidateSession] 세션이 만료되었습니다. userId=${userId}`);

      // 세션 무효화
      session.isValid = false;
      await sessionRepo.save(session);

      throw new CustomError(401, '세션이 만료되었습니다. 다시 로그인 해주세요.');
    }

    // 세션 만료 임박 시 자동 연장
    const timeDiffMs = expiredAt.getTime() - now.getTime();
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60); // 남은 시간 (시간 단위)

    // 남은 시간이 24시간 이하인 경우
    if (timeDiffHours <= 24) {
      const newExpiredAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7일

      // 세션 만료 시간 연장
      session.expiredAt = newExpiredAt;
      await sessionRepo.save(session);

      // Redis의 RefreshToken도 만료 시간 연장
      const redisToken = await getRefreshToken(userId);
      if (redisToken) {
        await saveRefreshToken(userId, {
          ...redisToken,
          expiredAt: newExpiredAt.getTime(),
        });
        logger.info(`[ValidateSession] Redis 토큰 만료 시간 연장 완료: userId=${userId}`);
      }

      logger.info(`[ValidateSession] 세션 만료 시간 연장 완료: userId=${userId} | newExpiredAt=${newExpiredAt.toISOString()}`);
    } else {
      logger.info(`[ValidateSession] 세션이 유효합니다. userId=${userId} | 남은 시간=${timeDiffHours.toFixed(2)}h`);
    }

    next();
  } catch (error) {
    logger.error(`[ValidateSession] 세션 검증 실패: ${(error as Error).message}`);
    return res.status(401).json({ message: 'Session validation failed' });
  }
};
