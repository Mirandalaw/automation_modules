import { getRabbitMQChannel } from './connection/rabbitmq';
import logger from '../logger';

/**
 * 이벤트 구독 및 핸들러 실행
 * @param exchange 익스체인지 이름
 * @param routingKey 라우팅 키
 * @param queueName 큐 이름
 * @param handler 메시지 처리 콜백
 */
export const subscribeToEvent = async (
  exchange: string,
  routingKey: string,
  queueName: string,
  handler: (payload: any) => Promise<void>
) => {
  const ch = getRabbitMQChannel();
  await ch.assertExchange(exchange, 'topic', { durable: true });
  await ch.assertQueue(queueName, { durable: true });
  await ch.bindQueue(queueName, exchange, routingKey);

  await ch.consume(queueName, async (msg) => {
    if (msg) {
      const payload = JSON.parse(msg.content.toString());
      logger.debug(`[Event-Subscribe] 수신 - ${exchange}:${routingKey} → ${JSON.stringify(payload)}`);

      try {
        await handler(payload);
      } catch (e) {
        logger.error('[RabbitMQ] 핸들러 처리 중 오류 발생:', e);
      }
      ch.ack(msg);
    }
  });
};