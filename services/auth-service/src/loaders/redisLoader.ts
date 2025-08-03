import redis from '../common/redis';
import logger from '../common/logger';

export const initRedis = async () => {
  try {
    logger.info('[Loader] Redis 초기화 로직 실행 (자동 연결)');
  } catch (error) {
    logger.error('[Loader] Redis 초기화 실패:', error);
    throw error;
  }
};
