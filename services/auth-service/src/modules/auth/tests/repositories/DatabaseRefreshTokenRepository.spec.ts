import { DatabaseRefreshTokenRepository } from '../../repositories/implementations/DatabaseRefreshTokenRepository';
import { Repository } from 'typeorm';
import { RefreshToken } from '../../../../entities/RefreshToken';
import { mock } from 'jest-mock-extended';

describe('DatabaseRefreshTokenRepository', () => {
  let ormRepoMock: ReturnType<typeof mock<Repository<RefreshToken>>>;
  let repository: DatabaseRefreshTokenRepository;

  const userId = 'user-uuid-abc';
  const refreshTokenEntity = {
    id: 'refresh-token-id-1',
    token: 'sample.refresh.token',
    userAgent: 'Chrome',
    ip: '192.168.0.1',
    expiredAt: new Date('2025-01-02T10:00:00Z'),
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-01T10:00:00Z'),
    user: {
      uuid: 'user-uuid-abc',
    },
    sessionId: 'session-xyz',
    deviceId: 'device-id-123',
    platform: 'web',
    location: 'Seoul',
    version: '1.0.0',
  } as RefreshToken;

  beforeEach(() => {
    ormRepoMock = mock<Repository<RefreshToken>>();
    repository = new DatabaseRefreshTokenRepository(ormRepoMock);
  });

  describe('save', () => {
    it('RefreshToken을 저장해야 한다', async () => {
      await repository.save(refreshTokenEntity);

      expect(ormRepoMock.save).toHaveBeenCalledWith(refreshTokenEntity);
    });

    it('저장 실패 시 예외를 던져야 한다', async () => {
      (ormRepoMock.save as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(repository.save(refreshTokenEntity)).rejects.toThrow('DB error');
    });
  });

  describe('find', () => {
    it('userId로 토큰을 조회해 변환된 결과를 반환해야 한다', async () => {
      (ormRepoMock.findOne as jest.Mock).mockResolvedValue(refreshTokenEntity);

      const result = await repository.find(userId);

      expect(ormRepoMock.findOne).toHaveBeenCalledWith({
        where: { user: { uuid: userId } },
        order: { expiredAt: 'DESC' },
        relations: ['user'],
      });

      expect(result).toEqual({
        userId,
        sessionId: '',
        userAgent: refreshTokenEntity.userAgent,
        ipAddress: refreshTokenEntity.ip,
        loginAt: Math.floor(refreshTokenEntity.createdAt.getTime() / 1000),
        token: refreshTokenEntity.token,
        expiredAt: refreshTokenEntity.expiredAt.getTime(),
      });
    });

    it('조회된 토큰이 없을 경우 null을 반환해야 한다', async () => {
      (ormRepoMock.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.find(userId);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('userId로 모든 토큰을 삭제해야 한다', async () => {
      await repository.delete(userId);

      expect(ormRepoMock.delete).toHaveBeenCalledWith({ user: { uuid: userId } });
    });

    it('삭제 실패 시 예외를 던져야 한다', async () => {
      (ormRepoMock.delete as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await expect(repository.delete(userId)).rejects.toThrow('Delete failed');
    });
  });
});
