import { AppDataSource } from '../configs/data-source';
import logger from '../utils/logger';

/**
 * Database 연결 함수
 * - TypeORM을 통해 DB를 초기화하고 연결합니다.
 * - 실패할 경우 에러를 로깅하고 프로세스를 종료합니다.
 */
export const connectDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('[Database] 연결 성공');
  } catch (error) {
    logger.error(`[Database] 연결 실패: ${(error as Error).message}`);
    process.exit(1); // 연결 실패 시 서버 프로세스를 종료
  }
};
