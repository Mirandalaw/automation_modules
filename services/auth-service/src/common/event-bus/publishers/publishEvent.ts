import { getRabbitMQChannel } from '../connection/rabbitmq';
import logger from '../../logger';

/**
 * 이벤트 발행 함수
 * @param exchange 이벤트 익스체인지 이름
 * @param routingKey 라우팅 키
 * @param payload 전달할 데이터
 */
export const connection = async (
  exchange: string,
  routingKey: string,
  payload: Record<string, any>
): Promise<void> => {
  try {
    const ch = await getRabbitMQChannel();
    await ch.assertExchange(exchange, 'topic', { durable: true });

    ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)));

    logger.debug(`[RabbitMQ] 이벤트 발행 - ${exchange}:${routingKey} → ${JSON.stringify(payload)}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`[RabbitMQ] 이벤트 발행 실패 - ${exchange}:${routingKey}`, { error: msg });
    throw err;
  }
};
