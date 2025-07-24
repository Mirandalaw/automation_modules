import Redis from 'ioredis';
import logger from '../common/logger'; // ✅ Winston 로거 추가

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

export const saveRefreshToken = async (userId: string, token: string) => {
  await redis.set(`refresh:user:${userId}`, token, 'EX', 60 * 60 * 24 * 7); // 7일
  logger.info(`[Redis] 토큰 저장 완료 | userId: ${userId}`);
};

export const getRefreshToken = async (userId: string) => {
  const token = await redis.get(`refresh:user:${userId}`);
  logger.info(`[Redis] 토큰 조회 | userId: ${userId} | 존재 여부: ${!!token}`);
  return token;
};

export const deleteRefreshToken = async (userId: string) => {
  await redis.del(`refresh:user:${userId}`);
  logger.info(`[Redis] 토큰 삭제 완료 | userId: ${userId}`);
};
