// import { initRedis } from './redisLoader';
import logger from '../common/logger';

/**
 * 외부 의존성 초기화 로더 (RabbitMQ 제외)
 * - Redis 등 외부 서비스 연결을 담당
 */
export const initializeExternalDependencies = async (): Promise<void> => {
  try {
    // await initRedis();
    logger.info('[Loader:External] 외부 의존성 초기화 완료');
  } catch (error) {
    logger.error('[Loader:External] 외부 의존성 초기화 실패', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
};
