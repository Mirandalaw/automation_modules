import logger from '../common/logger';

import { AppDataSource } from '../configs/data-source';

import { GradeService } from '../services/GradeService';

import { initRabbitMQ } from '../common/event-bus/connection';
import { subscribeUserCreated } from '../subscribers/UserCreatedSubscriber';

import { UserRepository } from '../repositories/implementations/UserRepository';
import { UserStatsRepository } from '../repositories/implementations/UserStatsRepository';
import { UserProfileRepository } from '../repositories/implementations/UserProfileRepository';

import { UserProfile } from '../entities/UserProfile';
import { UserStats } from '../entities/UserStats';
import { User } from '../entities/User';

/**
 * RabbitMQ 이벤트 핸들러 등록 로더
 */
export const initializeEventSubscribers = async (): Promise<void> => {
  try {
    // 1. RabbitMQ 연결
    await initRabbitMQ();
    logger.info('[Loader:EventBus] RabbitMQ 연결 성공');

    // 2. GradeService 의존성 구성
    const userRepo = new UserRepository(AppDataSource.getRepository(User));
    const userStatsRepo = new UserStatsRepository(AppDataSource.getRepository(UserStats));
    const userProfileRepo = new UserProfileRepository(AppDataSource.getRepository(UserProfile));
    const gradeService = new GradeService(userStatsRepo, userRepo);


    // 3. 이벤트 핸들러 등록
    await subscribeUserCreated(gradeService, userRepo,userProfileRepo);
    logger.info('[Loader:EventBus] user.created 이벤트 수신 대기 시작');
  } catch (error) {
    logger.error('[Loader:EventBus] 이벤트 수신 핸들러 초기화 실패', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
};