import { AppDataSource } from '../configs/data-source';
import { Session } from '../entities/Session';
import logger from '../utils/logger';

/**
 * 만료된 세션을 정리하는 작업
 */
export const cleanupExpiredSessions = async () => {
  const sessionRepository = AppDataSource.getRepository(Session);
  logger.info('[SessionCleanup] 만료 세션 정리 작업 시작');

  try {
    const result = await sessionRepository
      .createQueryBuilder()
      .delete()
      .where('expiredAt < :now', { now: new Date() })
      .execute();

    logger.info(`[SessionCleanup] 만료된 세션 ${result.affected}개 삭제 완료`);
  } catch (error) {
    logger.error(`[SessionCleanup] 세션 정리 작업 실패: ${(error as Error).message}`);
  }
};
