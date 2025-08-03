import amqp, { Channel, Connection } from 'amqplib';
import logger from '../../logger';

let connection: Connection | null = null;
let channel: Channel | null = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

/**
 * delay 함수
 */
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * RabbitMQ 연결 및 채널 초기화 (재시도 포함)
 */
export const initRabbitMQ = async (): Promise<void> => {
  if (connection && channel) {
    logger.debug('[RabbitMQ] 이미 연결되어 있음');
    return;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`[RabbitMQ] 연결 시도 (${attempt}/${MAX_RETRIES})`);
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      logger.info('[RabbitMQ] 연결 및 채널 생성 완료');
      break;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.warn(`[RabbitMQ] 연결 실패 (${attempt}) - ${errorMessage}`);

      if (attempt === MAX_RETRIES) {
        logger.error('[RabbitMQ] 최대 재시도 초과. 애플리케이션 종료');
        throw err;
      }

      await delay(RETRY_DELAY_MS);
    }
  }

  process.once('SIGINT', async () => {
    logger.info('[RabbitMQ] 종료 시그널 수신. 연결 정리 중...');
    try {
      if (channel) await channel.close();
      if (connection) await connection.close();
      logger.info('[RabbitMQ] 연결 정상 종료');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.warn('[RabbitMQ] 종료 중 에러', { error: errorMessage });
    } finally {
      process.exit(0);
    }
  });
};

/**
 * 초기화된 채널 반환 함수
 */
export const getRabbitMQChannel = async (): Promise<Channel> => {
  if (!channel) {
    const message = '[RabbitMQ] 채널이 초기화되지 않았습니다. 먼저 initRabbitMQ()를 호출하세요.';
    logger.error(message);
    throw new Error(message);
  }
  return channel;
};
