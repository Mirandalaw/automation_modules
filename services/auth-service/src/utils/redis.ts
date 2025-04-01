import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT) || 6379,
  retryStrategy: (times) => {
    console.log(`[Redis Retry] ${times}번 시도 중...`);
    return Math.min(times * 100, 2000); // 최대 2초 대기 후 재시도
  },
});

redis.on('error', (err) => {
  console.error('[Redis Error]', err.message);
});

export default redis;

export const saveRefreshToken = async (userId: string, token: string) => {
  await redis.set(`refresh:user:${userId}`, token, 'EX', 60 * 60 * 24 * 7); // 7일
};

export const getRefreshToken = async (userId: string) => {
  return await redis.get(`refresh:user:${userId}`);
};

export const deleteRefreshToken = async (userId: string) => {
  await redis.del(`refresh:user:${userId}`);
};
