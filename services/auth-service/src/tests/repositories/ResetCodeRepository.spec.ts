import { ResetCodeRepository } from '../../repositories/implementations/ResetCodeRepository';
import redis from '../../common/redis';

jest.mock('../../common/redis');

describe('ResetCodeRepository', () => {
  const repository = new ResetCodeRepository();
  const email = 'test@example.com';
  const code = '123456';
  const key = `resetCode:${email}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('Redis에 인증 코드를 TTL과 함께 저장한다', async () => {
      const mockSet = redis.set as jest.Mock;

      await repository.save(email, code, 300);

      expect(mockSet).toHaveBeenCalledWith(key, code, 'EX', 300);
    });
  });

  describe('find', () => {
    it('Redis에서 인증 코드를 조회하여 반환한다 (있을 경우)', async () => {
      const mockGet = redis.get as jest.Mock;
      mockGet.mockResolvedValue(code);

      const result = await repository.find(email);

      expect(result).toBe(code);
      expect(mockGet).toHaveBeenCalledWith(key);
    });

    it('Redis에서 인증 코드가 없을 경우 null을 반환한다', async () => {
      const mockGet = redis.get as jest.Mock;
      mockGet.mockResolvedValue(null);

      const result = await repository.find(email);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('Redis에서 인증 코드를 삭제한다', async () => {
      const mockDel = redis.del as jest.Mock;

      await repository.delete(email);

      expect(mockDel).toHaveBeenCalledWith(key);
    });
  });
});
