import { initDatabase } from './dbLoader';
import { initRedis } from './redisLoader';
import { initEventBus } from './initEventBus';
import { initializeExternalServices } from './externalLoader';

/**
 * auth-service의 모든 의존성 초기화 로직
 */
export const initializeLoaders = async () => {
  await initDatabase();
  await initRedis();
  await initEventBus();
  await initializeExternalServices();
};
