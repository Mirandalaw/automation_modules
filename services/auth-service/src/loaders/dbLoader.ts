import { AppDataSource } from '../configs/data-source';
import logger from '../common/logger';

export const initDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('[Loader] 데이터베이스 연결 성공');
  } catch (error) {
    logger.error('[Loader] 데이터베이스 연결 실패:', error);
    throw error;
  }
};
