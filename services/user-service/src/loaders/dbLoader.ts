import { AppDataSource } from '../configs/data-source';
import logger from '../common/logger';

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info('[Loader:DB] 개체 데이터베이스 연결 성공');
  } catch (error) {
    logger.error('[Loader:DB] 연결 실패:', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
};
