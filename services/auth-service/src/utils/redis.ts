import Redis from 'ioredis';
import logger from './logger';
import { RefreshTokenPayload } from '../modules/auth/types/jwt';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT) || 6379,
  retryStrategy: (times) => {
    logger.warn(`[Redis Retry] ${times}번 시도 중...`);
    return Math.min(times * 100, 2000); // 최대 2초 대기 후 재시도
  },
});

redis.on('connect', () => {
  logger.info('[Redis] 연결 성공');
});

redis.on('error', (err) => {
  logger.error({ message: '[Redis Error]', error: err.message });
});

export default redis;