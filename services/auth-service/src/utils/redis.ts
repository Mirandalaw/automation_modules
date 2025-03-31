import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
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
