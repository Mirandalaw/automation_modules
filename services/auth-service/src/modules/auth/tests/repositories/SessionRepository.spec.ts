import { SessionRepository } from '../../repositories/implementations/SessionRepository';
import redis from '../../../../utils/redis';
import { Session } from '../../entities/Session';

jest.mock('../../../../utils/redis');

describe('SessionRepository', () => {
  const mockSession: Session = {
    id: 'session-id-001',
    user: { uuid: 'user-uuid-001' } as any,
    expiredAt: new Date(Date.now() + 1000 * 60 * 60), // 1시간 후
    userAgent: 'Chrome',
    ipAddress: '127.0.0.1',
    isValid: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let repository: SessionRepository;

  beforeEach(() => {
    repository = new SessionRepository();
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('세션 정보를 Redis에 저장해야 한다', async () => {
      await repository.save(mockSession);

      const key = `session:${mockSession.user.uuid}:${mockSession.id}`;
      const ttl = Math.max(Math.floor((mockSession.expiredAt.getTime() - Date.now()) / 1000), 1);

      expect(redis.set).toHaveBeenCalledWith(key, '1', 'EX', ttl);
    });

    it('Redis 저장 실패 시 예외를 던져야 한다', async () => {
      (redis.set as jest.Mock).mockRejectedValue(new Error('Redis Error'));

      await expect(repository.save(mockSession)).rejects.toThrow('Redis Error');
    });
  });

  describe('invalidateAllByUserId', () => {
    const keys = [
      'session:user-uuid-001:session1',
      'session:user-uuid-001:session2',
    ];

    it('해당 사용자 세션 키들을 모두 삭제해야 한다', async () => {
      (redis.keys as jest.Mock).mockResolvedValue(keys);

      await repository.invalidateAllByUserId('user-uuid-001');

      expect(redis.keys).toHaveBeenCalledWith('session:user-uuid-001:*');
      expect(redis.del).toHaveBeenCalledWith(...keys);
    });

    it('삭제할 키가 없을 경우 redis.del은 호출되지 않아야 한다', async () => {
      (redis.keys as jest.Mock).mockResolvedValue([]);

      await repository.invalidateAllByUserId('user-uuid-001');

      expect(redis.keys).toHaveBeenCalledWith('session:user-uuid-001:*');
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('Redis keys 호출 중 오류 발생 시 예외를 던져야 한다', async () => {
      (redis.keys as jest.Mock).mockRejectedValue(new Error('Redis Scan Error'));

      await expect(repository.invalidateAllByUserId('user-uuid-001')).rejects.toThrow('Redis Scan Error');
    });
  });

  describe('exists', () => {
    it('세션 키가 존재하면 true를 반환해야 한다', async () => {
      (redis.exists as jest.Mock).mockResolvedValue(1);

      const result = await repository.exists('session-id-001', 'user-uuid-001');

      expect(redis.exists).toHaveBeenCalledWith('session:user-uuid-001:session-id-001');
      expect(result).toBe(true);
    });

    it('세션 키가 존재하지 않으면 false를 반환해야 한다', async () => {
      (redis.exists as jest.Mock).mockResolvedValue(0);

      const result = await repository.exists('session-id-002', 'user-uuid-001');

      expect(redis.exists).toHaveBeenCalledWith('session:user-uuid-001:session-id-002');
      expect(result).toBe(false);
    });

    it('Redis 오류 발생 시 false를 반환해야 한다', async () => {
      (redis.exists as jest.Mock).mockRejectedValue(new Error('Redis Error'));

      const result = await repository.exists('session-id-003', 'user-uuid-001');

      expect(redis.exists).toHaveBeenCalledWith('session:user-uuid-001:session-id-003');
      expect(result).toBe(false);
    });
  });
});