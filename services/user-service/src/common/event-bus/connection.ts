import amqp, { Channel, Connection } from 'amqplib';
import logger from '../logger';

let connection: Connection | null = null;
let channel: Channel | null = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

/**
 * RabbitMQ 연결 및 채널 초기화 (재시도 포함)
 */
export const initRabbitMQ = async (): Promise<void> => {
  if (connection && channel) {
    logger.debug('[RabbitMQ] 이미 연결되어 있음 (재연결 생략)');
    return;
  }

  const maxRetries = 10;
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`[RabbitMQ] 연결 시도 (${attempt}/${maxRetries})`);
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      logger.info('[RabbitMQ] 연결 및 채널 생성 완료');
      break;
    } catch (err) {
      logger.warn(`[RabbitMQ] 연결 실패 (${attempt}) - ${(err as Error).message}`);
      if (attempt === maxRetries) {
        logger.error('[RabbitMQ] 최대 재시도 초과. 종료');
        throw err;
      }
      await delay(2000);
    }
  }

  process.once('SIGINT', async () => {
    logger.info('[RabbitMQ] 종료 시그널 수신, 연결 종료 중...');
    try {
      if (channel) await channel.close();
      if (connection) await connection.close();
      logger.info('[RabbitMQ] 정상적으로 종료됨');
    } catch (err) {
      logger.warn('[RabbitMQ] 종료 중 예외 발생', {
        error: (err as Error).message,
      });
    }
    process.exit(0);
  });
};

/**
 * RabbitMQ 채널 반환 함수 (초기화 확인 포함)
 */
export const getRabbitMQChannel = (): Channel => {
  if (!channel) {
    const errMsg = '[RabbitMQ] 채널이 초기화되지 않았습니다. 먼저 initRabbitMQ()를 호출하세요.';
    logger.error(errMsg);
    throw new Error(errMsg);
  }
  return channel;
};
