import { ConsumeMessage } from 'amqplib';
import { initRabbitMQ, getRabbitMQChannel } from './connection/rabbitmq';
import logger from '../logger';

/**
 * RabbitMQ 이벤트 구독 유틸
 * @param exchangeName Exchange 이름 (예: 'user')
 * @param routingKey Routing key (예: 'user.created')
 * @param queueName Queue 이름 (예: 'user.created.queue')
 * @param handler 메시지 처리 로직
 */
export const subscribeToEvent = async <T>(
  exchangeName: string,
  routingKey: string,
  queueName: string,
  handler: (payload: T) => Promise<void>
): Promise<void> => {
  try {
    await initRabbitMQ();
    const channel = await getRabbitMQChannel();

    // 1. Exchange 선언
    await channel.assertExchange(exchangeName, 'topic', { durable: true });

    // 2. Queue 선언
    await channel.assertQueue(queueName, { durable: true });

    // 3. 바인딩
    await channel.bindQueue(queueName, exchangeName, routingKey);

    // 4. 메시지 consume
    await channel.consume(queueName, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString()) as T;
        await handler(payload);
        channel.ack(msg);
      } catch (err) {
        logger.error('[Subscriber] 메시지 처리 실패', {
          error: (err as Error).message,
          stack: (err as Error).stack,
          content: msg.content.toString(),
        });
        channel.nack(msg, false, false); // requeue = false
      }
    });

    logger.info(`[Subscriber] 구독 시작: [${exchangeName}] ${routingKey} → ${queueName}`);
  } catch (err) {
    logger.error('[Subscriber] 이벤트 구독 실패', {
      error: (err as Error).message,
      stack: (err as Error).stack,
    });
    throw err;
  }
};