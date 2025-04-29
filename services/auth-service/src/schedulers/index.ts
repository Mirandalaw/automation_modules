import cron from 'node-cron';
import { cleanupExpiredSessions } from './sessionCleaner';
import logger from '../utils/logger';

/**
 * 스케줄러 초기화
 */
export const initializeSchedulers = () => {
  logger.info('[Scheduler] 스케줄러 초기화 시작');

  // 매일 새벽 3시에 만료 세션 정리
  cron.schedule('0 3 * * *', async () => {
    logger.info('[Scheduler] 매일 3시: 만료 세션 정리 작업 실행');
    await cleanupExpiredSessions();
  });

  logger.info('[Scheduler] 만료 세션 정리 스케줄 등록 완료');
};
