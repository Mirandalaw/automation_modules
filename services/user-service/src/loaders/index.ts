import { initializeDatabase } from './dbLoader';
import { initializeExternalDependencies } from './externalLoader';
import { initializeEventSubscribers } from './eventSubscriberLoader';

/**
 * user-service의 모든 의존성 초기화 로직
 * - DB 연결
 * - 외부 서비스 (RabbitMQ 등)
 * - 이벤트 핸들러 등록
 */
export const initializeLoaders = async (): Promise<void> => {
  await initializeDatabase();
  await initializeExternalDependencies();
  await initializeEventSubscribers();
};
