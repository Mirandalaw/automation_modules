import Redis from 'ioredis';
import logger from './logger';
import { RefreshTokenPayload } from '../types/jwt';

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

// /**
//  * RefreshToken Payload를 Redis에 저장
//  * - 구조화된 객체 형태로 저장
//  * @param userId
//  * @param payload
//  */
// export const saveRefreshToken = async (userId: string, payload: RefreshTokenPayload & {
//   token: string,
//   expiredAt: number
// }) => {
//   const key = `refreshToken:${userId}`;
//   await redis.set(key, JSON.stringify(payload), 'EX', 60 * 60 * 24 * 7);
//   logger.info(`[Redis] 토큰 저장 완료 | userId: ${userId}`);
// };
//
// /**
//  * Redis에서 RefreshToken Payload 조회
//  * @param userId
//  */
// export const getRefreshToken = async (userId: string) => {
//   const key = `refreshToken:${userId}`;
//   const data = await redis.get(key);
//   if (!data) {
//     logger.info(`[Redis] 토근 조회 실패 | userId: ${userId}`);
//     return null;
//   }
//
//   logger.info(`[Redis] 토큰 조회 성공 | userId: ${userId}`);
//   return JSON.parse(data) as RefreshTokenPayload & { token: string; expiredAt: number };
// };
//
// /**
//  * Redis에서 RefreshToken 삭제
//  * @param userId
//  */
// export const deleteRefreshToken = async (userId: string) => {
//   const key = `refreshToken:${userId}`;
//   await redis.del(key);
//   logger.info(`[Redis] 토큰 삭제 완료 | userId: ${userId}`);
// };
