import { initRabbitMQ, getRabbitMQChannel } from '../common/event-bus/connection/rabbitmq';
import logger from '../common/logger';

/**
 * RabbitMQ 초기화 로더
 * - 커넥션 및 채널 연결 보장
 * - 이벤트 발행 또는 구독 전 필수 선행
 */
export const initEventBus = async () => {
  try {
    await initRabbitMQ(); // 연결 + 채널 생성 + 재시도 포함
    await getRabbitMQChannel(); // 실제 채널 확인 (선택적 보강)
    logger.info('[Loader] RabbitMQ 연결 성공');
  } catch (error) {
    logger.error('[Loader] RabbitMQ 연결 실패:', error);
    throw error;
  }
};
