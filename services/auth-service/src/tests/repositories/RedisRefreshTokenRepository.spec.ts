import { RedisRefreshTokenRepository } from '../../repositories/implementations/RedisRefreshTokenRepository';
import redis from '../../common/redis';
import { RefreshTokenPayload } from '../../types/jwt';

jest.mock('../../common/redis');

describe('RedisRefreshTokenRepository', () => {
  const repo = new RedisRefreshTokenRepository();

  const userId = 'user-uuid-123';
  const payload: RefreshTokenPayload & { token: string; expiredAt: number } = {
    userId,
    sessionId: 'session-abc',
    userAgent: 'Chrome',
    ipAddress: '127.0.0.1',
    loginAt: Math.floor(Date.now() / 1000),
    token: 'mock.token.value',
    expiredAt: Date.now() + 60 * 60 * 1000, // 1시간 후
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('Redis에 RefreshToken을 저장해야 한다', async () => {
      await repo.save(userId, payload);

      const expectedKey = `refreshToken:${userId}`;
      const expectedTTL = Math.max(Math.floor((payload.expiredAt - Date.now()) / 1000), 60);

      expect(redis.set).toHaveBeenCalledWith(
        expectedKey,
        JSON.stringify(payload),
        'EX',
        expectedTTL,
      );
    });

    it('Redis 저장 실패 시 예외를 던져야 한다', async () => {
      (redis.set as jest.Mock).mockRejectedValue(new Error('Redis set error'));

      await expect(repo.save(userId, payload)).rejects.toThrow('Redis set error');
    });
  });

  describe('find', () => {
    it('Redis에서 저장된 토큰을 찾아서 파싱 후 반환해야 한다', async () => {
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(payload));

      const result = await repo.find(userId);

      expect(redis.get).toHaveBeenCalledWith(`refreshToken:${userId}`);
      expect(result).toEqual(payload);
    });

    it('Redis에서 값이 없을 경우 null을 반환해야 한다', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);

      const result = await repo.find(userId);

      expect(result).toBeNull();
    });

    it('JSON 파싱 중 오류 발생 시 null을 반환해야 한다', async () => {
      (redis.get as jest.Mock).mockResolvedValue('INVALID_JSON');

      const result = await repo.find(userId);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('Redis에서 해당 키를 삭제해야 한다', async () => {
      await repo.delete(userId);

      expect(redis.del).toHaveBeenCalledWith(`refreshToken:${userId}`);
    });

    it('Redis 삭제 실패 시 예외를 던져야 한다', async () => {
      (redis.del as jest.Mock).mockRejectedValue(new Error('Redis del error'));

      await expect(repo.delete(userId)).rejects.toThrow('Redis del error');
    });
  });
});
